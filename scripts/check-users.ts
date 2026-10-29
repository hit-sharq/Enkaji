import { PrismaClient } from "@prisma/client"
const p = new PrismaClient()
async function main() {
  const users = await p.user.findMany({ take: 5, select: { id: true, email: true, role: true } })
  console.log("users:", JSON.stringify(users))
  const cats = await p.category.findMany({ take: 3, select: { id: true, name: true, slug: true } })
  console.log("cats:", JSON.stringify(cats))
  await p.$disconnect()
}
main()
