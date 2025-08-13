import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requirePermission } from "@/lib/auth"
import { handleApiError } from "@/lib/errors"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if user has permission to feature products
    await requirePermission("products.feature")

    const productId = params.id
    const { featured } = await request.json()

    // Update product featured status
    const product = await db.product.update({
      where: { id: productId },
      data: {
        isFeatured: featured,
        updatedAt: new Date(),
      },
      include: {
        seller: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({
      message: featured ? "Product featured successfully" : "Product unfeatured",
      product,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
