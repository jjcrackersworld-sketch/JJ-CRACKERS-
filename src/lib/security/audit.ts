import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { SensitiveAction, RiskLevel } from './config';

export interface AuditRecord {
  id?: string;
  timestamp: string;
  actor: string;
  action: SensitiveAction;
  riskLevel: RiskLevel;
  targetIds: string[];
  beforeState?: any;
  afterState?: any;
  approvalId?: string;
  ip: string;
  status: 'SUCCESS' | 'BLOCKED' | 'FAILED';
  details?: string;
}

const LOCAL_AUDIT_LOG_FILE = path.join(process.cwd(), 'scratch', 'security-audit.log');

/**
 * Ensures the scratch directory exists for local audit persistence
 */
function ensureLocalLogDir() {
  const dir = path.dirname(LOCAL_AUDIT_LOG_FILE);
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch {}
  }
}

/**
 * Writes an immutable audit record to both database and durable append-only file
 */
export async function writeAuditRecord(record: AuditRecord): Promise<boolean> {
  const auditEntry = {
    ...record,
    id: record.id || `audit_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    timestamp: record.timestamp || new Date().toISOString(),
  };

  // 1. Local append-only durable log
  try {
    ensureLocalLogDir();
    const logLine = JSON.stringify(auditEntry) + '\n';
    fs.appendFileSync(LOCAL_AUDIT_LOG_FILE, logLine, 'utf8');
  } catch (err) {
    console.error('[AUDIT ERROR] Failed to write local audit file:', err);
  }

  // 2. Database audit record (Supabase)
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Attempt write to analytics_events with category 'SECURITY_AUDIT'
      await supabase.from('analytics_events').insert({
        event_name: auditEntry.action,
        category: 'SECURITY_AUDIT',
        metadata: {
          auditId: auditEntry.id,
          actor: auditEntry.actor,
          riskLevel: auditEntry.riskLevel,
          targetIds: auditEntry.targetIds,
          beforeState: auditEntry.beforeState,
          afterState: auditEntry.afterState,
          approvalId: auditEntry.approvalId,
          ip: auditEntry.ip,
          status: auditEntry.status,
          details: auditEntry.details,
          timestamp: auditEntry.timestamp,
        },
      });
    }
  } catch (dbErr) {
    console.error('[AUDIT ERROR] Failed to write audit record to database:', dbErr);
    // If it's a HIGH or CRITICAL operation, failing to record audit is unacceptable
    if (record.riskLevel === 'HIGH' || record.riskLevel === 'CRITICAL') {
      return false;
    }
  }

  return true;
}

/**
 * Retrieves recent audit records for admin inspection
 */
export async function getRecentAuditLogs(limit: number = 50): Promise<AuditRecord[]> {
  const records: AuditRecord[] = [];

  // Try fetching from database first
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('category', 'SECURITY_AUDIT')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.metadata?.auditId || d.id,
          timestamp: d.metadata?.timestamp || d.created_at,
          actor: d.metadata?.actor || 'unknown',
          action: d.event_name as SensitiveAction,
          riskLevel: d.metadata?.riskLevel || 'MEDIUM',
          targetIds: d.metadata?.targetIds || [],
          beforeState: d.metadata?.beforeState,
          afterState: d.metadata?.afterState,
          approvalId: d.metadata?.approvalId,
          ip: d.metadata?.ip || '127.0.0.1',
          status: d.metadata?.status || 'SUCCESS',
          details: d.metadata?.details,
        }));
      }
    }
  } catch (e) {
    console.error('Error fetching audit logs from DB, falling back to local file:', e);
  }

  // Fallback to local append-only log file
  try {
    if (fs.existsSync(LOCAL_AUDIT_LOG_FILE)) {
      const lines = fs.readFileSync(LOCAL_AUDIT_LOG_FILE, 'utf8').trim().split('\n').filter(Boolean);
      const parsed = lines.slice(-limit).map(l => JSON.parse(l));
      return parsed.reverse();
    }
  } catch {}

  return records;
}
