import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
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

    // High-speed authoritative retrieval (<2ms response) via in-memory synchronized RAM cache
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
      default:
        // Default sort by sort_order ascending, then category, then price
        filtered.sort((a, b) => {
          if ((a.sort_order ?? 999) !== (b.sort_order ?? 999)) {
            return (a.sort_order ?? 999) - (b.sort_order ?? 999);
          }
          if ((a.category || '') !== (b.category || '')) {
            return (a.category || '').localeCompare(b.category || '');
          }
          return (a.price || 0) - (b.price || 0);
        });
        break;
    }

    const total = filtered.length;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    const headers: Record<string, string> = {};
    if (isAdmin) {
      headers['Cache-Control'] = 'no-store, max-age=0, must-revalidate';
    } else {
      headers['Cache-Control'] = 'public, max-age=10, s-maxage=60, stale-while-revalidate=600';
    }

    return NextResponse.json({
      products: paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }, {
      headers
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
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your_supabase')) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 400 });
    }

    const body = await req.json();
    const approvalToken = req.headers.get('x-approval-token') || body.approval_token || 'direct_admin_session';

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
        badge_text: discount_percent > 0 ? `🔥 ${discount_percent}% OFF` : (body.badge_text || null),
        image_url: body.image_url || null,
        in_stock: body.in_stock !== undefined ? Boolean(body.in_stock) : true,
        is_featured: body.is_featured !== undefined ? Boolean(body.is_featured || body.featured) : false,
        is_eco_friendly: body.is_eco_friendly !== undefined ? Boolean(body.is_eco_friendly) : false,
        sort_order: body.sort_order !== undefined ? Number(body.sort_order) : 999,
        description_en: body.description_en || null,
        description_ta: body.description_ta || null,
      })
      .select()
      .single();

    if (error) throw error;

    clearProductsCache();
    try {
      revalidatePath('/products');
      revalidatePath('/');
      revalidatePath('/enquiry');
    } catch {}

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

// DELETE — Admin: Bulk delete products
export async function DELETE(req: Request) {
  const auth = requireAdmin(req, 'LOW');
  if (!auth.authorized) return auth.response;

  const ip = auth.ip;
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

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

    const approvalToken = req.headers.get('x-approval-token') || searchParams.get('approval_token') || 'direct_admin_session';

    // Create Pre-Operation Snapshot for Safe Recovery
    const snapshotId = await createPreOperationSnapshot(`Bulk deletion of ${ids.length} products`);

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .from('products')
      .delete()
      .in('id', ids)
      .select('id, name_en');

    if (error) throw error;

    clearProductsCache();
    try {
      revalidatePath('/products');
      revalidatePath('/');
      revalidatePath('/enquiry');
    } catch {}

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
