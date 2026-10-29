import { PrismaClient } from "@prisma/client"
const p = new PrismaClient()
async function main() {
  const seller = await p.user.findFirst({ where: { role: "SELLER" } })
  if (!seller) { console.log("no seller"); return }
  const cats = await p.category.findMany({ take: 5 })
  const products = [
    { name: "Skyworth 32\" Smart TV", price: 15170, originalPrice: 19899, inventory: 12, images: ["/placeholder.png"], description: "32 inch FHD Smart Google TV", weight: 5 },
    { name: "Skyworth 90L Refrigerator", price: 14999, originalPrice: 23999, inventory: 4, images: ["/placeholder.png"], description: "Single door refrigerator with freezer", weight: 25 },
    { name: "Industrial Drill Set", price: 8500, inventory: 50, images: ["/placeholder.png"], description: "Professional power drill kit", weight: 3 },
    { name: "Solar Panel 200W", price: 12000, originalPrice: 15000, inventory: 8, images: ["/placeholder.png"], description: "Monocrystalline solar panel", weight: 12 },
    { name: "Office Chair Ergonomic", price: 6500, inventory: 20, images: ["/placeholder.png"], description: "Mesh back ergonomic office chair", weight: 15 },
  ]
  for (let i = 0; i < products.length; i++) {
    const prod = products[i]
    const cat = cats[i % cats.length]
    await p.product.create({
      data: {
        name: prod.name,
        description: prod.description,
        price: prod.price,
        comparePrice: prod.originalPrice,
        images: prod.images,
        inventory: prod.inventory,
        weight: prod.weight,
        isActive: true,
        isShopApproved: true,
        categoryId: cat.id,
        sellerId: seller.id,
      },
    })
  }
  console.log("seeded", products.length, "products")
  await p.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
