import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requirePermission } from "@/lib/auth"
import { handleApiError } from "@/lib/errors"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if user has permission to verify sellers
    await requirePermission("users.verify")

    const userId = params.id
    const { verified, reason } = await request.json()

    // Update seller profile
    const sellerProfile = await db.sellerProfile.update({
      where: { userId },
      data: {
        isVerified: verified,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    })

    // Create verification log
    await db.sellerVerification.create({
      data: {
        sellerId: userId,
        verified,
        reason: reason || (verified ? "Seller verified" : "Seller verification rejected"),
        verifiedBy: (await requirePermission("users.verify")).id,
      },
    })

    return NextResponse.json({
      message: verified ? "Seller verified successfully" : "Seller verification rejected",
      seller: sellerProfile,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
