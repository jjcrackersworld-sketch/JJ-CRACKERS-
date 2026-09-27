import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// In-memory cache for ultra-fast (1ms) image serving
const imageCache = new Map<string, { buffer: Buffer; mime: string }>();

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return new NextResponse('Missing ID', { status: 400 });
    }

    // 1. Check in-memory RAM cache first
    const cached = imageCache.get(id);
    if (cached) {
      return new NextResponse(new Uint8Array(cached.buffer), {
        headers: {
          'Content-Type': cached.mime,
          'Cache-Control': 'public, max-age=31536000, immutable, stale-while-revalidate=604800',
          'X-Cache': 'RAM-HIT',
        },
      });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !supabaseKey) {
      return new NextResponse('Supabase not configured', { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: product, error } = await supabase
      .from('products')
      .select('id, image_url, slug')
      .eq('id', id)
      .single();

    if (error || !product || !product.image_url) {
      // Fallback placeholder image
      return NextResponse.redirect(new URL('/logo/logo.png', req.url), { status: 307 });
    }

    const rawUrl = product.image_url;

    // 2. If it's a base64 Data URL, decode and serve as binary
    if (rawUrl.startsWith('data:image')) {
      const commaIdx = rawUrl.indexOf(',');
      if (commaIdx !== -1) {
        const header = rawUrl.slice(0, commaIdx);
        const base64Data = rawUrl.slice(commaIdx + 1);
        const mimeMatch = header.match(/data:([^;]+)/);
        const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
        const buffer = Buffer.from(base64Data, 'base64');

        // Store in RAM cache (up to 300 images)
        if (imageCache.size > 300) {
          const firstKey = imageCache.keys().next().value;
          if (firstKey) imageCache.delete(firstKey);
        }
        imageCache.set(id, { buffer, mime });

        return new NextResponse(new Uint8Array(buffer), {
          headers: {
            'Content-Type': mime,
            'Cache-Control': 'public, max-age=31536000, immutable, stale-while-revalidate=604800',
            'X-Cache': 'DECODE-OK',
          },
        });
      }
    }

    // 3. If it's already an HTTP / relative URL, redirect to it
    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
      return NextResponse.redirect(rawUrl, { status: 307 });
    }

    return NextResponse.redirect(new URL(rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`, req.url), { status: 307 });
  } catch (err: any) {
    console.error('Error in product-image route:', err);
    return new NextResponse('Internal error', { status: 500 });
  }
}
