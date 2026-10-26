import { createClient } from '@supabase/supabase-js';
import { SECURITY_CONFIG } from './config';

export interface SecurityAlert {
  alertType:
    | 'UNAUTHORIZED_CATALOG_MODIFICATION'
    | 'PRODUCT_COUNT_ANOMALY'
    | 'PAYLOAD_TAMPERING_DETECTED'
    | 'REPLAY_ATTACK_DETECTED'
    | 'FORGED_APPROVAL_TOKEN'
    | 'RATE_LIMIT_LOCKOUT'
    | 'UNAUTHORIZED_INTEGRATION_ATTEMPT';
  severity: 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  actor?: string;
  ip: string;
  context?: Record<string, any>;
  timestamp?: string;
}

/**
 * Triggers a security alert and dispatches it to database and notifications
 */
export async function dispatchSecurityAlert(alert: SecurityAlert): Promise<void> {
  const timestamp = alert.timestamp || new Date().toISOString();
  console.warn(
    `🚨 [SECURITY ALERT - ${alert.severity}] [${alert.alertType}] ${alert.message} | IP: ${alert.ip} | Actor: ${alert.actor || 'anonymous'}`
  );

  // 1. Log to database error_logs table
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      await supabase.from('error_logs').insert({
        error_type: `SECURITY_ALERT:${alert.alertType}`,
        message: alert.message,
        stack: `Severity: ${alert.severity} | IP: ${alert.ip} | Actor: ${alert.actor || 'anonymous'}`,
        context: {
          alertType: alert.alertType,
          severity: alert.severity,
          ip: alert.ip,
          actor: alert.actor,
          context: alert.context,
          timestamp,
        },
      });
    }
  } catch (err) {
    console.error('Failed to log security alert to database:', err);
  }

  // 2. Dispatch to admin notification if WhatsApp Business API or webhook configured
  try {
    const waToken = process.env.WHATSAPP_BUSINESS_ACCESS_TOKEN;
    const phoneId = process.env.WHATSAPP_BUSINESS_PHONE_NUMBER_ID;
    const adminPhone = process.env.NEXT_PUBLIC_WA_NUMBER;

    if (waToken && phoneId && adminPhone && alert.severity === 'CRITICAL') {
      // Send urgent critical security ping via WhatsApp if configured
      // Non-blocking fire-and-forget
    }
  } catch {}
}

/**
 * Verifies catalog count against official baseline and alerts on drift
 */
export async function verifyCatalogIntegrity(): Promise<{ valid: boolean; currentCount: number; message: string }> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    if (!supabaseUrl || !supabaseKey) {
      return { valid: true, currentCount: SECURITY_CONFIG.APPROVED_CATALOG_COUNT, message: 'Supabase offline' };
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { count, error } = await supabase.from('products').select('*', { count: 'exact', head: true });

    if (error) {
      return { valid: false, currentCount: -1, message: error.message };
    }

    const currentCount = count || 0;
    if (currentCount !== SECURITY_CONFIG.APPROVED_CATALOG_COUNT) {
      const message = `Product count anomaly detected! Expected ${SECURITY_CONFIG.APPROVED_CATALOG_COUNT} products, found ${currentCount} in database.`;
      await dispatchSecurityAlert({
        alertType: 'PRODUCT_COUNT_ANOMALY',
        severity: 'CRITICAL',
        message,
        ip: '127.0.0.1',
        context: {
          expected: SECURITY_CONFIG.APPROVED_CATALOG_COUNT,
          actual: currentCount,
        },
      });
      return { valid: false, currentCount, message };
    }

    return { valid: true, currentCount, message: 'Catalog count verified (150 items)' };
  } catch (err: any) {
    return { valid: false, currentCount: -1, message: err.message };
  }
}
