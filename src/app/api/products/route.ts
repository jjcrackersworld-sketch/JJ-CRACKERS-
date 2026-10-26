import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { products as staticProducts } from '@/lib/data/products';
import { requireAdmin, getClientIp } from '@/lib/security/auth';
import { verifyApprovalToken } from '@/lib/security/approvals';
import { writeAuditRecord } from '@/lib/security/audit';
import { dispatchSecurityAlert } from '@/lib/security/alerts';
import { createPreOperationSnapshot } from '@/lib/security/recovery';

import { getProducts, clearProductsCache } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET — Public product catalog retrieval (Ultra-fast <2ms, read-only, cached)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '500');
    const sortBy = searchParams.get('sort') || 'default';
    const isAdmin = searchParams.get('admin') === 'true';

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    // If Admin mode requested, query Supabase directly for guaranteed fresh live status
    if (isAdmin && supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your_supabase')) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      let query = supabase
        .from('products')
        .select('id,name_en,name_ta,slug,category,price,mrp,discount_percent,badge_text,image_url,in_stock,is_featured,is_eco_friendly,sort_order', { count: 'exact' });

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }
      if (search) {
        query = query.or(`name_en.ilike.%${search}%,category.ilike.%${search}%`);
      }
      switch (sortBy) {
        case 'price-low': query = query.order('price', { ascending: true }); break;
        case 'price-high': query = query.order('price', { ascending: false }); break;
        case 'name': query = query.order('name_en', { ascending: true }); break;
        case 'discount': query = query.order('discount_percent', { ascending: false }); break;
        default: query = query.order('sort_order', { ascending: true }).order('category', { ascending: true }).order('price', { ascending: true });
      }

      const start = (page - 1) * limit;
      query = query.range(start, start + limit - 1);
      const { data, error, count } = await query;
      if (error) throw error;

      return NextResponse.json({
        products: (data || []).map((p: any) => ({
          ...p,
          image_url: p.image_url || `/products/${p.slug}.jpg` || `/product-assets/${p.id}.jpg`,
        })),
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      }, {
        headers: { 'Cache-Control': 'no-store, max-age=0, must-revalidate' }
      });
    }

    // Customer Storefront Mode — Lightning-fast RAM cache (<2ms response)
    const allProducts = await getProducts();
    let filtered = [...allProducts];

    if (category && category !== 'all') {
      filtered = filtered.filter(p => p.category === category);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p =>
        (p.name_en || '').toLowerCase().includes(q) ||
        (p.name_ta || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q)
      );
    }
    switch (sortBy) {
      case 'price-low': filtered.sort((a, b) => (a.price || 0) - (b.price || 0)); break;
      case 'price-high': filtered.sort((a, b) => (b.price || 0) - (a.price || 0)); break;
      case 'name': filtered.sort((a, b) => (a.name_en || '').localeCompare(b.name_en || '')); break;
      case 'discount': filtered.sort((a, b) => (b.discount_percent || 0) - (a.discount_percent || 0)); break;
    }

    const total = filtered.length;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    return NextResponse.json({
      products: paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }, {
      headers: {
        'Cache-Control': 'public, max-age=10, s-maxage=60, stale-while-revalidate=600'
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({
      products: staticProducts,
      total: staticProducts.length,
      page: 1,
      limit: 500,
      totalPages: 1,
    });
  }
}

// POST — Admin: Add new product (Requires Authentication + Server Approval Verification)
export async function POST(req: Request) {
  const auth = requireAdmin(req, 'MEDIUM');
  if (!auth.authorized) return auth.response;

  const ip = auth.ip;
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your_supabase')) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 400 });
    }

    const body = await req.json();

    // 1. Approval Verification
    const approvalToken = req.headers.get('x-approval-token') || body.approval_token;
    if (approvalToken) {
      // Clean body without the ephemeral token field for hash verification
      const { approval_token, ...payloadToVerify } = body;
      const verifyRes = verifyApprovalToken(approvalToken, 'PRODUCT_CREATE', [], payloadToVerify, true);
      if (!verifyRes.valid) {
        await dispatchSecurityAlert({
          alertType: verifyRes.code === 'REPLAY' ? 'REPLAY_ATTACK_DETECTED' : 'PAYLOAD_TAMPERING_DETECTED',
          severity: 'HIGH',
          message: `Product creation rejected: ${verifyRes.error}`,
          actor: auth.session.role,
          ip,
        });
        return NextResponse.json({ error: `Approval verification failed: ${verifyRes.error}` }, { status: 403 });
      }
    } else {
      // Direct POST without approval token is rejected for production protection
      return NextResponse.json(
        {
          error: 'Explicit administrator approval required. Please request an approval challenge before creating products.',
          code: 'APPROVAL_REQUIRED',
        },
        { status: 403 }
      );
    }

    const nameEn = body.name_en || body.product_name;
    if (!nameEn || typeof nameEn !== 'string' || nameEn.trim().length === 0) {
      return NextResponse.json({ error: 'Valid English product name is required' }, { status: 400 });
    }

    const baseSlug = nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || 'product';
    const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
    const category = body.category || 'single-sound';

    const mrp = Number(body.mrp || body.original_price || 0);
    const price = Number(body.price || body.discounted_price || mrp);
    let discount_percent = 0;
    if (mrp > 0 && price < mrp) {
      discount_percent = Math.round(((mrp - price) / mrp) * 100);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .from('products')
      .insert({
        name_en: nameEn.trim(),
        name_ta: body.name_ta || nameEn.trim(),
        slug,
        category,
        price,
        mrp,
        discount_percent,
        badge_text: discount_percent > 0 ? `🔥 ${discount_percent}% OFF` : null,
        image_url: body.image_url || null,
        in_stock: body.in_stock !== undefined ? Boolean(body.in_stock) : true,
        is_featured: body.is_featured !== undefined ? Boolean(body.is_featured || body.featured) : false,
      })
      .select()
      .single();

    if (error) throw error;

    // Record Immutable Audit Log
    await writeAuditRecord({
      timestamp: new Date().toISOString(),
      actor: auth.session.role,
      action: 'PRODUCT_CREATE',
      riskLevel: 'MEDIUM',
      targetIds: [data.id],
      afterState: data,
      approvalId: approvalToken,
      ip,
      status: 'SUCCESS',
      details: `Created product: ${nameEn} (${data.id})`,
    });

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Error creating product:', error);
    await writeAuditRecord({
      timestamp: new Date().toISOString(),
      actor: auth.session.role,
      action: 'PRODUCT_CREATE',
      riskLevel: 'MEDIUM',
      targetIds: [],
      ip,
      status: 'FAILED',
      details: error.message,
    });
    return NextResponse.json({ error: error.message || 'Product creation failed' }, { status: 500 });
  }
}

// DELETE — Admin: Bulk delete products (Requires High-Risk Reauth, Pre-Op Snapshot, and Approval)
export async function DELETE(req: Request) {
  const auth = requireAdmin(req, 'HIGH');
  if (!auth.authorized) return auth.response;

  const ip = auth.ip;
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your_supabase')) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const idsString = searchParams.get('ids');
    if (!idsString) {
      return NextResponse.json({ error: 'Missing ids parameter' }, { status: 400 });
    }

    const ids = idsString.split(',').filter(Boolean);
    if (ids.length === 0) {
      return NextResponse.json({ error: 'No IDs provided' }, { status: 400 });
    }

    // High-Risk: Verify Approval Token
    const approvalToken = req.headers.get('x-approval-token') || searchParams.get('approval_token');
    if (!approvalToken) {
      return NextResponse.json(
        {
          error: 'Bulk product deletion is a HIGH-RISK action and requires explicit administrator approval token.',
          code: 'APPROVAL_REQUIRED',
        },
        { status: 403 }
      );
    }

    const verifyRes = verifyApprovalToken(approvalToken, 'PRODUCT_DELETE_BULK', ids, { ids }, true);
    if (!verifyRes.valid) {
      await dispatchSecurityAlert({
        alertType: 'PAYLOAD_TAMPERING_DETECTED',
        severity: 'CRITICAL',
        message: `Bulk product deletion blocked: ${verifyRes.error}`,
        actor: auth.session.role,
        ip,
        context: { attemptedIds: ids },
      });
      return NextResponse.json({ error: `Approval verification failed: ${verifyRes.error}` }, { status: 403 });
    }

    // Create Pre-Operation Snapshot for Safe Recovery
    const snapshotId = await createPreOperationSnapshot(`Bulk deletion of ${ids.length} products`);

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .from('products')
      .delete()
      .in('id', ids)
      .select('id, name_en');

    if (error) throw error;

    await writeAuditRecord({
      timestamp: new Date().toISOString(),
      actor: auth.session.role,
      action: 'PRODUCT_DELETE_BULK',
      riskLevel: 'HIGH',
      targetIds: ids,
      approvalId: approvalToken,
      ip,
      status: 'SUCCESS',
      details: `Bulk deleted ${data?.length || 0} products. Snapshot ID: ${snapshotId}`,
    });

    return NextResponse.json({ success: true, count: data?.length || 0, snapshotId });
  } catch (error: any) {
    console.error('Error deleting products:', error);
    await writeAuditRecord({
      timestamp: new Date().toISOString(),
      actor: auth.session.role,
      action: 'PRODUCT_DELETE_BULK',
      riskLevel: 'HIGH',
      targetIds: [],
      ip,
      status: 'FAILED',
      details: error.message,
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
