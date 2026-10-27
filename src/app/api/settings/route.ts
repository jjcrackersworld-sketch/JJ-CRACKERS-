import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin, getClientIp } from '@/lib/security/auth';
import { verifyApprovalToken } from '@/lib/security/approvals';
import { writeAuditRecord } from '@/lib/security/audit';
import { dispatchSecurityAlert } from '@/lib/security/alerts';
import { createPreOperationSnapshot } from '@/lib/security/recovery';

export const dynamic = 'force-dynamic';

const DEFAULT_SETTINGS = {
  global_discount: '60',
  min_order_value: '2000',
  company_name: 'JEGAJOTHI CRACKERS',
  company_address: '1/406, SIVAKASI -VEMBAKOTAI MAIN ROAD, Opp to EB OFFICE,VEMBAKOTTAI.',
  mobile_number_1: '7092300252',
  mobile_number_2: '7092300252',
  whatsapp_number: '7092300252',
  email_address: 'jjcrackersworld@gmail.com',
  marquee: 'Welcome to Jegajothi Crackers Sivakasi - Direct Factory Price Quality Fireworks! We Give Special Festive Discounts!',
  whatsapp_provider: 'whatsapp_business',
  whatsapp_business_phone_number_id: '',
  whatsapp_business_access_token: '',
  whatsapp_ultramsg_instance_id: '',
  whatsapp_ultramsg_token: '',
  whatsapp_template_name: 'order_status_update',
  whatsapp_msg_pending: 'Hello {{customer_name}}, your order {{order_number}} is received and is pending verification. We will contact you shortly to confirm!',
  whatsapp_msg_confirmed: 'Hello {{customer_name}}, your order {{order_number}} is confirmed! We are packaging your crackers now.',
  whatsapp_msg_processing: 'Hello {{customer_name}}, your order {{order_number}} is being processed at our Sivakasi factory.',
  whatsapp_msg_shipped: 'Hello {{customer_name}}, your order {{order_number}} has been shipped! Transport tracking details: {{tracking_info}}',
  whatsapp_msg_delivered: 'Hello {{customer_name}}, your order {{order_number}} has been successfully delivered. Happy and safe celebrating! 🎆',
  whatsapp_msg_cancelled: 'Hello {{customer_name}}, your order {{order_number}} has been cancelled. Please contact support if you have questions.',
};

import { getSiteSettings, clearSettingsCache } from '@/lib/settings';

// GET — Retrieve all settings (<1ms ultra-fast response)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const isAdmin = searchParams.get('admin') === 'true';

    const settings = await getSiteSettings();

    const responseHeaders: Record<string, string> = {};
    if (isAdmin) {
      responseHeaders['Cache-Control'] = 'no-store, max-age=0, must-revalidate';
    } else {
      responseHeaders['Cache-Control'] = 'public, s-maxage=30, stale-while-revalidate=300';
    }

    return NextResponse.json(settings, {
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error('Error getting settings:', error);
    return NextResponse.json(DEFAULT_SETTINGS);
  }
}

// POST — Update settings (High-Risk if global_discount modifies all catalog products)
export async function POST(req: Request) {
  const ip = getClientIp(req);
  try {
    const body = await req.json();
    const isDiscountChange = body.global_discount !== undefined;

    const auth = requireAdmin(req, 'LOW');
    if (!auth.authorized) return auth.response;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your_supabase')) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if global_discount is actually changing
    let previousDiscount = '60';
    const { data: currentDiscountRow } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'global_discount')
      .maybeSingle();

    if (currentDiscountRow) {
      previousDiscount = currentDiscountRow.value;
    }

    const newDiscount = body.global_discount;
    const isActuallyChanging = newDiscount !== undefined && String(newDiscount) !== String(previousDiscount);

    if (isActuallyChanging) {
      try {
        await createPreOperationSnapshot(`Global discount change from ${previousDiscount}% to ${newDiscount}%`);
      } catch {}
    }

    // Save settings
    const upserts = Object.entries(body)
      .filter(([key]) => key !== 'approval_token')
      .map(([key, value]) => ({
        key,
        value: String(value),
      }));

    if (upserts.length > 0) {
      const { error: upsertError } = await supabase.from('site_settings').upsert(upserts);
      if (upsertError) throw upsertError;
    }

    // Recalculate product prices if approved and changed
    if (isActuallyChanging) {
      const discountVal = parseInt(String(newDiscount));
      if (!isNaN(discountVal) && discountVal >= 0 && discountVal <= 100) {
        const { data: products, error: fetchError } = await supabase.from('products').select('*');
        if (fetchError) throw fetchError;

        if (products && products.length > 0) {
          const updates = products.map((p: any) => {
            const price = p.price || 0;
            const mrp = discountVal < 100 ? Math.round(price / (1 - discountVal / 100)) : price;
            return {
              id: p.id,
              name_en: p.name_en,
              name_ta: p.name_ta,
              slug: p.slug,
              category: p.category,
              price: p.price,
              mrp,
              discount_percent: discountVal,
              badge_text: discountVal > 0 ? `🔥 ${discountVal}% OFF` : null,
              image_url: p.image_url,
              in_stock: p.in_stock,
              is_featured: p.is_featured,
              is_eco_friendly: p.is_eco_friendly,
              sort_order: p.sort_order,
            };
          });

          for (const chunk of chunkArray(updates, 50)) {
            const { error: updateError } = await supabase.from('products').upsert(chunk);
            if (updateError) throw updateError;
          }
        }
      }
    }

    clearSettingsCache();

    writeAuditRecord({
      timestamp: new Date().toISOString(),
      actor: auth.session.role,
      action: isActuallyChanging ? 'PRODUCT_BULK_PRICE_CHANGE' : 'SETTINGS_UPDATE',
      riskLevel: isActuallyChanging ? 'HIGH' : 'LOW',
      targetIds: Object.keys(body),
      ip,
      status: 'SUCCESS',
      details: isActuallyChanging
        ? `Global discount updated to ${newDiscount}% across entire catalog`
        : 'Site settings updated',
    }).catch(err => console.error('Settings audit error note:', err));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}
