import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

function generateOrderNumber(): string {
  const now = new Date();
  const dateStr = now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    now.getDate().toString().padStart(2, '0');
  const seq = Math.floor(Math.random() * 9000) + 1000;
  return `JJ-${dateStr}-${seq}`;
}

export async function GET(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || supabaseUrl.includes('your_supabase')) {
      return NextResponse.json([]);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const customerName = (body.customer_name || '').trim();
    const customerPhone = (body.customer_phone || '').replace(/\D/g, '');
    const customerAddress = (body.customer_address || '').trim();

    if (!customerName) {
      return NextResponse.json({ error: 'Customer Name is required' }, { status: 400 });
    }
    if (!customerPhone || customerPhone.length !== 10) {
      return NextResponse.json({ error: 'A valid 10-digit Phone Number is required' }, { status: 400 });
    }
    if (!customerAddress || customerAddress.length < 5) {
      return NextResponse.json({ error: 'Full Delivery Address is required' }, { status: 400 });
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: 'Order must contain at least one item' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || supabaseUrl.includes('your_supabase')) {
      const orderNumber = generateOrderNumber();
      return NextResponse.json({
        id: crypto.randomUUID(),
        order_number: orderNumber,
        ...body,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_address: customerAddress,
        customer_email: (body.customer_email || '').trim(),
        customer_city: body.customer_city || null,
        customer_pincode: body.customer_pincode || null,
        customer_state: body.customer_state || null,
        customer_district: body.customer_district || null,
        status: 'confirmed',
        payment_status: 'pending',
        created_at: new Date().toISOString(),
      }, { status: 201 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // --- AUTHORITATIVE SERVER-SIDE PRODUCT AVAILABILITY & PRICE VALIDATION ---
    const rawItems: any[] = body.items;
    const itemIds = rawItems.map(i => i.id).filter(Boolean);
    const itemNames = rawItems.map(i => i.name).filter(Boolean);

    let dbProducts: any[] = [];
    if (itemIds.length > 0) {
      const { data } = await supabase
        .from('products')
        .select('id, name_en, price, mrp, in_stock, category')
        .in('id', itemIds);
      if (data) dbProducts = data;
    }
    // Fallback lookup by name if any items did not have IDs
    if (dbProducts.length < rawItems.length && itemNames.length > 0) {
      const { data } = await supabase
        .from('products')
        .select('id, name_en, price, mrp, in_stock, category')
        .in('name_en', itemNames);
      if (data) {
        // Merge without duplicates
        const existingIds = new Set(dbProducts.map(p => p.id));
        data.forEach(p => {
          if (!existingIds.has(p.id)) dbProducts.push(p);
        });
      }
    }

    // 1. Check for Out of Stock items
    const outOfStockItems: string[] = [];
    const validatedItems: any[] = [];
    let authoritativeSubtotal = 0;
    let authoritativeDiscountTotal = 0;
    let authoritativeNetTotal = 0;

    for (const item of rawItems) {
      const dbProd = dbProducts.find(p => (item.id && p.id === item.id) || p.name_en === item.name);
      const qty = Math.max(1, parseInt(item.quantity || 1, 10));

      if (dbProd) {
        if (dbProd.in_stock === false) {
          outOfStockItems.push(dbProd.name_en);
        }
        const effectivePrice = Number(dbProd.price);
        const effectiveMrp = Number(dbProd.mrp || effectivePrice);
        const lineTotal = effectivePrice * qty;
        const lineGross = effectiveMrp * qty;
        const lineDiscount = Math.max(0, lineGross - lineTotal);

        authoritativeNetTotal += lineTotal;
        authoritativeSubtotal += lineGross;
        authoritativeDiscountTotal += lineDiscount;

        validatedItems.push({
          id: dbProd.id,
          name: dbProd.name_en,
          quantity: qty,
          price: effectivePrice,
          mrp: effectiveMrp,
          category: dbProd.category,
        });
      } else {
        // Product not in DB catalog
        const itemPrice = Number(item.price || 0);
        const itemMrp = Number(item.mrp || itemPrice);
        const lineTotal = itemPrice * qty;
        authoritativeNetTotal += lineTotal;
        authoritativeSubtotal += (itemMrp * qty);
        authoritativeDiscountTotal += Math.max(0, (itemMrp * qty) - lineTotal);

        validatedItems.push({
          id: item.id || null,
          name: item.name,
          quantity: qty,
          price: itemPrice,
          mrp: itemMrp,
          category: item.category || 'General',
        });
      }
    }

    // Reject order immediately if any product is Out of Stock
    if (outOfStockItems.length > 0) {
      return NextResponse.json({
        error: `Cannot complete purchase: The following product(s) are currently Out of Stock: ${outOfStockItems.join(', ')}. Please remove them from your cart to proceed.`,
        outOfStock: outOfStockItems
      }, { status: 400 });
    }

    const authoritativePacking = Math.round(authoritativeNetTotal * 0.03);
    const authoritativeGrandTotal = authoritativeNetTotal + authoritativePacking;

    const orderNumber = generateOrderNumber();

    const { data, error } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_name: customerName,
        customer_email: (body.customer_email || '').trim(),
        customer_phone: customerPhone,
        customer_address: customerAddress,
        customer_city: body.customer_city || null,
        customer_pincode: body.customer_pincode || null,
        customer_state: body.customer_state || null,
        customer_district: body.customer_district || null,
        items: validatedItems,
        subtotal: authoritativeSubtotal,
        discount_total: authoritativeDiscountTotal,
        total_amount: authoritativeGrandTotal,
        status: 'confirmed',
        payment_method: body.payment_method || 'bank_transfer',
        payment_status: 'pending',
        notes: body.notes || `Includes 3% packing charges (₹${authoritativePacking.toLocaleString('en-IN')})`,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: error.message || 'Failed to create order' }, { status: 500 });
  }
}
