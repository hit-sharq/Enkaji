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
        sellerPayouts: {
          include: {
            order: {
              select: {
                id: true,
                createdAt: true,
              },
            },
          },
        },
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
      where: { status: "REQUESTED" },
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

    const { payoutRequestId, status, transactionId, notes } = await request.json()

    const payoutRequest = await prisma.payoutRequest.update({
      where: { id: payoutRequestId },
      data: {
        status,
        processedAt: status === "COMPLETED" ? new Date() : null,
        transactionId,
        adminNotes: notes,
      },
    })

    // Update related seller payouts
    if (status === "COMPLETED") {
      await prisma.sellerPayout.updateMany({
        where: { payoutRequestId },
        data: { status: "PAID" },
      })
    } else if (status === "REJECTED") {
      await prisma.sellerPayout.updateMany({
        where: { payoutRequestId },
        data: { status: "PENDING", payoutRequestId: null },
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
