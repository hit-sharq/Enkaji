import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { handleApiError, AuthenticationError, ValidationError } from "@/lib/errors"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new AuthenticationError()
    }

    const { payoutMethod, accountDetails } = await request.json()

    // Check minimum payout amount (KES 1000)
    const pendingPayouts = await prisma.sellerPayout.aggregate({
      where: {
        sellerId: user.id,
        status: "PENDING",
      },
      _sum: {
        netAmount: true,
      },
    })

    const pendingAmount = pendingPayouts._sum.netAmount || 0
    if (pendingAmount < 1000) {
      throw new ValidationError("Minimum payout amount is KES 1,000")
    }

    // Create payout request
    const payoutRequest = await prisma.payoutRequest.create({
      data: {
        sellerId: user.id,
        amount: pendingAmount,
        payoutMethod,
        accountDetails: JSON.stringify(accountDetails),
        status: "REQUESTED",
      },
    })

    // Update related seller payouts
    await prisma.sellerPayout.updateMany({
      where: {
        sellerId: user.id,
        status: "PENDING",
      },
      data: {
        status: "REQUESTED",
        payoutRequestId: payoutRequest.id,
      },
    })

    return NextResponse.json({
      message: "Payout request submitted successfully",
      payoutRequest,
    })
  } catch (error) {
    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}
