import { createClient } from '@supabase/supabase-js';
import type { Product } from './supabase/types';

// The definitive 21 categories for JJ Crackers — matches Supabase `categories` table
export const DEFAULT_CATEGORIES = [
  { id: 'all', label: 'All Products', emoji: '🎆', sort_order: 0 },
  { id: 'single-sound', label: 'Single Sound Crackers', emoji: '💥', sort_order: 1 },
  { id: 'GROUND CHAKKAR', label: 'Ground Chakkars', emoji: '🌀', sort_order: 2 },
  { id: 'flowerpots', label: 'Flower Pots', emoji: '🌸', sort_order: 3 },
  { id: 'bijili', label: 'Bijili', emoji: '⚡', sort_order: 4 },
  { id: 'THUNDER PAPER BOMP', label: 'Thunder Paper Bomb', emoji: '💣', sort_order: 5 },
  { id: 'bombs', label: 'Thunder Sound Bomb', emoji: '🔊', sort_order: 6 },
  { id: 'TWINKLING STAR', label: 'Twinkling Star', emoji: '🌟', sort_order: 7 },
  { id: 'rockets', label: 'Sky Jets', emoji: '🚀', sort_order: 8 },
  { id: 'PENCIL FUNCTIONS', label: 'Pencil Fountains', emoji: '✏️', sort_order: 9 },
  { id: 'RED CHAIN CRACKERS', label: 'Red Chain Crackers', emoji: '🔗', sort_order: 10 },
  { id: 'NANO FOUNTAINS', label: 'Nano Fountains', emoji: '⛲', sort_order: 11 },
  { id: 'JOY FOUNTAINS', label: 'Joy Fountains', emoji: '🎆', sort_order: 12 },
  { id: 'PEARL FOUNTAINS', label: 'Pearl Fountains', emoji: '💎', sort_order: 13 },
  { id: 'AMAZING FOUNTAINS', label: 'Amazing Fountains', emoji: '✨', sort_order: 14 },
  { id: 'ROYAL FOUNTAINS', label: 'Royal Fountains', emoji: '👑', sort_order: 15 },
  { id: 'FANCY NOVELTIES', label: 'Fancy Novelties', emoji: '🎭', sort_order: 16 },
  { id: 'MULTI SHOTS', label: 'Multi Shots', emoji: '🎇', sort_order: 17 },
  { id: 'SKY EXPO - MULTI SHOTS (PREMIUM)', label: 'Sky Expo Multi Shots (Premium)', emoji: '🏆', sort_order: 18 },
  { id: 'SPARKLERS', label: 'Sparklers', emoji: '✨', sort_order: 19 },
  { id: 'MATCH BOX', label: 'Match Box', emoji: '📦', sort_order: 20 },
  { id: 'GIFT BOXES', label: 'Gift Boxes', emoji: '🎁', sort_order: 21 },
];

import { products as staticProducts } from '@/lib/data/products';

let cachedCategories: any[] | null = DEFAULT_CATEGORIES;
let lastCategoriesFetchTime = Date.now();
const CATEGORIES_CACHE_TTL = 300000; // 5 minutes

export async function getCategories() {
  const now = Date.now();
  if (cachedCategories && cachedCategories.length > 0 && now - lastCategoriesFetchTime < CATEGORIES_CACHE_TTL) {
    return cachedCategories;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your_supabase')) {
    return DEFAULT_CATEGORIES;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .from('categories')
      .select('id,label,emoji,sort_order')
      .order('sort_order', { ascending: true });
    if (error) throw error;

    let result = DEFAULT_CATEGORIES;
    if (data && data.length > 0) {
      const hasAll = data.some((c: any) => c.id === 'all');
      if (hasAll) {
        result = data;
      } else {
        result = [
          { id: 'all', label: 'All Products', emoji: '🎆', sort_order: 0 },
          ...data.map((c: any) => ({
            id: c.id,
            label: c.label,
            emoji: c.emoji || '✨',
            sort_order: c.sort_order ?? 0,
          }))
        ];
      }
    }
    cachedCategories = result;
    lastCategoriesFetchTime = now;
    return result;
  } catch (err) {
    console.error('Failed to fetch categories:', err);
    return cachedCategories || DEFAULT_CATEGORIES;
  }
}

// In-memory RAM cache for ultra-fast (<0.1ms) catalog serving with high-speed DB sync
let cachedProducts: Product[] | null = null;
let lastProductsFetchTime = 0;
let isFetchingProducts = false;
const PRODUCTS_CACHE_TTL = 10000; // 10 seconds SWR TTL to ensure near-instant sync

export function clearProductsCache() {
  cachedProducts = null;
  lastProductsFetchTime = 0;
  cachedCategories = null;
  lastCategoriesFetchTime = 0;
}

// Background revalidation worker that doesn't block user requests
async function refreshProductsInBackground(supabaseUrl: string, supabaseKey: string) {
  if (isFetchingProducts) return;
  isFetchingProducts = true;
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .from('products')
      .select('id,name_en,name_ta,slug,category,price,mrp,discount_percent,badge_text,image_url,description_en,description_ta,in_stock,is_featured,is_eco_friendly,sort_order')
      .order('sort_order', { ascending: true })
      .order('category', { ascending: true })
      .order('price', { ascending: true })
      .limit(1000);

    if (!error && data && data.length > 0) {
      cachedProducts = data.map((p: any) => {
        let img = p.image_url;
        if (img && typeof img === 'string' && img.startsWith('data:image')) {
          img = `/api/product-image/${p.id}`;
        } else if (!img) {
          img = `/products/${p.slug}.jpg`;
        }
        return { ...p, image_url: img };
      });
      lastProductsFetchTime = Date.now();
    }
  } catch (err) {
    console.error('Background product refresh error:', err);
  } finally {
    isFetchingProducts = false;
  }
}

export async function getProducts(): Promise<Product[]> {
  const now = Date.now();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  // If cache is fresh (<10s), return immediately for instant <0.1ms response
  if (cachedProducts && cachedProducts.length > 0) {
    if (now - lastProductsFetchTime >= PRODUCTS_CACHE_TTL && supabaseUrl && supabaseKey && !supabaseUrl.includes('your_supabase')) {
      refreshProductsInBackground(supabaseUrl, supabaseKey);
    }
    return cachedProducts;
  }

  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your_supabase')) {
    cachedProducts = (staticProducts as unknown as Product[]);
    lastProductsFetchTime = now;
    return cachedProducts;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .from('products')
      .select('id,name_en,name_ta,slug,category,price,mrp,discount_percent,badge_text,image_url,description_en,description_ta,in_stock,is_featured,is_eco_friendly,sort_order')
      .order('sort_order', { ascending: true })
      .order('category', { ascending: true })
      .order('price', { ascending: true })
      .limit(1000);
    if (error) throw error;

    const sanitized: Product[] = (data || []).map((p: any) => {
      let img = p.image_url;
      if (img && typeof img === 'string' && img.startsWith('data:image')) {
        img = `/api/product-image/${p.id}`;
      } else if (!img) {
        img = `/products/${p.slug}.jpg`;
      }
      return { ...p, image_url: img };
    });

    if (sanitized.length > 0) {
      cachedProducts = sanitized;
      lastProductsFetchTime = now;
      return cachedProducts;
    }

    return (staticProducts as unknown as Product[]);
  } catch (err) {
    console.error('Failed to fetch products from database:', err);
    return cachedProducts || (staticProducts as unknown as Product[]);
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const decoded = decodeURIComponent(slug);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your_supabase')) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data, error } = await supabase
        .from('products')
        .select('id,name_en,name_ta,slug,category,price,mrp,discount_percent,badge_text,image_url,description_en,description_ta,in_stock,is_featured,is_eco_friendly,sort_order')
        .or(`slug.eq.${decoded},id.eq.${decoded},slug.eq.${slug}`)
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        let img = data.image_url;
        if (!img || img.startsWith('data:image')) {
          img = `/api/product-image/${data.id}`;
        }
        return { ...data, image_url: img } as unknown as Product;
      }
    } catch (err) {
      console.error('Failed to get product by slug from Supabase:', err);
    }
  }

  // Fallback to catalog
  const products = await getProducts();
  const found = products.find(p => p.slug === decoded || p.id === decoded || p.slug === slug);
  return found || null;
}

export async function getRelatedProducts(category: string, currentId: string, limit = 4): Promise<Product[]> {
  const products = await getProducts();
  return products
    .filter(p => p.category === category && p.id !== currentId)
    .slice(0, limit);
}
