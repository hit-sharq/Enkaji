import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { pesapalService } from "@/lib/pesapal"
import { z } from "zod"

// ============================================================================
// Validation Schema
// ============================================================================

const refundSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  amount: z.number().positive("Amount must be positive"),
  reason: z.string().min(10, "Reason must be at least 10 characters"),
  refundMethod: z.enum(["ORIGINAL", "BANK", "MPESA"]).default("ORIGINAL")
})

// ============================================================================
// POST /api/pesapal/refund - Process a refund
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin or finance manager
    if (user.role !== "ADMIN" && user.role !== "FINANCE_MANAGER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    
    // Validate input
    const validationResult = refundSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({
        error: "Validation failed",
        details: validationResult.error.flatten()
      }, { status: 400 })
    }

    const { orderId, amount, reason, refundMethod } = validationResult.data

    // Get order and payment details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        pesapalPayment: true
      }
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (!order.pesapalPayment?.pesapalTrackingId) {
      return NextResponse.json({ 
        error: "No Pesapal payment found for this order" 
      }, { status: 400 })
    }

    // Check if payment is eligible for refund
    if (order.paymentStatus !== "PAID") {
      return NextResponse.json({ 
        error: "Only paid orders can be refunded",
        currentStatus: order.paymentStatus
      }, { status: 400 })
    }

    // Check refund amount
    const orderAmount = Number(order.pesapalPayment.amount)
    if (amount > orderAmount) {
      return NextResponse.json({ 
        error: "Refund amount cannot exceed order amount",
        orderAmount,
        requestedAmount: amount
      }, { status: 400 })
    }

    // Process refund through Pesapal
    console.log(`[Refund] Processing refund for order ${orderId}:`, {
      amount,
      reason,
      method: refundMethod,
      trackingId: order.pesapalPayment.pesapalTrackingId
    })

    const refundResponse = await pesapalService.refundTransaction({
      orderTrackingId: order.pesapalPayment.pesapalTrackingId,
      amount,
      reason,
      refundMethod
    })

    // Create refund record in database
    const refund = await prisma.$transaction(async (tx) => {
      // Create refund record
      const refundRecord = await tx.pesapalRefund.create({
        data: {
          orderId,
          pesapalTrackingId: order.pesapalPayment.pesapalTrackingId,
          refundTrackingId: refundResponse.refund_tracking_id,
          amount,
          currency: order.pesapalPayment.currency,
          reason,
          method: refundMethod,
          status: mapRefundStatus(refundResponse.status_code),
          requestedBy: user.id
        }
      })

      // Update order status
      await tx.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: amount >= orderAmount ? "REFUNDED" : "PARTIALLY_REFUNDED",
          status: "REFUNDED"
        }
      })

      // Update pesapal payment
      await tx.pesapalPayment.update({
        where: { id: order.pesapalPayment.id },
        data: {
          status: amount >= orderAmount ? "REFUNDED" : "PARTIALLY_REFUNDED",
          refundId: refundRecord.id
        }
      })

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "REFUND_PROCESSED",
          resourceType: "payment",
          resourceId: orderId,
          details: {
            refundId: refundRecord.id,
            refundTrackingId: refundResponse.refund_tracking_id,
            amount,
            reason,
            method: refundMethod
          }
        }
      })

      return refundRecord
    })

    console.log(`[Refund] Successfully processed refund ${refund.refundTrackingId}`)

    return NextResponse.json({
      success: true,
      refund: {
        id: refund.id,
        trackingId: refund.refundTrackingId,
        amount: refund.amount,
        status: refund.status
      },
      pesapalResponse: {
        refundTrackingId: refundResponse.refund_tracking_id,
        status: refundResponse.status,
        message: refundResponse.message
      }
    })

  } catch (error) {
    console.error("[Refund] Error processing refund:", error)
    
    return NextResponse.json({
      error: "Failed to process refund",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

// ============================================================================
// GET /api/pesapal/refund?orderId=xxx - Get refund status
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get("orderId")
    const refundId = searchParams.get("refundId")

    if (!orderId && !refundId) {
      return NextResponse.json({ 
        error: "Order ID or Refund ID is required" 
      }, { status: 400 })
    }

    // Get refund record
    const refund = await prisma.pesapalRefund.findFirst({
      where: orderId ? { orderId } : { id: refundId! }
    })

    if (!refund) {
      return NextResponse.json({ error: "Refund not found" }, { status: 404 })
    }

    // Check permission (admin or order owner)
    const order = await prisma.order.findUnique({
      where: { id: refund.orderId }
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (user.role !== "ADMIN" && user.role !== "FINANCE_MANAGER" && order.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // If refund is still pending, check status with Pesapal
    if (refund.status === "PENDING") {
      try {
        const statusResponse = await pesapalService.getRefundStatus(refund.refundTrackingId)
        
        await prisma.pesapalRefund.update({
          where: { id: refund.id },
          data: {
            status: mapRefundStatus(statusResponse.status_code),
            statusMessage: statusResponse.message
          }
        })
      } catch (error) {
        console.error("[Refund] Failed to check status:", error)
      }
    }

    // Fetch updated refund
    const updatedRefund = await prisma.pesapalRefund.findUnique({
      where: { id: refund.id }
    })

    return NextResponse.json({
      refund: updatedRefund
    })

  } catch (error) {
    console.error("[Refund] Error fetching refund:", error)
    return NextResponse.json({
      error: "Failed to fetch refund"
    }, { status: 500 })
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function mapRefundStatus(statusCode: number | string): "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED" {
  const code = typeof statusCode === "string" ? parseInt(statusCode) : statusCode
  
  switch (code) {
    case 1:
    case 100:
      return "COMPLETED"
    case 0:
      return "FAILED"
    case 2:
    case 101:
      return "PROCESSING"
    case 102:
      return "CANCELLED"
    default:
      return "PENDING"
  }
}

