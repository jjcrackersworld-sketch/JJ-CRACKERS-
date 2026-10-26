const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

// --- Config ---
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gllzlcgykefdmqhcfxjr.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_publishable_m8kOsJiJ_Yx80wQgg92mnA_lX5i1FRS';

// Safety Guard against accidental execution
if (!process.argv.includes('--force-approved-seed')) {
  console.error('\n🛑 CRITICAL PRODUCTION PROTECTION ERROR:');
  console.error('This seed script modifies the live production catalog in Supabase.');
  console.error('To prevent accidental execution and data loss, you must explicitly pass:');
  console.error('   node scripts/seed-from-ts.js --force-approved-seed\n');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  console.log('🌌 Syncing Supabase products from src/lib/data/products.ts...');

  const productsFilePath = path.join(__dirname, '..', 'src/lib/data/products.ts');
  const fileContent = fs.readFileSync(productsFilePath, 'utf8');

  const arrayStart = fileContent.indexOf('export const products: Product[] = [');
  if (arrayStart === -1) {
    console.error('❌ Could not find products array start in products.ts');
    process.exit(1);
  }

  const arrayContentStr = fileContent.substring(arrayStart + 'export const products: Product[] = '.length);
  const cleanArrayStr = arrayContentStr.trim().replace(/;$/, '');

  let staticProducts;
  try {
    staticProducts = eval(cleanArrayStr);
  } catch (e) {
    console.error('❌ Failed to parse products array:', e.message);
    process.exit(1);
  }

  if (staticProducts.length !== 150) {
    console.error(`❌ INVARIANT ERROR: Expected 150 products, loaded ${staticProducts.length}. Aborting.`);
    process.exit(1);
  }

  console.log(`   Loaded ${staticProducts.length} approved products from products.ts`);

  // Map to Supabase schema preserving exact IDs
  const mapped = staticProducts.map((p, index) => ({
    id: p.id,
    name_en: p.name_en,
    name_ta: p.name_ta || p.name_en,
    slug: p.slug,
    category: p.category,
    price: p.price,
    mrp: p.mrp,
    discount_percent: p.discount_percent || 0,
    badge_text: p.badge_text || null,
    image_url: p.image_url || `/product-assets/${p.id}.jpg`,
    in_stock: p.in_stock !== undefined ? p.in_stock : true,
    is_featured: p.is_featured || false,
    is_eco_friendly: false,
    sort_order: index,
  }));

  // Safely Upsert in batches of 25 (Never blindly delete all rows!)
  console.log('📤 Upserting canonical products in batches of 25...');
  const BATCH_SIZE = 25;
  let totalInserted = 0;

  for (let i = 0; i < mapped.length; i += BATCH_SIZE) {
    const batch = mapped.slice(i, i + BATCH_SIZE);
    const { data, error } = await supabase.from('products').upsert(batch, { onConflict: 'id' }).select('id');

    if (error) {
      console.error(`   ❌ Batch ${Math.floor(i / BATCH_SIZE) + 1} failed:`, error.message);
    } else {
      totalInserted += data.length;
      console.log(`   ✅ Synced ${totalInserted}/${mapped.length} products`);
    }
  }

  console.log(`\n🎉 Success! Synchronized ${totalInserted} approved products.`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
