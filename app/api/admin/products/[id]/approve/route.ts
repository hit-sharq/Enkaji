import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requirePermission } from "@/lib/auth"
import { handleApiError } from "@/lib/errors"
import { sendEmail, productApprovalEmail } from "@/lib/email"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if user has permission to approve products
    await requirePermission("products.approve")

    const productId = params.id
    const { approved, reason } = await request.json()

    // Update product status
    const product = await db.product.update({
      where: { id: productId },
      data: {
        isActive: approved,
        isShopApproved: approved,
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
        category: {
          select: {
            name: true,
          },
        },
      },
    })

    // Create approval log
    await db.productApproval.create({
      data: {
        productId,
        approved,
        reason: reason || (approved ? "Product approved" : "Product rejected"),
        approvedBy: (await requirePermission("products.approve")).id,
      },
    })

    // Send notification to seller
    const sellerFullName = `${product.seller.firstName} ${product.seller.lastName}`.trim()
    await sendEmail(
      product.seller.email,
      `Product ${approved ? 'Approved' : 'Rejected'} - ${product.name}`,
      productApprovalEmail(sellerFullName, approved, product.name, reason)
    )

    return NextResponse.json({
      message: approved ? "Product approved successfully" : "Product rejected",
      product,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
