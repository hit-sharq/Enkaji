// @ts-nocheck
import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { pesapalService } from "@/lib/pesapal"

// ============================================================================
// GET /api/pesapal/verify?orderId=xxx&trackingId=xxx
// Verify payment status with Pesapal
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get("orderId")
    const trackingId = searchParams.get("trackingId")
    const merchantRef = searchParams.get("merchantReference")

    // At least one identifier must be provided
    if (!orderId && !trackingId && !merchantRef) {
      return NextResponse.json({ 
        error: "Order ID, tracking ID, or merchant reference is required" 
      }, { status: 400 })
    }

    // Find the payment record
    let pesapalPayment = null
    
    if (trackingId) {
      pesapalPayment = await prisma.pesapalPayment.findFirst({
        where: { pesapalTrackingId: trackingId }
      })
    } else if (merchantRef) {
      pesapalPayment = await prisma.pesapalPayment.findFirst({
        where: { pesapalMerchantRef: merchantRef }
      })
    } else if (orderId) {
      // Use orderId - verify user owns the order
      const order = await prisma.order.findUnique({
        where: { id: orderId }
      })

      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 })
      }

      if (user.role !== "ADMIN" && order.userId !== user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }

      pesapalPayment = await prisma.pesapalPayment.findFirst({
        where: { orderId: orderId }
      })
    }

    if (!pesapalPayment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    if (!pesapalPayment.pesapalTrackingId) {
      return NextResponse.json({ 
        error: "Pesapal tracking ID not found for this payment" 
      }, { status: 400 })
    }

    // Query Pesapal for current status
    console.log(`[Verify] Checking status for payment ${pesapalPayment.id}`)
    
    const statusResponse = await pesapalService.getTransactionStatus(
      pesapalPayment.pesapalTrackingId
    )

    // Map statuses
    const pesapalStatus = mapPesapalStatus(statusResponse.payment_status_code)
    const orderStatus = mapOrderStatus(statusResponse.payment_status_code)
    const orderPaymentStatus = mapToOrderPaymentStatus(statusResponse.payment_status_code)

    // Update local records if status changed
    const statusChanged = statusResponse.payment_status_description !== pesapalPayment.paymentStatusDescription
    
    if (statusChanged) {
      await prisma.$transaction(async (tx) => {
        // Update payment record
        await tx.pesapalPayment.update({
          where: { id: pesapalPayment.id },
          data: {
            status: pesapalStatus,
            paymentStatusDescription: statusResponse.payment_status_description,
            paymentMethod: statusResponse.payment_method as any
          }
        })

        // Update order status
        await tx.order.update({
          where: { id: pesapalPayment.orderId },
          data: {
            status: orderStatus,
            paymentStatus: orderPaymentStatus
          }
        })
      })

      console.log(`[Verify] Status updated: ${pesapalStatus}`)
    }

    // Get full order details
    const order = await prisma.order.findUnique({
      where: { id: pesapalPayment.orderId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      verified: true,
      payment: {
        id: pesapalPayment.id,
        orderId: pesapalPayment.orderId,
        trackingId: pesapalPayment.pesapalTrackingId,
        merchantRef: pesapalPayment.pesapalMerchantRef,
        amount: pesapalPayment.amount,
        currency: pesapalPayment.currency,
        status: pesapalStatus,
        statusDescription: statusResponse.payment_status_description,
        paymentMethod: statusResponse.payment_method,
        createdAt: pesapalPayment.createdAt,
        updatedAt: pesapalPayment.updatedAt
      },
      order: {
        id: order?.id,
        orderNumber: order?.orderNumber,
        status: order?.status,
        paymentStatus: order?.paymentStatus,
        total: order?.total,
        currency: order?.currency,
        createdAt: order?.createdAt
      },
      pesapalStatus: {
        paymentMethod: statusResponse.payment_method,
        paymentStatus: statusResponse.payment_status,
        statusCode: statusResponse.payment_status_code,
        statusDescription: statusResponse.payment_status_description,
        amount: statusResponse.amount,
        currency: statusResponse.currency,
        createdDate: statusResponse.created_date,
        modifiedDate: statusResponse.modified_date,
        payer: statusResponse.payer
      }
    })

  } catch (error) {
    console.error("[Verify] Error verifying payment:", error)
    
    return NextResponse.json({
      success: false,
      error: "Failed to verify payment",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function mapPesapalStatus(statusCode: number | string) {
  const code = typeof statusCode === "string" ? parseInt(statusCode) : statusCode
  
  switch (code) {
    case 1:
      return "COMPLETED"
    case 0:
      return "FAILED"
    case 2:
      return "PENDING"
    case 3:
      return "INVALID"
    case 4:
      return "REVERSED"
    default:
      return "PENDING"
  }
}

function mapOrderStatus(statusCode: number | string) {
  const code = typeof statusCode === "string" ? parseInt(statusCode) : statusCode
  
  switch (code) {
    case 1:
      return "CONFIRMED"
    case 0:
      return "CANCELLED"
    case 4:
      return "REFUNDED"
    default:
      return "PENDING"
  }
}

function mapToOrderPaymentStatus(statusCode: number | string) {
  const code = typeof statusCode === "string" ? parseInt(statusCode) : statusCode
  
  switch (code) {
    case 1:
      return "PAID"
    case 0:
      return "FAILED"
    case 4:
      return "REFUNDED"
    default:
      return "PENDING"
  }
}

