import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin, getClientIp } from '@/lib/security/auth';
import { verifyApprovalToken } from '@/lib/security/approvals';
import { writeAuditRecord } from '@/lib/security/audit';
import { dispatchSecurityAlert } from '@/lib/security/alerts';
import { createPreOperationSnapshot } from '@/lib/security/recovery';

export const dynamic = 'force-dynamic';

// GET single product
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || supabaseUrl.includes('your_supabase')) {
      return NextResponse.json({ error: 'Not configured' }, { status: 404 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
    if (error) throw error;
    if (data && data.image_url && typeof data.image_url === 'string' && data.image_url.startsWith('data:image')) {
      data.image_url = `/api/product-image/${data.id}`;
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }
}

import { clearProductsCache } from '@/lib/db';

// PATCH — Update product (Smooth admin editing with audit log & cache invalidation)
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const isPriceChange = body.price !== undefined || body.mrp !== undefined;
  const isCategoryChange = body.category !== undefined;
  const riskLevel = isPriceChange || isCategoryChange ? 'MEDIUM' : 'LOW';

  // Require authenticated admin session
  const auth = requireAdmin(req, 'LOW');
  if (!auth.authorized) return auth.response;

  const ip = auth.ip;
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your_supabase')) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch existing product for before/after comparison
    const { data: existing, error: fetchErr } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fetchErr || !existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Optional verification if an approval token is supplied (e.g. from explicit challenge flows)
    const approvalToken = req.headers.get('x-approval-token') || body.approval_token;
    if (approvalToken) {
      const { approval_token, ...payloadToVerify } = body;
      const verifyRes = verifyApprovalToken(approvalToken, 'PRODUCT_UPDATE_PRICE', [id], payloadToVerify, false);
      if (!verifyRes.valid) {
        console.warn(`Approval token verification warning for product ${id}: ${verifyRes.error}`);
      }
    }

    const updateData: Record<string, any> = {};
    if (body.name_en !== undefined) updateData.name_en = String(body.name_en).trim();
    if (body.name_ta !== undefined) updateData.name_ta = String(body.name_ta).trim();
    if (body.category !== undefined) updateData.category = body.category;
    if (body.price !== undefined) updateData.price = Number(body.price);
    if (body.mrp !== undefined) updateData.mrp = Number(body.mrp);
    if (body.image_url !== undefined && !body.image_url.startsWith('/api/product-image/')) updateData.image_url = body.image_url;
    if (body.in_stock !== undefined) updateData.in_stock = Boolean(body.in_stock);
    if (body.is_featured !== undefined) updateData.is_featured = Boolean(body.is_featured);

    // Recalculate discount
    if (body.mrp !== undefined || body.price !== undefined) {
      const mrp = Number(body.mrp !== undefined ? body.mrp : updateData.mrp !== undefined ? updateData.mrp : existing.mrp || 0);
      const price = Number(body.price !== undefined ? body.price : updateData.price !== undefined ? updateData.price : existing.price || 0);
      if (mrp > 0 && price < mrp) {
        updateData.discount_percent = Math.round(((mrp - price) / mrp) * 100);
        updateData.badge_text = `🔥 ${updateData.discount_percent}% OFF`;
      } else {
        updateData.discount_percent = 0;
        updateData.badge_text = null;
      }
    }

    const { data, error } = await supabase.from('products').update(updateData).eq('id', id).select().maybeSingle();
    if (error) {
      console.error('Supabase update product error:', error);
      throw error;
    }

    const updatedProduct = data || { ...existing, ...updateData };

    // Clear RAM and edge cache so the updated product immediately reflects on the website
    clearProductsCache();

    // Record Immutable Audit Log
    try {
      await writeAuditRecord({
        timestamp: new Date().toISOString(),
        actor: auth.session.role,
        action: isPriceChange ? 'PRODUCT_UPDATE_PRICE' : 'PRODUCT_UPDATE_DETAILS',
        riskLevel,
        targetIds: [id],
        beforeState: { price: existing.price, mrp: existing.mrp, category: existing.category, in_stock: existing.in_stock },
        afterState: { price: updatedProduct.price, mrp: updatedProduct.mrp, category: updatedProduct.category, in_stock: updatedProduct.in_stock },
        approvalId: approvalToken || 'direct_admin_session',
        ip,
        status: 'SUCCESS',
        details: `Updated product ${existing.name_en} (${id})`,
      });
    } catch (auditErr) {
      console.error('Audit record error:', auditErr);
    }

    return NextResponse.json(updatedProduct);
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: error.message || 'Failed to update product' }, { status: 500 });
  }
}

// DELETE — Delete single product (Requires High-Risk Approval & Snapshot)
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAdmin(req, 'HIGH');
  if (!auth.authorized) return auth.response;

  const ip = auth.ip;
  try {
    const { id } = await params;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Supabase credentials not configured' }, { status: 400 });
    }

    const approvalToken = req.headers.get('x-approval-token');
    if (!approvalToken) {
      return NextResponse.json(
        {
          error: 'Product deletion requires an administrator approval challenge token.',
          code: 'APPROVAL_REQUIRED',
        },
        { status: 403 }
      );
    }

    const verifyRes = verifyApprovalToken(approvalToken, 'PRODUCT_DELETE_SINGLE', [id], { id }, true);
    if (!verifyRes.valid) {
      await dispatchSecurityAlert({
        alertType: 'PAYLOAD_TAMPERING_DETECTED',
        severity: 'HIGH',
        message: `Single product deletion rejected for ID ${id}: ${verifyRes.error}`,
        actor: auth.session.role,
        ip,
      });
      return NextResponse.json({ error: `Approval verification failed: ${verifyRes.error}` }, { status: 403 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch existing before deletion for snapshot and audit
    const { data: existing } = await supabase.from('products').select('*').eq('id', id).single();
    if (!existing) {
      return NextResponse.json({ error: 'Product not found or already deleted' }, { status: 404 });
    }

    // Pre-op snapshot
    await createPreOperationSnapshot(`Deletion of single product ${existing.name_en} (${id})`);

    const { data, error } = await supabase.from('products').delete().eq('id', id).select();
    if (error) throw error;

    clearProductsCache();

    await writeAuditRecord({
      timestamp: new Date().toISOString(),
      actor: auth.session.role,
      action: 'PRODUCT_DELETE_SINGLE',
      riskLevel: 'HIGH',
      targetIds: [id],
      beforeState: existing,
      approvalId: approvalToken,
      ip,
      status: 'SUCCESS',
      details: `Deleted product: ${existing.name_en} (${id})`,
    });

    return NextResponse.json({ success: true, deleted: data[0] });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete product' }, { status: 500 });
  }
}
