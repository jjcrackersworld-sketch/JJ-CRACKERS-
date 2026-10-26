import { NextResponse } from 'next/server';
import { requireAdmin as requireAdminSecure, adminAuthHeaders as getAdminAuthHeaders, verifyAdminToken } from './security/auth';
import { RiskLevel } from './security/config';

export { adminAuthHeaders, verifyAdminToken } from './security/auth';

/**
 * Server-side admin authentication guard.
 * Validates HMAC cryptographic tokens and legacy tokens.
 *
 * Returns `null` when authorized, or a 401/403 NextResponse to short-circuit.
 */
export function requireAdmin(req: Request, requiredRiskLevel: RiskLevel = 'LOW'): NextResponse | null {
  const result = requireAdminSecure(req, requiredRiskLevel);
  if (!result.authorized) {
    return result.response;
  }
  return null;
}
