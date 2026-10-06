import type { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jjcrackersworld.com';
  const now = new Date();

  // Static core pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/combos`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    // Search-intent landing pages
    {
      url: `${baseUrl}/sivakasi-crackers`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/crackers-online`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/diwali-crackers`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/sivakasi-fireworks`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/cracker-gift-boxes`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/cracker-combo-packs`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    // Buyer Guides & Selection Advice
    {
      url: `${baseUrl}/best-crackers-to-buy`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/best-sivakasi-crackers`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/diwali-crackers-buying-guide`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    // Informational pages
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/safety`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/enquiry`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    // Legal
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Dynamic product URLs from Supabase
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your_supabase')) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data: products } = await supabase
        .from('products')
        .select('slug, created_at')
        .eq('in_stock', true)
        .order('sort_order', { ascending: true })
        .limit(1000);

      if (products && products.length > 0) {
        productPages = products
          .filter((p: any) => p.slug)
          .map((p: any) => ({
            url: `${baseUrl}/products/${p.slug}`,
            lastModified: p.created_at ? new Date(p.created_at) : now,
            changeFrequency: 'weekly' as const,
            priority: 0.7,
          }));
      }
    }
  } catch (err) {
    console.error('Sitemap: Failed to fetch product slugs:', err);
  }

  return [...staticPages, ...productPages];
}
