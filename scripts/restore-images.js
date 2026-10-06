const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://gllzlcgykefdmqhcfxjr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_m8kOsJiJ_Yx80wQgg92mnA_lX5i1FRS';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function getMime(buf) {
  if (buf[0] === 0xFF && buf[1] === 0xD8) return 'image/jpeg';
  if (buf[0] === 0x89 && buf[1] === 0x50) return 'image/png';
  if (buf.slice(0, 4).toString() === 'RIFF') return 'image/webp';
  return 'image/jpeg';
}

async function restoreAllImages() {
  console.log('🚀 Restoring product images to Supabase database...');
  
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name_en, image_url');

  if (error) {
    console.error('❌ Failed to fetch products:', error);
    process.exit(1);
  }

  console.log(`📦 Fetched ${products.length} products from Supabase.`);

  let updated = 0;
  let alreadyBase64 = 0;
  let missingFiles = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const assetPath = path.join(__dirname, '..', 'public', 'product-assets', `${p.id}.jpg`);

    if (p.image_url && p.image_url.startsWith('data:image')) {
      alreadyBase64++;
      continue;
    }

    if (!fs.existsSync(assetPath)) {
      console.warn(`⚠️  No image file found for product [${p.id}] ${p.name_en}`);
      missingFiles++;
      continue;
    }

    const buf = fs.readFileSync(assetPath);
    const mime = getMime(buf);
    const base64Data = `data:${mime};base64,${buf.toString('base64')}`;

    const { error: upErr } = await supabase
      .from('products')
      .update({ image_url: base64Data })
      .eq('id', p.id);

    if (upErr) {
      console.error(`❌ Failed updating [${p.id}] ${p.name_en}:`, upErr.message);
    } else {
      updated++;
      if (updated % 20 === 0 || updated === products.length) {
        console.log(`  ✅ Progress: ${updated} products restored...`);
      }
    }
  }

  console.log('\n========================================');
  console.log(`🎉 Restore completed!`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Already Base64: ${alreadyBase64}`);
  console.log(`   Missing files: ${missingFiles}`);
  console.log(`   Total products: ${products.length}`);
  console.log('========================================\n');
}

restoreAllImages().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
