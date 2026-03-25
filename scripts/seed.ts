import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔌 Connecting to database...');
  // Test connection first
  await prisma.$connect();
  console.log('✅ Database connected');
  
  // Clear existing categories (ignore if none exist)
  await prisma.category.deleteMany({});
  console.log('🗑️  Cleared existing categories');

  // Comprehensive categories for Enkaji marketplace
  const categories = [
    { id: 'cat_electronics', name: 'Electronics & Technology', slug: 'electronics' },
    { id: 'cat_computers', name: 'Computers & IT Equipment', slug: 'computers-it' },
    { id: 'cat_mobile', name: 'Mobile Phones & Accessories', slug: 'mobile-phones' },
    { id: 'cat_appliances', name: 'Home Appliances', slug: 'home-appliances' },
    { id: 'cat_fashion', name: 'Fashion & Apparel', slug: 'fashion-apparel' },
    { id: 'cat_textiles', name: 'Textiles & Fabrics', slug: 'textiles-fabrics' },
    { id: 'cat_footwear', name: 'Footwear & Leather Goods', slug: 'footwear-leather' },
    { id: 'cat_jewelry', name: 'Jewelry & Accessories', slug: 'jewelry-accessories' },
    { id: 'cat_agriculture', name: 'Agriculture & Farming', slug: 'agriculture-farming' },
    { id: 'cat_food', name: 'Food & Beverages', slug: 'food-beverages' },
    { id: 'cat_livestock', name: 'Livestock & Animal Feed', slug: 'livestock-feed' },
    { id: 'cat_seeds', name: 'Seeds & Fertilizers', slug: 'seeds-fertilizers' },
    { id: 'cat_construction', name: 'Construction Materials', slug: 'construction-materials' },
    { id: 'cat_tools', name: 'Tools & Hardware', slug: 'tools-hardware' },
    { id: 'cat_plumbing', name: 'Plumbing & Electrical', slug: 'plumbing-electrical' },
    { id: 'cat_machinery', name: 'Heavy Machinery & Equipment', slug: 'heavy-machinery' },
    { id: 'cat_automotive', name: 'Automotive Parts & Accessories', slug: 'automotive-parts' },
    { id: 'cat_vehicles', name: 'Vehicles & Transport', slug: 'vehicles-transport' },
    { id: 'cat_tires', name: 'Tires & Wheels', slug: 'tires-wheels' },
    { id: 'cat_health', name: 'Health & Medical Supplies', slug: 'health-medical' },
    { id: 'cat_beauty', name: 'Beauty & Personal Care', slug: 'beauty-personal-care' },
    { id: 'cat_pharmaceuticals', name: 'Pharmaceuticals', slug: 'pharmaceuticals' },
    { id: 'cat_furniture', name: 'Furniture & Decor', slug: 'furniture-decor' },
    { id: 'cat_office', name: 'Office Supplies & Equipment', slug: 'office-supplies' },
    { id: 'cat_kitchen', name: 'Kitchen & Dining', slug: 'kitchen-dining' },
    { id: 'cat_industrial', name: 'Industrial Equipment', slug: 'industrial-equipment' },
    { id: 'cat_chemicals', name: 'Chemicals & Raw Materials', slug: 'chemicals-materials' },
    { id: 'cat_packaging', name: 'Packaging & Printing', slug: 'packaging-printing' },
    { id: 'cat_sports', name: 'Sports & Recreation', slug: 'sports-recreation' },
    { id: 'cat_outdoor', name: 'Outdoor & Camping', slug: 'outdoor-camping' },
    { id: 'cat_education', name: 'Education & Training', slug: 'education-training' },
    { id: 'cat_books', name: 'Books & Stationery', slug: 'books-stationery' },
    { id: 'cat_solar', name: 'Solar & Renewable Energy', slug: 'solar-renewable' },
    { id: 'cat_generators', name: 'Generators & Power Equipment', slug: 'generators-power' },
    { id: 'cat_security', name: 'Security & Safety Equipment', slug: 'security-safety' },
    { id: 'cat_crafts', name: 'Arts & Traditional Crafts', slug: 'arts-crafts' }
  ];

  // Insert categories
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: {},
      create: cat
    });
  }

  // Verify count
  const count = await prisma.category.count();
  console.log(`✅ Seeded ${count} categories successfully!`);

  console.log('Categories:', categories.map(c => `${c.name} (${c.slug})`).join('\n  - '));
}

main()
  .catch((e) => {
    console.error('Error seeding categories:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

