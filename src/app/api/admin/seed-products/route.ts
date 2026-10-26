import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { products as staticProducts } from '@/lib/data/products';
import { requireAdmin, getClientIp } from '@/lib/security/auth';
import { verifyApprovalToken } from '@/lib/security/approvals';
import { writeAuditRecord } from '@/lib/security/audit';
import { dispatchSecurityAlert } from '@/lib/security/alerts';
import { createPreOperationSnapshot } from '@/lib/security/recovery';

export const dynamic = 'force-dynamic';

// Bulk insert all static products into Supabase (CRITICAL Operation: Requires Reauth + Approval Challenge)
export async function POST(req: Request) {
  const auth = requireAdmin(req, 'CRITICAL');
  if (!auth.authorized) return auth.response;

  const ip = auth.ip;
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!supabaseUrl || supabaseUrl.includes('your_supabase') || !supabaseKey) {
      return NextResponse.json({
        error: 'Supabase credentials not configured.'
      }, { status: 400 });
    }

    // Critical Approval Verification
    const approvalToken = req.headers.get('x-approval-token');
    if (!approvalToken) {
      return NextResponse.json(
        {
          error: 'Bulk catalog synchronization/seeding is a CRITICAL risk action. Explicit administrator approval challenge token is required.',
          code: 'APPROVAL_REQUIRED',
          riskLevel: 'CRITICAL',
        },
        { status: 403 }
      );
    }

    const verifyRes = verifyApprovalToken(approvalToken, 'CATALOG_SEED', ['all_products'], { action: 'seed_canonical_products' }, true);
    if (!verifyRes.valid) {
      await dispatchSecurityAlert({
        alertType: 'PAYLOAD_TAMPERING_DETECTED',
        severity: 'CRITICAL',
        message: `Catalog seed rejected: ${verifyRes.error}`,
        actor: auth.session.role,
        ip,
      });
      return NextResponse.json({ error: `Approval verification failed: ${verifyRes.error}` }, { status: 403 });
    }

    // Pre-operation Snapshot
    const snapshotId = await createPreOperationSnapshot('Canonical Catalog Re-sync');

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });

    // Map static products to Supabase schema
    const productsToInsert = staticProducts.map((p, index) => ({
      id: p.id,
      name_en: p.name_en,
      name_ta: p.name_ta || p.name_en,
      slug: p.slug || p.name_en.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + index,
      category: p.category,
      price: p.price,
      mrp: p.mrp,
      discount_percent: p.discount_percent || 0,
      badge_text: p.badge_text || null,
      image_url: p.image_url || `/product-assets/${p.id}.jpg`,
      in_stock: p.in_stock !== undefined ? p.in_stock : true,
      is_featured: p.is_featured || false,
      is_eco_friendly: false,
      sort_order: index,
    }));

    // Insert in batches of 50
    let totalInserted = 0;
    const batchSize = 50;
    const errors: string[] = [];

    for (let i = 0; i < productsToInsert.length; i += batchSize) {
      const batch = productsToInsert.slice(i, i + batchSize);
      const { data, error } = await supabase
        .from('products')
        .upsert(batch, { onConflict: 'id' })
        .select();

      if (error) {
        errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
      } else {
        totalInserted += data?.length || 0;
      }
    }

    // Safeguard: Remove any products that are not part of canonical catalog
    const canonicalSlugs = new Set(staticProducts.map(p => p.slug));
    const { data: currentRows } = await supabase.from('products').select('id,slug');
    let rogueDeleted = 0;
    if (currentRows) {
      const rogueIds = currentRows.filter(r => !canonicalSlugs.has(r.slug)).map(r => r.id);
      if (rogueIds.length > 0) {
        const { data: delData } = await supabase.from('products').delete().in('id', rogueIds).select('id');
        rogueDeleted = delData?.length || 0;
      }
    }

    await writeAuditRecord({
      timestamp: new Date().toISOString(),
      actor: auth.session.role,
      action: 'CATALOG_SEED',
      riskLevel: 'CRITICAL',
      targetIds: ['canonical_150_catalog'],
      approvalId: approvalToken,
      ip,
      status: 'SUCCESS',
      details: `Re-seeded canonical catalog. Inserted/Updated: ${totalInserted}, Removed Rogues: ${rogueDeleted}. Snapshot: ${snapshotId}`,
    });

    return NextResponse.json({
      success: true,
      totalInserted,
      totalAttempted: productsToInsert.length,
      rogueDeleted,
      snapshotId,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Bulk seed error:', error);
    await writeAuditRecord({
      timestamp: new Date().toISOString(),
      actor: auth.session.role,
      action: 'CATALOG_SEED',
      riskLevel: 'CRITICAL',
      targetIds: [],
      ip,
      status: 'FAILED',
      details: error.message,
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
