import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔌 Connecting to database...');
  await prisma.$connect();
  console.log('✅ Database connected');

  const cascadingModels = [
    { name: 'CartItem', model: prisma.cartItem },
    { name: 'Favorite', model: prisma.favorite },
    { name: 'Review', model: prisma.review },
    { name: 'ProductVariant', model: prisma.productVariant },
    { name: 'InventoryEntry', model: prisma.inventoryEntry },
    { name: 'StockMovement', model: prisma.stockMovement },
    { name: 'Barcode', model: prisma.barcode },
  ];

  const blockingModels = [
    { name: 'OrderItem', model: prisma.orderItem },
    { name: 'BulkOrderItem', model: prisma.bulkOrderItem },
    { name: 'PurchaseOrderItem', model: prisma.purchaseOrderItem },
    { name: 'StockTransferItem', model: prisma.stockTransferItem },
    { name: 'StockAdjustmentItem', model: prisma.stockAdjustmentItem },
  ];

  console.log('🔄 Deleting dependent records without onDelete cascades...');
  for (const m of blockingModels) {
    const count = await m.model.count();
    if (count > 0) {
      console.log(`  Deleting ${count} ${m.name}(s)...`);
      await m.model.deleteMany({});
    }
  }

  console.log('🔄 Deleting products (this cascades to related records with onDelete: Cascade / SetNull)...');
  const productCount = await prisma.product.count();
  if (productCount > 0) {
    console.log(`  Deleting ${productCount} product(s)...`);
    await prisma.product.deleteMany({});
  } else {
    console.log('  No products found to delete.');
  }

  console.log('✅ All products and dependent data cleared successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Error clearing products:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
