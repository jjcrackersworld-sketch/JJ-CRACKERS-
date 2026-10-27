import { NextResponse } from 'next/server';
import {
  getClientIp,
  checkAuthRateLimit,
  recordAuthFailure,
  recordAuthSuccess,
  createAdminToken,
} from '@/lib/security/auth';
import { writeAuditRecord } from '@/lib/security/audit';
import { dispatchSecurityAlert } from '@/lib/security/alerts';

export async function POST(req: Request) {
  const ip = getClientIp(req);

  // 1. Rate Limiting Check
  const rateLimit = checkAuthRateLimit(ip);
  if (!rateLimit.allowed) {
    await dispatchSecurityAlert({
      alertType: 'RATE_LIMIT_LOCKOUT',
      severity: 'HIGH',
      message: `Admin login rate limit triggered. IP locked out for ${rateLimit.waitSec} seconds.`,
      ip,
    });

    return NextResponse.json(
      {
        error: `Too many failed attempts. Account locked for ${rateLimit.waitSec} seconds.`,
        code: 'RATE_LIMITED',
        retryAfter: rateLimit.waitSec,
      },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { password } = body;
    const adminPassword = process.env.ADMIN_PASSWORD || 'jjcrackers@admin2024';

    if (password === adminPassword) {
      recordAuthSuccess(ip);

      // Generate HMAC-SHA256 Signed Admin Session Token
      const token = createAdminToken('super_admin', ip);

      // Non-blocking Audit Record (executes in background without delaying admin login)
      writeAuditRecord({
        timestamp: new Date().toISOString(),
        actor: 'admin',
        action: 'SECURITY_CONFIG_UPDATE',
        riskLevel: 'LOW',
        targetIds: ['admin-session'],
        ip,
        status: 'SUCCESS',
        details: 'Admin logged in successfully',
      }).catch((err) => console.error('Background login audit error:', err));

      return NextResponse.json({
        success: true,
        token,
        expiresIn: 4 * 60 * 60, // 4 hours
      });
    }

    // Password Mismatch
    recordAuthFailure(ip);

    await writeAuditRecord({
      timestamp: new Date().toISOString(),
      actor: 'anonymous',
      action: 'SECURITY_CONFIG_UPDATE',
      riskLevel: 'MEDIUM',
      targetIds: ['admin-session'],
      ip,
      status: 'BLOCKED',
      details: 'Failed admin login attempt (invalid password)',
    });

    return NextResponse.json(
      { error: 'Invalid admin credentials', code: 'INVALID_CREDENTIALS' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Admin auth error:', error);
    return NextResponse.json({ error: 'Authentication processing failed' }, { status: 500 });
  }
}
