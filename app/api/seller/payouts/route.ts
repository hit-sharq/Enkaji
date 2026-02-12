export const dynamic = 'force-dynamic'

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
      orderBy: { createdAt: "desc" },
    })

    const stats = await prisma.sellerPayout.aggregate({
      where: { sellerId: user.id },
      _sum: {
        grossAmount: true,
        platformFee: true,
        processingFee: true,
        amount: true,
      },
      _count: true,
    })

    const pendingPayouts = await prisma.sellerPayout.aggregate({
      where: {
        sellerId: user.id,
        status: "PENDING",
      },
      _sum: {
        amount: true,
      },
    })

    return NextResponse.json({
      payouts,
      stats: {
        totalEarnings: Number(stats._sum?.grossAmount || 0),
        totalCommissions: Number(stats._sum?.platformFee || 0),
        totalFees: Number(stats._sum?.processingFee || 0),
        totalNet: Number(stats._sum?.amount || 0),
        totalPayouts: stats._count,
        pendingAmount: Number(pendingPayouts._sum?.amount || 0),
      },
    })
  } catch (error) {
    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}
