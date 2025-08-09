import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()
    const { action } = await request.json()
    const productId = params.id

    switch (action) {
      case "approve":
        await prisma.product.update({
          where: { id: productId },
          data: { isActive: true },
        })
        break

      case "reject":
        await prisma.product.update({
          where: { id: productId },
          data: { isActive: false },
        })
        break

      case "feature":
        await prisma.product.update({
          where: { id: productId },
          data: { isFeatured: true },
        })
        break

      case "unfeature":
        await prisma.product.update({
          where: { id: productId },
          data: { isFeatured: false },
        })
        break

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}
