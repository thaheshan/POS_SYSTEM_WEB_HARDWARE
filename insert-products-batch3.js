const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting Batch 3 Inventory Insertion & Stock Audit Update (4/9/26 Evening)...');

  // 1. Get Main Warehouse
  const warehouse = await prisma.warehouse.findFirst({
    where: { isMain: true },
  }) || await prisma.warehouse.findFirst();

  if (!warehouse) {
    console.error('❌ Error: No warehouse found in database!');
    return;
  }
  console.log(`📦 Target Warehouse: ${warehouse.name} (${warehouse.id})`);

  // Helper: Find or Create Category
  async function getCategory(name) {
    let cat = await prisma.category.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });
    if (!cat) {
      cat = await prisma.category.create({ data: { name } });
      console.log(`✨ Created Category: ${name}`);
    }
    return cat;
  }

  // Helper: Find or Create Subcategory
  async function getSubCategory(name, categoryId) {
    let sub = await prisma.subCategory.findFirst({
      where: { name: { equals: name, mode: 'insensitive' }, categoryId },
    });
    if (!sub) {
      sub = await prisma.subCategory.create({ data: { name, categoryId } });
      console.log(`✨ Created Subcategory: ${name}`);
    }
    return sub;
  }

  // Helper: Find or Create Brand
  async function getBrand(name, subCategoryId) {
    let brand = await prisma.brand.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });
    if (!brand) {
      brand = await prisma.brand.create({
        data: { name, categoryId: subCategoryId },
      });
      console.log(`✨ Created Brand: ${name}`);
    }
    return brand;
  }

  // 2. Fetch or create Categories
  const catFans = await getCategory('Ceiling Fans');
  const catTools = await getCategory('Power Tools');
  const catCleaning = await getCategory('Cleaning & Hardware');

  // Subcategories
  const subFans = await getSubCategory('Ceiling Fans', catFans.id);
  const subPumps = await getSubCategory('Water Pumps', catTools.id);
  const subPowerTools = await getSubCategory('Power Tools', catTools.id);
  const subBrooms = await getSubCategory('Brooms & Mops', catCleaning.id);

  // Brands
  const brandHavells = await getBrand('Havells', subFans.id);
  const brandBajaj = await getBrand('Bajaj', subFans.id);
  const brandRegnis = await getBrand('Regnis', subPumps.id);
  const brandIngco = await getBrand('INGCO', subPumps.id);
  const brandSinger = await getBrand('Singer', subPumps.id);
  const brandMakute = await getBrand('Makute', subPowerTools.id);

  // 3. Define Batch Data (From Audit Note 4/9/26)
  const auditItems = [
    // --- Havells Ceiling Fans (New) ---
    { name: 'Havells Ceiling Fan (Matt Black)', brandId: brandHavells.id, categoryId: catFans.id, subCategoryId: subFans.id, qty: 1, cost: 18500, price: 21500 },
    { name: 'Havells Ceiling Fan (Matt White)', brandId: brandHavells.id, categoryId: catFans.id, subCategoryId: subFans.id, qty: 5, cost: 18500, price: 21500 },

    // --- Bajaj Ceiling Fans (Existing - Add Qty) ---
    { name: 'Bajaj Ceiling Fan 56" (Ivory)', brandId: brandBajaj.id, categoryId: catFans.id, subCategoryId: subFans.id, qty: 18, cost: 14500, price: 16800 },
    { name: 'Bajaj Ceiling Fan 56" (White)', brandId: brandBajaj.id, categoryId: catFans.id, subCategoryId: subFans.id, qty: 3, cost: 14500, price: 16800 },
    { name: 'Bajaj Ceiling Fan 56" (Brown)', brandId: brandBajaj.id, categoryId: catFans.id, subCategoryId: subFans.id, qty: 1, cost: 14500, price: 16800 },

    // --- Pumps & Power Tools (New) ---
    { name: 'Tube Well Pump (Regnis)', brandId: brandRegnis.id, categoryId: catTools.id, subCategoryId: subPumps.id, qty: 1, cost: 28000, price: 32500 },
    { name: 'Water Pump 550W (INGCO)', brandId: brandIngco.id, categoryId: catTools.id, subCategoryId: subPumps.id, qty: 3, cost: 22000, price: 25500 },
    { name: 'Water Pump (Singer)', brandId: brandSinger.id, categoryId: catTools.id, subCategoryId: subPumps.id, qty: 2, cost: 19500, price: 23000 },
    { name: 'Electric Planer 600W (Makute)', brandId: brandMakute.id, categoryId: catTools.id, subCategoryId: subPowerTools.id, qty: 1, cost: 13500, price: 15800 },

    // --- Brooms & Mops (New) ---
    { name: 'Broom (Standard)', brandId: null, categoryId: catCleaning.id, subCategoryId: subBrooms.id, qty: 20, cost: 350, price: 480 },
    { name: 'Wiper (Floor)', brandId: null, categoryId: catCleaning.id, subCategoryId: subBrooms.id, qty: 7, cost: 650, price: 850 },
    { name: 'Cobweb Brush', brandId: null, categoryId: catCleaning.id, subCategoryId: subBrooms.id, qty: 3, cost: 750, price: 980 },
    { name: 'Floor Mop 350g', brandId: null, categoryId: catCleaning.id, subCategoryId: subBrooms.id, qty: 8, cost: 850, price: 1150 },
    { name: 'Floor Mop 250g', brandId: null, categoryId: catCleaning.id, subCategoryId: subBrooms.id, qty: 10, cost: 650, price: 880 },
    { name: 'Outdoor Broom', brandId: null, categoryId: catCleaning.id, subCategoryId: subBrooms.id, qty: 7, cost: 450, price: 620 },
  ];

  // Get current max SKU index to assign clean SKUs
  const allProducts = await prisma.product.findMany({ select: { sku: true } });
  let maxSkuNum = 0;
  allProducts.forEach((p) => {
    if (p.sku && p.sku.startsWith('SKU_')) {
      const num = parseInt(p.sku.replace('SKU_', ''), 10);
      if (!isNaN(num) && num > maxSkuNum) maxSkuNum = num;
    }
  });

  for (const item of auditItems) {
    // Check if product already exists by name
    const existing = await prisma.product.findFirst({
      where: { name: { equals: item.name, mode: 'insensitive' } },
      include: { stocks: true },
    });

    if (existing) {
      // Update Stock quantity for existing product
      const currentStock = existing.stocks.find((s) => s.warehouseId === warehouse.id);
      if (currentStock) {
        await prisma.stock.update({
          where: { id: currentStock.id },
          data: { quantity: currentStock.quantity + item.qty },
        });
      } else {
        await prisma.stock.create({
          data: {
            productId: existing.id,
            warehouseId: warehouse.id,
            quantity: item.qty,
          },
        });
      }
      console.log(`🔄 UPDATED Existing Product Stock: "${existing.name}" (+${item.qty} Qty)`);
    } else {
      // Create NEW Product with SKU
      maxSkuNum++;
      const nextSku = `SKU_${String(maxSkuNum).padStart(3, '0')}`;

      const newProd = await prisma.product.create({
        data: {
          name: item.name,
          sku: nextSku,
          barcode: nextSku,
          purchasePrice: item.cost,
          sellingPrice: item.price,
          productType: 'FIX',
          measurementUnit: 'Pieces (pcs)',
          categoryId: item.categoryId,
          subCategoryId: item.subCategoryId,
          brandId: item.brandId,
          stocks: {
            create: {
              warehouseId: warehouse.id,
              quantity: item.qty,
            },
          },
        },
      });
      console.log(`✅ CREATED New Product: "${newProd.name}" (${nextSku}) with ${item.qty} Qty`);
    }
  }

  console.log('\n🎉 Successfully processed batch insertion & stock update!');
}

main()
  .catch((e) => {
    console.error('❌ Error executing batch script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
