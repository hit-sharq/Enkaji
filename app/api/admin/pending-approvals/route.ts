import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireMinimumRole } from "@/lib/auth"
import { handleApiError } from "@/lib/errors"

export async function GET(request: NextRequest) {
  try {
    // Check if user has minimum moderator role
    await requireMinimumRole("MODERATOR")

    // Get pending products
    const pendingProducts = await db.product.findMany({
      where: { isActive: false },
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
      orderBy: { createdAt: "desc" },
      take: 20,
    })

    // Get pending artisans
    const pendingArtisans = await db.artisanProfile.findMany({
      where: { isApproved: false },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    })

    // Get unverified sellers
    const unverifiedSellers = await db.sellerProfile.findMany({
      where: { isVerified: false },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    })

    // Get pending payout requests
    const pendingPayouts = await db.payoutRequest.findMany({
      where: { status: "PENDING" },
      include: {
        seller: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    })

    // Get open disputes
    const openDisputes = await db.paymentDispute.findMany({
      where: { status: "OPEN" },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    })

    return NextResponse.json({
      pendingProducts,
      pendingArtisans,
      unverifiedSellers,
      pendingPayouts,
      openDisputes,
      summary: {
        totalPendingProducts: pendingProducts.length,
        totalPendingArtisans: pendingArtisans.length,
        totalUnverifiedSellers: unverifiedSellers.length,
        totalPendingPayouts: pendingPayouts.length,
        totalOpenDisputes: openDisputes.length,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
