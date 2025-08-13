import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requirePermission } from "@/lib/auth"
import { handleApiError } from "@/lib/errors"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if user has permission to approve payouts
    await requirePermission("payouts.approve")

    const payoutRequestId = params.id
    const { approved, notes } = await request.json()

    const currentUser = await requirePermission("payouts.approve")

    if (approved) {
      // Approve and process payout
      const payoutRequest = await db.payoutRequest.update({
        where: { id: payoutRequestId },
        data: {
          status: "APPROVED",
          adminNotes: notes,
          processedAt: new Date(),
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

      // Create actual payout record
      await db.sellerPayout.create({
        data: {
          sellerId: payoutRequest.sellerId,
          amount: payoutRequest.amount,
          grossAmount: payoutRequest.amount,
          platformFee: 0, // Already deducted
          processingFee: 0, // Already deducted
          status: "PROCESSING",
          method: payoutRequest.method,
          recipientDetails: payoutRequest.recipientDetails,
        },
      })

      // TODO: Integrate with actual payment processor (M-Pesa, Bank)
      // await processActualPayout(payoutRequest)

      return NextResponse.json({
        message: "Payout approved and processing",
        payout: payoutRequest,
      })
    } else {
      // Reject payout
      const payoutRequest = await db.payoutRequest.update({
        where: { id: payoutRequestId },
        data: {
          status: "REJECTED",
          adminNotes: notes || "Payout rejected by admin",
          processedAt: new Date(),
        },
      })

      return NextResponse.json({
        message: "Payout rejected",
        payout: payoutRequest,
      })
    }
  } catch (error) {
    return handleApiError(error)
  }
}
