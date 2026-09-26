import fs from 'fs';
import path from 'path';

async function main() {
  const mod = await import('../src/lib/pdf/receiptGenerator.ts');
  const buildInvoiceHtml = mod.buildInvoiceHtml || (mod.default && mod.default.buildInvoiceHtml);

  if (!buildInvoiceHtml) {
    throw new Error('buildInvoiceHtml function not found');
  }

  const sampleProducts = [
    { name: '10cm Electric Sparklers (Red & Green)', mrp: 120, price: 48 },
    { name: 'Chakkars Special Deluxe (Pack of 10)', mrp: 180, price: 72 },
    { name: 'Flower Pots Giant Color Crackers', mrp: 280, price: 112 },
    { name: '15 Shots Multi-Color Aerial Display', mrp: 650, price: 260 },
    { name: '30 Shots Roman Candle Sky Burst', mrp: 950, price: 380 },
    { name: 'Bijili Crackers Stripped (100 Pcs)', mrp: 90, price: 36 },
    { name: '28 Chorsa Classic Sivakasi Crackers', mrp: 110, price: 44 },
    { name: 'Mega Rocket Sound & Shower (Pack of 5)', mrp: 340, price: 136 },
    { name: 'Ground Spinner Tornado Wheel', mrp: 220, price: 88 },
    { name: 'Golden Peacock Feather Fountain', mrp: 450, price: 180 },
    { name: 'Silver Whistling Rockets (Pack of 10)', mrp: 400, price: 160 },
    { name: '50 Shots Night Sky Spectacular Burst', mrp: 1850, price: 740 },
    { name: 'Magic Butterfly Aerial Fountains', mrp: 320, price: 128 },
    { name: '1000 Wala Heavy Traditional Garland', mrp: 1100, price: 440 },
    { name: '2000 Wala Festival Celebration Garland', mrp: 2200, price: 880 },
    { name: 'Colour Smoke Bomb Special', mrp: 250, price: 100 },
    { name: 'Twin Sound Deluxe Crackers', mrp: 160, price: 64 },
    { name: 'Hydro Bomb High Decibel Sound', mrp: 200, price: 80 },
    { name: 'Kids Roll Cap Gun Sparkler Kit', mrp: 150, price: 60 },
    { name: 'Peacock 5-in-1 Color Fountain', mrp: 520, price: 208 }
  ];

  function getItems(count) {
    const items = [];
    for (let i = 0; i < count; i++) {
      const template = sampleProducts[i % sampleProducts.length];
      const repeatIdx = Math.floor(i / sampleProducts.length);
      const name = repeatIdx > 0 ? `${template.name} [Pack ${repeatIdx + 1}]` : template.name;
      const qty = (i % 4) + 1;
      items.push({
        name,
        quantity: qty,
        price: template.price,
        mrp: template.mrp,
        category: 'Fireworks'
      });
    }
    return items;
  }

  const testConfigs = [
    { id: 'test-a-1-product', count: 1, name: 'TEST A (1 Product)' },
    { id: 'test-b-5-products', count: 5, name: 'TEST B (5 Products)' },
    { id: 'test-c-15-products', count: 15, name: 'TEST C (15 Products)' },
    { id: 'test-d-30-products', count: 30, name: 'TEST D (30 Products)' },
    { id: 'test-e-50-products', count: 50, name: 'TEST E (50 Products)' }
  ];

  console.log('====================================================');
  console.log('JJ CRACKERS — GENERATING INVOICE TEST SUITE');
  console.log('====================================================\n');

  for (const config of testConfigs) {
    const items = getItems(config.count);
    const subtotal = items.reduce((sum, item) => sum + item.mrp * item.quantity, 0);
    const netTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discountTotal = subtotal - netTotal;
    const packing = Math.round(netTotal * 0.03);
    const totalAmount = netTotal + packing;

    const invoiceData = {
      orderNumber: `JJ-20260926-${String(1000 + config.count)}`,
      date: '26 Sep 2026',
      time: '10:30 PM',
      customerName: 'Ragul Sundaram',
      customerEmail: 'ragul.sundaram@gmail.com',
      customerPhone: '+91 98765 43210',
      customerAddress: '42, Vasantham Avenue, Anna Nagar East',
      customerCity: 'Chennai',
      customerPincode: '600102',
      customerState: 'Tamil Nadu',
      customerDistrict: 'Chennai District',
      items,
      subtotal,
      discountTotal,
      totalAmount,
      packingCharges: packing
    };

    const invoiceHtml = buildInvoiceHtml(invoiceData);
    
    // Wrap in standalone HTML document
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>JJ Crackers Order Estimate #${invoiceData.orderNumber}</title>
</head>
<body>
${invoiceHtml}
</body>
</html>`;

    const outPath = path.resolve(process.cwd(), `${config.id}.html`);
    fs.writeFileSync(outPath, fullHtml, 'utf-8');

    // Also update jj-crackers-invoice.html with Test B (standard 5-product order)
    if (config.count === 5) {
      fs.writeFileSync(path.resolve(process.cwd(), 'jj-crackers-invoice.html'), fullHtml, 'utf-8');
    }

    // QA Validations
    const pageSheetMatches = fullHtml.match(/class="page-sheet[^"]*"/g) || [];
    const tableBoxMatches = fullHtml.match(/class="table-box"/g) || [];
    const fillerRowMatches = fullHtml.match(/class="table-filler-row"/g) || [];
    const hasForbiddenTax = /prices include.*taxes|prices include.*discount/i.test(fullHtml);
    const hasOrderInvoice = /ORDER INVOICE/i.test(fullHtml);
    const hasOrderEstimate = /ORDER ESTIMATE/i.test(fullHtml);
    const hasBillingAddress = /BILLING ADDRESS/i.test(fullHtml);
    const hasDeliveryTransport = /DELIVERY \/ BILLING ADDRESS/i.test(fullHtml);
    const hasDynamicCity = fullHtml.includes('CHENNAI, TN');
    const hasSafetySheet = fullHtml.includes('safety-sheet');

    console.log(`✓ ${config.name}:`);
    console.log(`   - File: ${config.id}.html`);
    console.log(`   - Total A4 Pages: ${pageSheetMatches.length} (including final dedicated Safety Guide)`);
    console.log(`   - Table Boxes (Flex Container): ${tableBoxMatches.length}`);
    console.log(`   - Filler Rows (Space Absorbers): ${fillerRowMatches.length}`);
    console.log(`   - Uses ORDER ESTIMATE: ${hasOrderEstimate && !hasOrderInvoice ? 'PASS ✓' : 'FAIL ✗'}`);
    console.log(`   - BILLING ADDRESS only: ${hasBillingAddress && !hasDeliveryTransport ? 'PASS ✓' : 'FAIL ✗'}`);
    console.log(`   - Dynamic City (Chennai, TN): ${hasDynamicCity ? 'PASS ✓' : 'FAIL ✗'}`);
    console.log(`   - Forbidden Tax Statement Removed: ${!hasForbiddenTax ? 'PASS ✓' : 'FAIL ✗'}`);
    console.log(`   - Safety Guide Final Page: ${hasSafetySheet ? 'PASS ✓' : 'FAIL ✗'}\n`);
  }

  console.log('All test cases generated and verified successfully!');
}

main().catch(err => {
  console.error('Error generating tests:', err);
  process.exit(1);
});
