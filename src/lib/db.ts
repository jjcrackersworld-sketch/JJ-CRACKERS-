import { createClient } from '@supabase/supabase-js';
import type { Product } from './supabase/types';

// The definitive 12 categories for JJ Crackers — must match Supabase `categories` table
export const DEFAULT_CATEGORIES = [
  { id: 'all', label: 'All Products', emoji: '🎆', sort_order: 0 },
  { id: 'single-sound', label: 'Single Sound', emoji: '💥', sort_order: 1 },
  { id: 'chakkars', label: 'Ground Chakkars', emoji: '🌀', sort_order: 2 },
  { id: 'flowerpots', label: 'Flower Pots', emoji: '🌸', sort_order: 3 },
  { id: 'rockets', label: 'Sky Rockets', emoji: '🚀', sort_order: 4 },
  { id: 'bombs', label: 'Sound Bombs', emoji: '💣', sort_order: 5 },
  { id: 'novelties', label: 'Fancy Novelties', emoji: '🎭', sort_order: 6 },
  { id: 'sparklers', label: 'Sparklers', emoji: '✨', sort_order: 7 },
  { id: 'bijili', label: 'Bijili Crackers', emoji: '⚡', sort_order: 8 },
  { id: 'chain', label: 'Chain Crackers', emoji: '🔗', sort_order: 9 },
  { id: 'fountains', label: 'Fountains', emoji: '⛲', sort_order: 10 },
  { id: 'multishots', label: 'Multi Shots', emoji: '🎇', sort_order: 11 },
  { id: 'giftbox', label: 'Gift Boxes', emoji: '🎁', sort_order: 12 },
];

let cachedCategories: any[] | null = null;
let lastCategoriesFetchTime = 0;
const CATEGORIES_CACHE_TTL = 60000; // 60 seconds

export async function getCategories() {
  const now = Date.now();
  if (cachedCategories && now - lastCategoriesFetchTime < CATEGORIES_CACHE_TTL) {
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

// In-memory cache for ultra-fast (<1ms) catalog serving
let cachedProducts: Product[] | null = null;
let lastProductsFetchTime = 0;
const PRODUCTS_CACHE_TTL = 300000; // 5 minutes cache for blazing speed

export function clearProductsCache() {
  cachedProducts = null;
  lastProductsFetchTime = 0;
  cachedCategories = null;
  lastCategoriesFetchTime = 0;
}

export async function getProducts(): Promise<Product[]> {
  const now = Date.now();
  if (cachedProducts && now - lastProductsFetchTime < PRODUCTS_CACHE_TTL) {
    return cachedProducts;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your_supabase')) {
    return [];
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .from('products')
      .select('id,name_en,name_ta,slug,category,price,mrp,discount_percent,badge_text,image_url,in_stock,is_featured,is_eco_friendly,sort_order')
      .order('sort_order', { ascending: true })
      .order('category', { ascending: true })
      .order('price', { ascending: true })
      .limit(1000);
    if (error) throw error;

    const sanitized: Product[] = (data || []).map((p: any) => ({
      ...p,
      image_url: p.image_url || `/products/${p.slug}.jpg` || `/product-assets/${p.id}.jpg`,
    }));

    cachedProducts = sanitized;
    lastProductsFetchTime = now;
    return sanitized;
  } catch (err) {
    console.error('Failed to fetch products:', err);
    return cachedProducts || [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await getProducts();
  const decoded = decodeURIComponent(slug);
  const found = products.find(p => p.slug === decoded || p.id === decoded || p.slug === slug);
  if (found) return found;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!supabaseUrl || !supabaseKey) return null;

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data } = await supabase
      .from('products')
      .select('id,name_en,name_ta,slug,category,price,mrp,discount_percent,badge_text,image_url,in_stock,is_featured,is_eco_friendly,sort_order')
      .or(`slug.eq.${decoded},id.eq.${decoded},slug.eq.${slug}`)
      .limit(1)
      .maybeSingle();

    if (data) {
      let img = data.image_url;
      if (!img || img.startsWith('data:image')) {
        img = `/api/product-image/${data.id}`;
      }
      return { ...data, image_url: img } as unknown as Product;
    }
  } catch (err) {
    console.error('Failed to get product by slug:', err);
  }
  return null;
}

export async function getRelatedProducts(category: string, currentId: string, limit = 4): Promise<Product[]> {
  const products = await getProducts();
  return products
    .filter(p => p.category === category && p.id !== currentId)
    .slice(0, limit);
}
