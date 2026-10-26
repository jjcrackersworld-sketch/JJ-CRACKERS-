import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/admin-auth';

import { products as staticProducts } from '@/lib/data/products';

export const dynamic = 'force-dynamic';

// The definitive 12 categories for JJ Crackers
const NEW_CATEGORIES = [
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

// Map old category IDs to clean new ones
const CATEGORY_REMAP: Record<string, string> = {
  'ground-chakkars': 'chakkars',
  'GROUND CHAKKAR': 'chakkars',
  'thunder-sound-bomb': 'bombs',
  'THUNDER SOUND BOMP': 'bombs',
  'THUNDER PAPER BOMP': 'bombs',
  'thunder-paper-bomb': 'bombs',
  'sky-jet': 'rockets',
  'SKY JETS': 'rockets',
  'red-chain': 'chain',
  'RED CHAIN CRACKERS': 'chain',
  'nano-fountains': 'fountains',
  'joy-fountains': 'fountains',
  'pearl-fountains': 'fountains',
  'amazing-fountains': 'fountains',
  'royal-fountains': 'fountains',
  'NANO FOUNTAINS': 'fountains',
  'JOY FOUNTAINS': 'fountains',
  'PEARL FOUNTAINS': 'fountains',
  'AMAZING FOUNTAINS': 'fountains',
  'ROYAL FOUNTAINS': 'fountains',
  'fancy-novelties': 'novelties',
  'FANCY NOVELTIES': 'novelties',
  'PENCIL FUNCTIONS': 'novelties',
  'pencil-fountains': 'novelties',
  'MULTI SHOTS': 'multishots',
  'sky-expo-multishots': 'multishots',
  'SKY EXPO - MULTI SHOTS (PREMIUM)': 'multishots',
  'SPARKLERS': 'sparklers',
  'TWINKLING STAR': 'sparklers',
  'twinkling-star': 'sparklers',
  'match-box': 'novelties',
  'MATCH BOX': 'novelties',
  'GIFT BOXES': 'giftbox',
  'COMBO PACK': 'giftbox',
};

// POST — Full Supabase cleanup
export async function POST(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your_supabase')) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const report: string[] = [];
    const validCategoryIds = NEW_CATEGORIES.map(c => c.id);

    // ═══════════════════════════════════════════
    // 1. CLEANUP: Remove duplicate combo packs
    // ═══════════════════════════════════════════
    const { data: allCombos } = await supabase
      .from('combo_packs')
      .select('id,combo_name,created_at')
      .order('created_at', { ascending: false });

    if (allCombos && allCombos.length > 0) {
      const seen = new Map<string, string>();
      const duplicateIds: string[] = [];

      for (const combo of allCombos) {
        const normalizedName = (combo.combo_name || '').toLowerCase().trim();
        if (seen.has(normalizedName)) {
          duplicateIds.push(combo.id);
        } else {
          seen.set(normalizedName, combo.id);
        }
      }

      if (duplicateIds.length > 0) {
        const { error } = await supabase
          .from('combo_packs')
          .delete()
          .in('id', duplicateIds);
        if (!error) {
          report.push(`✅ Removed ${duplicateIds.length} duplicate combo packs`);
        } else {
          report.push(`⚠️ Failed to remove duplicate combos: ${error.message}`);
        }
      } else {
        report.push('✅ No duplicate combo packs found');
      }
    }

    // ═══════════════════════════════════════════
    // 2. CLEANUP: Seed/update categories table
    // ═══════════════════════════════════════════
    // First delete all old categories
    const { error: delCatErr } = await supabase
      .from('categories')
      .delete()
      .neq('id', '___never_match___'); // delete all rows

    if (delCatErr) {
      report.push(`⚠️ Failed to clear old categories: ${delCatErr.message}`);
    }

    // Insert the 20 new categories
    const { data: insertedCats, error: insertCatErr } = await supabase
      .from('categories')
      .upsert(NEW_CATEGORIES, { onConflict: 'id' })
      .select();

    if (insertCatErr) {
      report.push(`⚠️ Failed to seed categories: ${insertCatErr.message}`);
    } else {
      report.push(`✅ Seeded ${insertedCats?.length || 0} categories`);
    }

    // ═══════════════════════════════════════════
    // 3. CLEANUP: Remap old product categories
    // ═══════════════════════════════════════════
    let remappedCount = 0;
    for (const [oldCat, newCat] of Object.entries(CATEGORY_REMAP)) {
      const { data: updatedProducts, error: updateErr } = await supabase
        .from('products')
        .update({ category: newCat })
        .eq('category', oldCat)
        .select('id');

      if (!updateErr && updatedProducts) {
        remappedCount += updatedProducts.length;
      }
    }
    if (remappedCount > 0) {
      report.push(`✅ Remapped ${remappedCount} products from old categories to new ones`);
    } else {
      report.push('✅ No products needed category remapping');
    }

    // ═══════════════════════════════════════════
    // 4. CLEANUP: Flag products with invalid categories
    // ═══════════════════════════════════════════
    const { data: allProducts } = await supabase
      .from('products')
      .select('id,name_en,category');

    if (allProducts) {
      const invalidProducts = allProducts.filter(p => !validCategoryIds.includes(p.category));
      if (invalidProducts.length > 0) {
        report.push(`⚠️ ${invalidProducts.length} products have categories not in the new 20-category list:`);
        invalidProducts.slice(0, 10).forEach(p => {
          report.push(`   - "${p.name_en}" has category "${p.category}"`);
        });
        if (invalidProducts.length > 10) {
          report.push(`   ... and ${invalidProducts.length - 10} more`);
        }
      } else {
        report.push('✅ All products have valid categories');
      }
    }

    // ═══════════════════════════════════════════
    // 4.5 CLEANUP: Remove products not in canonical catalog
    // ═══════════════════════════════════════════
    const canonicalSlugs = new Set(staticProducts.map(p => p.slug));
    const { data: currentCatalog } = await supabase.from('products').select('id,name_en,slug');
    if (currentCatalog) {
      const rogue = currentCatalog.filter(p => !canonicalSlugs.has(p.slug));
      if (rogue.length > 0) {
        const rogueIds = rogue.map(p => p.id);
        const { error: rogueErr } = await supabase.from('products').delete().in('id', rogueIds);
        if (!rogueErr) {
          report.push(`✅ Removed ${rogue.length} unauthorized/legacy products not in official catalog`);
        } else {
          report.push(`⚠️ Failed to remove rogue products: ${rogueErr.message}`);
        }
      } else {
        report.push('✅ All products strictly match the official JJ Crackers catalog');
      }
    }

    // ═══════════════════════════════════════════
    // 5. CLEANUP: Remove products with no name
    // ═══════════════════════════════════════════
    const { data: noNameProducts, error: noNameErr } = await supabase
      .from('products')
      .delete()
      .or('name_en.is.null,name_en.eq.')
      .select('id');

    if (!noNameErr && noNameProducts && noNameProducts.length > 0) {
      report.push(`✅ Removed ${noNameProducts.length} products with no name`);
    }

    // ═══════════════════════════════════════════
    // 5.5 CLEANUP: Remove all newsletter subscribers
    // ═══════════════════════════════════════════
    const { data: newsletterDeleted, error: newsletterErr } = await supabase
      .from('newsletter_subscribers')
      .delete()
      .neq('email', '___never_match___')
      .select('id');

    if (!newsletterErr && newsletterDeleted) {
      report.push(`✅ Cleared ${newsletterDeleted.length} subscriber records from newsletter table`);
    } else if (newsletterErr) {
      report.push(`⚠️ Failed to clear newsletter table: ${newsletterErr.message}`);
    }

    // ═══════════════════════════════════════════
    // 6. STATS
    // ═══════════════════════════════════════════
    const { count: productCount } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true });

    const { count: comboCount } = await supabase
      .from('combo_packs')
      .select('id', { count: 'exact', head: true });

    const { count: categoryCount } = await supabase
      .from('categories')
      .select('id', { count: 'exact', head: true });

    report.push('');
    report.push(`📊 Final counts: ${productCount || 0} products, ${comboCount || 0} combos, ${categoryCount || 0} categories`);

    return NextResponse.json({
      success: true,
      report,
      stats: {
        products: productCount || 0,
        combos: comboCount || 0,
        categories: categoryCount || 0,
      }
    });
  } catch (error: any) {
    console.error('Cleanup error:', error);
    return NextResponse.json({
      error: error.message || 'Cleanup failed',
    }, { status: 500 });
  }
}
