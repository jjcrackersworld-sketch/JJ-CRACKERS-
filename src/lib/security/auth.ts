import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { SECURITY_CONFIG, RiskLevel } from './config';

// Server-side secrets
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'jjcrackers@admin2024';
const HMAC_SECRET = process.env.SECURITY_HMAC_SECRET || crypto.createHash('sha256').update(ADMIN_PASSWORD + ':jjcrackers:salt:2026').digest('hex');

// In-Memory Rate Limiter (Sliding Window)
interface RateLimitEntry {
  attempts: number;
  resetAt: number;
  lockedUntil?: number;
}
const authAttemptsMap = new Map<string, RateLimitEntry>();
const apiRequestMap = new Map<string, { count: number; resetAt: number }>();

/**
 * Extracts client IP from request headers
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const parts = forwarded.split(',');
    return parts[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  const cfIp = req.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp.trim();
  return '127.0.0.1';
}

/**
 * Rate limit login attempts to prevent brute-force attacks
 */
export function checkAuthRateLimit(ip: string): { allowed: boolean; waitSec?: number } {
  const now = Date.now();
  const entry = authAttemptsMap.get(ip);

  if (!entry) {
    return { allowed: true };
  }

  if (entry.lockedUntil && entry.lockedUntil > now) {
    const waitSec = Math.ceil((entry.lockedUntil - now) / 1000);
    return { allowed: false, waitSec };
  }

  if (entry.resetAt <= now) {
    authAttemptsMap.delete(ip);
    return { allowed: true };
  }

  if (entry.attempts >= SECURITY_CONFIG.RATE_LIMIT.AUTH_MAX_ATTEMPTS) {
    entry.lockedUntil = now + SECURITY_CONFIG.RATE_LIMIT.AUTH_WINDOW_MS;
    const waitSec = Math.ceil(SECURITY_CONFIG.RATE_LIMIT.AUTH_WINDOW_MS / 1000);
    return { allowed: false, waitSec };
  }

  return { allowed: true };
}

/**
 * Records a failed login attempt
 */
export function recordAuthFailure(ip: string): void {
  const now = Date.now();
  const entry = authAttemptsMap.get(ip) || {
    attempts: 0,
    resetAt: now + SECURITY_CONFIG.RATE_LIMIT.AUTH_WINDOW_MS,
  };

  entry.attempts += 1;
  authAttemptsMap.set(ip, entry);
}

/**
 * Clears rate-limit records on successful login
 */
export function recordAuthSuccess(ip: string): void {
  authAttemptsMap.delete(ip);
}

export interface AdminSession {
  tokenId: string;
  role: 'super_admin' | 'catalog_admin';
  issuedAt: number;
  expiresAt: number;
  lastReauthAt: number;
  ip: string;
}

/**
 * Generates an HMAC-SHA256 signed admin session token.
 * Contains: tokenId, role, issuedAt, expiresAt, and signature.
 * NEVER stores the plain password.
 */
export function createAdminToken(role: 'super_admin' | 'catalog_admin' = 'super_admin', ip: string = '127.0.0.1'): string {
  const now = Date.now();
  const tokenId = crypto.randomBytes(16).toString('hex');
  const session: AdminSession = {
    tokenId,
    role,
    issuedAt: now,
    expiresAt: now + SECURITY_CONFIG.SESSION.TOKEN_TTL_MS,
    lastReauthAt: now,
    ip,
  };

  const payloadStr = JSON.stringify(session);
  const payloadB64 = Buffer.from(payloadStr).toString('base64url');
  const signature = crypto
    .createHmac('sha256', HMAC_SECRET)
    .update(payloadB64)
    .digest('base64url');

  return `jjsec.${payloadB64}.${signature}`;
}

/**
 * Validates an admin token. Supports both new jjsec HMAC tokens and legacy tokens during transition.
 */
export function verifyAdminToken(token: string): { valid: boolean; session?: AdminSession; error?: string } {
  if (!token) {
    return { valid: false, error: 'Token missing' };
  }

  // 1. New HMAC Signed Token
  if (token.startsWith('jjsec.')) {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, error: 'Malformed token structure' };
    }

    const [, payloadB64, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', HMAC_SECRET)
      .update(payloadB64)
      .digest('base64url');

    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSig);
    // Safe comparison: verify equal length first, then constant-time compare
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return { valid: false, error: 'Invalid cryptographic signature' };
    }

    try {
      const sessionStr = Buffer.from(payloadB64, 'base64url').toString('utf8');
      const session: AdminSession = JSON.parse(sessionStr);

      if (Date.now() > session.expiresAt) {
        return { valid: false, error: 'Session expired' };
      }

      return { valid: true, session };
    } catch {
      return { valid: false, error: 'Corrupt token payload' };
    }
  }

  // 2. Legacy Base64 Token Format (admin:<ts>:<password>) for backward compatibility
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const parts = decoded.split(':');
    if (parts.length === 3 && parts[0] === 'admin') {
      const ts = Number(parts[1]);
      const password = parts[2];
      if (ts && password === ADMIN_PASSWORD) {
        if (Date.now() - ts > SECURITY_CONFIG.SESSION.TOKEN_TTL_MS) {
          return { valid: false, error: 'Session expired' };
        }
        return {
          valid: true,
          session: {
            tokenId: 'legacy-' + ts,
            role: 'super_admin',
            issuedAt: ts,
            expiresAt: ts + SECURITY_CONFIG.SESSION.TOKEN_TTL_MS,
            lastReauthAt: ts,
            ip: 'unknown',
          },
        };
      }
    }
  } catch {
    // Ignore and reject below
  }

  return { valid: false, error: 'Invalid admin credentials' };
}

/**
 * Server-side Admin Guard.
 * Inspects Authorization: Bearer <token> or X-Admin-Token header.
 * Optionally enforces recent re-authentication for HIGH / CRITICAL risk tiers.
 */
export function requireAdmin(
  req: Request,
  requiredRiskLevel: RiskLevel = 'LOW'
): { authorized: true; session: AdminSession; ip: string } | { authorized: false; response: NextResponse; ip: string } {
  const ip = getClientIp(req);
  const authHeader = req.headers.get('authorization') || '';
  const tokenFromHeader = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const token = tokenFromHeader || req.headers.get('x-admin-token');

  if (!token) {
    return {
      authorized: false,
      ip,
      response: NextResponse.json(
        { error: 'Unauthorized: Admin authentication token required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      ),
    };
  }

  const verification = verifyAdminToken(token);
  if (!verification.valid || !verification.session) {
    return {
      authorized: false,
      ip,
      response: NextResponse.json(
        { error: `Unauthorized: ${verification.error || 'Invalid session'}`, code: 'AUTH_INVALID' },
        { status: 401 }
      ),
    };
  }

  const session = verification.session;

  // Re-authentication requirement for HIGH or CRITICAL operations
  if (requiredRiskLevel === 'HIGH' || requiredRiskLevel === 'CRITICAL') {
    const timeSinceReauth = Date.now() - (session.lastReauthAt || session.issuedAt);
    if (timeSinceReauth > SECURITY_CONFIG.SESSION.REAUTH_WINDOW_MS) {
      return {
        authorized: false,
        ip,
        response: NextResponse.json(
          {
            error: 'Recent re-authentication required for high-impact operation. Please confirm password.',
            code: 'REAUTH_REQUIRED',
            windowMs: SECURITY_CONFIG.SESSION.REAUTH_WINDOW_MS,
          },
          { status: 403 }
        ),
      };
    }
  }

  return { authorized: true, session, ip };
}

/**
 * Helper to generate authorization headers for client-side fetches
 */
export function adminAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('jj-admin-token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}
