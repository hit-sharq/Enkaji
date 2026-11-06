import { PrismaClient } from "@prisma/client"
const p = new PrismaClient()
async function main() {
  const seller = await p.user.findFirst({ where: { role: "SELLER" } })
  if (!seller) { console.log("no seller"); return }
  const cats = await p.category.findMany({ take: 3 })
  const products = [
    { name: "Test Pen (Cheap)", price: 50, inventory: 100, description: "Cheap test product for payment testing", weight: 0.1 },
    { name: "Test Pencil", price: 30, inventory: 200, description: "Cheap test product", weight: 0.05 },
    { name: "Test Eraser", price: 20, inventory: 150, description: "Cheap test product", weight: 0.02 },
    { name: "Test Ruler", price: 45, inventory: 80, description: "Cheap test product", weight: 0.1 },
    { name: "Test Notebook", price: 50, inventory: 60, description: "Cheap test product", weight: 0.3 },
  ]
  for (let i = 0; i < products.length; i++) {
    const prod = products[i]
    const cat = cats[i % cats.length]
    await p.product.create({
      data: {
        name: prod.name,
        description: prod.description,
        price: prod.price,
        images: ["/placeholder.png"],
        inventory: prod.inventory,
        weight: prod.weight,
        isActive: true,
        isShopApproved: true,
        categoryId: cat.id,
        sellerId: seller.id,
      },
    })
  }
  console.log("seeded", products.length, "cheap products")
  await p.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
