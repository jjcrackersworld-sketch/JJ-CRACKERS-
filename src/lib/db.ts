import { createClient } from '@supabase/supabase-js';
import type { Product } from './supabase/types';

// The definitive 20 categories for JJ Crackers — must match Supabase `categories` table
export const DEFAULT_CATEGORIES = [
  { id: 'all', label: 'All Products', emoji: '🎆', sort_order: 0 },
  { id: 'single-sound', label: 'Single Sound Crackers', emoji: '💥', sort_order: 1 },
  { id: 'ground-chakkars', label: 'Ground Chakkars', emoji: '🌀', sort_order: 2 },
  { id: 'flowerpots', label: 'Flower Pots', emoji: '🌸', sort_order: 3 },
  { id: 'bijili', label: 'Bijili', emoji: '⚡', sort_order: 4 },
  { id: 'thunder-paper-bomb', label: 'Thunder Paper Bomb', emoji: '💣', sort_order: 5 },
  { id: 'thunder-sound-bomb', label: 'Thunder Sound Bomb', emoji: '🔊', sort_order: 6 },
  { id: 'twinkling-star', label: 'Twinkling Star', emoji: '🌟', sort_order: 7 },
  { id: 'sky-jet', label: 'Sky Jet', emoji: '🚀', sort_order: 8 },
  { id: 'pencil-fountains', label: 'Pencil Fountains', emoji: '✏️', sort_order: 9 },
  { id: 'red-chain', label: 'Red Chain Crackers', emoji: '🔗', sort_order: 10 },
  { id: 'nano-fountains', label: 'Nano Fountains', emoji: '⛲', sort_order: 11 },
  { id: 'joy-fountains', label: 'Joy Fountains', emoji: '🎆', sort_order: 12 },
  { id: 'pearl-fountains', label: 'Pearl Fountains', emoji: '💎', sort_order: 13 },
  { id: 'amazing-fountains', label: 'Amazing Fountains', emoji: '✨', sort_order: 14 },
  { id: 'royal-fountains', label: 'Royal Fountains', emoji: '👑', sort_order: 15 },
  { id: 'fancy-novelties', label: 'Fancy Novelties', emoji: '🎭', sort_order: 16 },
  { id: 'multishots', label: 'Multi Shots', emoji: '🎇', sort_order: 17 },
  { id: 'sky-expo-multishots', label: 'Sky Expo Multi Shots (Premium)', emoji: '🏆', sort_order: 18 },
  { id: 'sparklers', label: 'Sparklers', emoji: '✨', sort_order: 19 },
  { id: 'match-box', label: 'Match Box', emoji: '📦', sort_order: 20 },
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

// In-memory cache for ultra-fast (<5ms) catalog serving
let cachedProducts: Product[] | null = null;
let lastProductsFetchTime = 0;
const PRODUCTS_CACHE_TTL = 30000; // 30 seconds

export async function getProducts() {
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

    const sanitized = (data || []).map((p: any) => {
      // Offload giant raw base64 data URLs to dedicated streaming endpoint
      // This reduces HTML and JSON payload from 24.4 MB to <100 KB!
      if (p.image_url && p.image_url.startsWith('data:image')) {
        return { ...p, image_url: `/api/product-image/${p.id}` };
      }
      return p;
    });

    cachedProducts = sanitized;
    lastProductsFetchTime = now;
    return sanitized;
  } catch (err) {
    console.error('Failed to fetch products:', err);
    return cachedProducts || [];
  }
}
