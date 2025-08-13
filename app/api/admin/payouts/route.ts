import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { handleApiError } from "@/lib/errors"

export async function GET() {
  try {
    await requireAdmin()

    const payoutRequests = await prisma.payoutRequest.findMany({
      include: {
        seller: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            sellerProfile: {
              select: {
                businessName: true,
              },
            },
          },
        },
        // Remove sellerPayouts as it doesn't exist in the schema
      },
      orderBy: { createdAt: "desc" },
    })

    const stats = await prisma.payoutRequest.aggregate({
      _sum: {
        amount: true,
      },
      _count: {
        _all: true,
      },
    })

    const pendingAmount = await prisma.payoutRequest.aggregate({
      where: { status: "PENDING" }, // Use correct enum value
      _sum: {
        amount: true,
      },
    })

    return NextResponse.json({
      payoutRequests,
      stats: {
        totalRequests: stats._count._all,
        totalAmount: stats._sum.amount || 0,
        pendingAmount: pendingAmount._sum.amount || 0,
      },
    })
  } catch (error) {
    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin()

    const { payoutRequestId, status, notes } = await request.json()

    const payoutRequest = await prisma.payoutRequest.update({
      where: { id: payoutRequestId },
      data: {
        status,
        processedAt: status === "COMPLETED" ? new Date() : null,
        // Remove transactionId as it doesn't exist
        adminNotes: notes,
      },
    })

    // Update related seller payouts - remove payoutRequestId references
    if (status === "COMPLETED") {
      await prisma.sellerPayout.updateMany({
        where: { sellerId: payoutRequest.sellerId },
        data: { status: "COMPLETED" },
      })
    } else if (status === "REJECTED") {
      await prisma.sellerPayout.updateMany({
        where: { sellerId: payoutRequest.sellerId },
        data: { status: "PENDING" },
      })
    }

    return NextResponse.json({
      message: "Payout request updated successfully",
      payoutRequest,
    })
  } catch (error) {
    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}
