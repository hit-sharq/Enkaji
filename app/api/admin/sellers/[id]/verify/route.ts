import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { isAdmin } from "@/lib/auth"
import { sendEmail, sellerVerifiedEmail } from "@/lib/email"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if current user is admin
    const isCurrentUserAdmin = await isAdmin()
    if (!isCurrentUserAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const body = await request.json()
    const { verified, verify } = body
    const sellerId = params.id

    // Handle both 'verified' and 'verify' parameters
    const isVerified = verified !== undefined ? verified : verify

    if (typeof isVerified !== "boolean") {
      return NextResponse.json({ error: "Invalid verification status" }, { status: 400 })
    }

    // Update seller verification status
    const updatedSeller = await db.sellerProfile.update({
      where: { userId: sellerId },
      data: { isVerified },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    })

    // Send verification email if seller is being verified
    if (isVerified) {
      const sellerName = `${updatedSeller.user.firstName || ''} ${updatedSeller.user.lastName || ''}`.trim() || 'Seller'
      await sendEmail(
        updatedSeller.user.email,
        `Your Seller Account Has Been Verified — ${updatedSeller.businessName}`,
        sellerVerifiedEmail(sellerName, updatedSeller.businessName)
      )
    }

    return NextResponse.json({
      message: `Seller ${isVerified ? "verified" : "unverified"} successfully`,
      seller: updatedSeller,
    })
  } catch (error) {
    console.error("Error updating seller verification:", error)
    return NextResponse.json({ error: "Failed to update seller verification" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  return POST(request, { params })
}
