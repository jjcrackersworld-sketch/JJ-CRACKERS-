import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as xlsx from 'xlsx';
import { requireAdmin, getClientIp } from '@/lib/security/auth';
import { verifyApprovalToken } from '@/lib/security/approvals';
import { writeAuditRecord } from '@/lib/security/audit';
import { dispatchSecurityAlert } from '@/lib/security/alerts';
import { createPreOperationSnapshot } from '@/lib/security/recovery';

export const dynamic = 'force-dynamic';

function generateSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

function cleanKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
}

function getRowValue(row: any, searchKeys: string[]): any {
  for (const k of Object.keys(row)) {
    const cleaned = cleanKey(k);
    if (searchKeys.includes(cleaned)) {
      return row[k];
    }
  }
  return undefined;
}

export async function POST(req: Request) {
  const auth = requireAdmin(req, 'HIGH');
  if (!auth.authorized) return auth.response;

  const ip = auth.ip;
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseServiceKey || supabaseUrl.includes('your_supabase')) {
      return NextResponse.json({ error: 'Supabase credentials are not configured in .env.local' }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const approvalToken = (formData.get('approval_token') as string) || req.headers.get('x-approval-token');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!approvalToken) {
      return NextResponse.json(
        {
          error: 'Bulk product import via file is a HIGH-RISK operation. Explicit administrator approval token is required.',
          code: 'APPROVAL_REQUIRED',
          riskLevel: 'HIGH',
        },
        { status: 403 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Parse Excel/CSV
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json<any>(sheet);

    // Verify Approval Token against file payload
    const verifyRes = verifyApprovalToken(
      approvalToken,
      'PRODUCT_BULK_IMPORT',
      ['bulk_upload'],
      { fileName: file.name },
      true
    );

    if (!verifyRes.valid) {
      await dispatchSecurityAlert({
        alertType: 'PAYLOAD_TAMPERING_DETECTED',
        severity: 'HIGH',
        message: `Bulk product import blocked: ${verifyRes.error}`,
        actor: auth.session.role,
        ip,
        context: { fileName: file.name, rows: rows.length },
      });
      return NextResponse.json({ error: `Approval verification failed: ${verifyRes.error}` }, { status: 403 });
    }

    // Pre-operation Snapshot for safe rollback
    const snapshotId = await createPreOperationSnapshot(`Bulk import of ${rows.length} rows from ${file.name}`);

    // Initialize Supabase admin client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    const { data: categories } = await supabase.from('categories').select('*');
    const localCategories = categories || [];

    const products: any[] = [];

    for (const row of rows) {
      const nameEn = getRowValue(row, ['productname', 'name', 'itemname', 'product', 'items', 'item']);
      if (!nameEn) continue;

      const nameTa = getRowValue(row, ['tamilname', 'nameta', 'tamil']) || nameEn;
      const mrpRaw = getRowValue(row, ['mrp', 'originalprice', 'price', 'rate']);
      const priceRaw = getRowValue(row, ['ourprice', 'offerprice', 'discountprice', 'sellingprice', 'price']) || mrpRaw;

      const mrp = Number(mrpRaw) || 0;
      const price = Number(priceRaw) || mrp;
      const discount_percent = mrp > 0 && price < mrp ? Math.round(((mrp - price) / mrp) * 100) : 0;

      const categoryRaw = getRowValue(row, ['category', 'categoryname', 'type', 'group']) || 'General';

      let categoryId = 'single-sound';
      const existing = localCategories.find(
        (c) => c.label.toLowerCase() === categoryRaw.toLowerCase() || c.id === categoryRaw.toLowerCase()
      );

      if (existing) {
        categoryId = existing.id;
      }

      products.push({
        name_en: nameEn,
        name_ta: nameTa,
        slug: generateSlug(nameEn) + '-' + Math.random().toString(36).substring(2, 6),
        category: categoryId,
        price,
        mrp,
        discount_percent,
        badge_text: discount_percent > 50 ? `${discount_percent}% OFF` : null,
        image_url: null,
        in_stock: true,
        is_featured: discount_percent > 60,
      });
    }

    if (products.length === 0) {
      return NextResponse.json({ error: 'No valid products found in the uploaded file' }, { status: 400 });
    }

    const { data, error } = await supabase.from('products').insert(products).select();
    if (error) throw error;

    await writeAuditRecord({
      timestamp: new Date().toISOString(),
      actor: auth.session.role,
      action: 'PRODUCT_BULK_IMPORT',
      riskLevel: 'HIGH',
      targetIds: data?.map((d: any) => d.id) || [],
      approvalId: approvalToken,
      ip,
      status: 'SUCCESS',
      details: `Imported ${data?.length || 0} products from file ${file.name}. Snapshot: ${snapshotId}`,
    });

    return NextResponse.json({ success: true, count: data?.length || 0, snapshotId });
  } catch (error: any) {
    console.error('Seed Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
