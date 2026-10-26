import { NextResponse } from 'next/server';
import { requireAdmin, getClientIp } from '@/lib/security/auth';
import { createApprovalChallenge, getPendingApprovals } from '@/lib/security/approvals';
import { writeAuditRecord, getRecentAuditLogs } from '@/lib/security/audit';
import { SensitiveAction, RiskLevel } from '@/lib/security/config';

export const dynamic = 'force-dynamic';

// GET — List pending approvals or recent audit logs
export async function GET(req: Request) {
  const auth = requireAdmin(req, 'LOW');
  if (!auth.authorized) return auth.response;

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');

  if (type === 'audit') {
    const limit = parseInt(searchParams.get('limit') || '50');
    const logs = await getRecentAuditLogs(limit);
    return NextResponse.json({ logs });
  }

  const pending = getPendingApprovals();
  return NextResponse.json({ approvals: pending });
}

// POST — Create a server-side approval challenge for a sensitive change
export async function POST(req: Request) {
  const auth = requireAdmin(req, 'LOW');
  if (!auth.authorized) return auth.response;

  try {
    const ip = auth.ip;
    const body = await req.json();
    const { action, riskLevel, targetIds, payload, previewSummary, changesPreview } = body;

    if (!action || !payload) {
      return NextResponse.json({ error: 'Missing action or payload parameters' }, { status: 400 });
    }

    const challenge = createApprovalChallenge({
      action: action as SensitiveAction,
      riskLevel: (riskLevel as RiskLevel) || 'MEDIUM',
      targetIds: Array.isArray(targetIds) ? targetIds : [],
      payload,
      previewSummary: previewSummary || `Approval challenge for ${action}`,
      changesPreview: changesPreview || null,
      requestedBy: auth.session.role,
      ip,
    });

    await writeAuditRecord({
      timestamp: new Date().toISOString(),
      actor: auth.session.role,
      action: action as SensitiveAction,
      riskLevel: (riskLevel as RiskLevel) || 'MEDIUM',
      targetIds: challenge.targetIds,
      approvalId: challenge.approvalId,
      ip,
      status: 'SUCCESS',
      details: `Approval challenge initiated: ${challenge.previewSummary}`,
    });

    return NextResponse.json({
      success: true,
      challenge: {
        approvalId: challenge.approvalId,
        challengeToken: challenge.challengeToken,
        expiresAt: challenge.expiresAt,
        previewSummary: challenge.previewSummary,
        riskLevel: challenge.riskLevel,
        changesPreview: challenge.changesPreview,
      },
    });
  } catch (err: any) {
    console.error('Error creating approval challenge:', err);
    return NextResponse.json({ error: err.message || 'Failed to create approval challenge' }, { status: 500 });
  }
}
