import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { handleApiError, AuthenticationError } from "@/lib/errors"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new AuthenticationError()
    }

    const payouts = await prisma.sellerPayout.findMany({
      where: { sellerId: user.id },
      include: {
        order: {
          select: {
            id: true,
            createdAt: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    const stats = await prisma.sellerPayout.aggregate({
      where: { sellerId: user.id },
      _sum: {
        grossAmount: true,
        platformCommission: true,
        paymentProcessingFee: true,
        netAmount: true,
      },
      _count: true,
    })

    const pendingPayouts = await prisma.sellerPayout.aggregate({
      where: {
        sellerId: user.id,
        status: "PENDING",
      },
      _sum: {
        netAmount: true,
      },
    })

    return NextResponse.json({
      payouts,
      stats: {
        totalEarnings: stats._sum.grossAmount || 0,
        totalCommissions: stats._sum.platformCommission || 0,
        totalFees: stats._sum.paymentProcessingFee || 0,
        totalNet: stats._sum.netAmount || 0,
        totalPayouts: stats._count,
        pendingAmount: pendingPayouts._sum.netAmount || 0,
      },
    })
  } catch (error) {
    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}
