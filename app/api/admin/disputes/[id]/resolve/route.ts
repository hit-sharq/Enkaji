import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requirePermission } from "@/lib/auth"
import { handleApiError } from "@/lib/errors"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if user has permission to resolve disputes
    await requirePermission("disputes.resolve")

    const disputeId = params.id
    const { resolution, refundAmount, refundToBuyer } = await request.json()

    const currentUser = await requirePermission("disputes.resolve")

    // Update dispute status
    const dispute = await db.paymentDispute.update({
      where: { id: disputeId },
      data: {
        status: "RESOLVED",
        resolution,
        resolvedAt: new Date(),
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

    // If refund is approved, process it
    if (refundToBuyer && refundAmount > 0) {
      // Update escrow payment
      await db.escrowPayment.update({
        where: { orderId: dispute.orderId },
        data: {
          status: "REFUNDED",
          refundedAt: new Date(),
        },
      })

      // TODO: Process actual refund
      // await processRefund(dispute.orderId, refundAmount)
    } else {
      // Release payment to seller
      await db.escrowPayment.update({
        where: { orderId: dispute.orderId },
        data: {
          status: "RELEASED",
          releasedAt: new Date(),
        },
      })
    }

    return NextResponse.json({
      message: "Dispute resolved successfully",
      dispute,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
