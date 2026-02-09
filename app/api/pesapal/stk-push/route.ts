import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { pesapalService } from "@/lib/pesapal"
import { z } from "zod"

// ============================================================================
// Validation Schema
// ============================================================================

const stkPushSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  phoneNumber: z.string().min(10, "Phone number is required"),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().optional()
})

// ============================================================================
// POST /api/pesapal/stk-push
// Initiate M-Pesa STK Push payment
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate input
    const validationResult = stkPushSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({
        error: "Validation failed",
        details: validationResult.error.flatten()
      }, { status: 400 })
    }

    const { orderId, phoneNumber, amount, description } = validationResult.data

    // Get order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { pesapalPayment: true }
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (order.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (order.paymentStatus === "PAID") {
      return NextResponse.json({ error: "Order is already paid" }, { status: 400 })
    }

    // Normalize phone number (remove leading +254 or 0)
    const normalizedPhone = normalizePhoneNumber(phoneNumber)

    console.log(`[STK Push] Initiating payment for order ${orderId}:`, {
      phone: normalizedPhone,
      amount,
      description: description || `Payment for order ${order.orderNumber}`
    })

    // For M-Pesa STK Push, we need to use Pesapal's mobile money integration
    // Note: This requires additional configuration with Pesapal for M-Pesa integration
    
    // Since Pesapal handles M-Pesa through their platform, we'll submit the order
    // with mobile money as the payment method and redirect user to complete payment
    
    // First, ensure we have a Pesapal order
    let pesapalPayment = order.pesapalPayment

    if (!pesapalPayment) {
      // Submit order to Pesapal with MPESA payment method
      const pesapalOrderData = {
        id: orderId,
        currency: order.currency || "KES",
        amount: amount,
        description: description || `Payment for order ${order.orderNumber}`,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/pesapal/callback`,
        notification_id: orderId,
        billing_address: {
          email_address: user.email,
          phone_number: normalizedPhone,
          country_code: "KE",
          first_name: user.firstName || "",
          last_name: user.lastName || "",
          line_1: (order.shippingAddress as any)?.address || "",
          city: (order.shippingAddress as any)?.city || "",
          state: (order.shippingAddress as any)?.state || "",
          postal_code: (order.shippingAddress as any)?.zipCode || "",
          zip_code: (order.shippingAddress as any)?.zipCode || ""
        }
      }

      const pesapalResponse = await pesapalService.submitOrder(pesapalOrderData)

      // Create payment record
      pesapalPayment = await prisma.pesapalPayment.create({
        data: {
          orderId,
          userId: user.id,
          amount,
          currency: order.currency || "KES",
          pesapalTrackingId: pesapalResponse.order_tracking_id,
          pesapalMerchantRef: pesapalResponse.merchant_reference,
          paymentMethod: "MPESA",
          status: "PENDING"
        }
      })

      // Update order
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentMethod: "PESAPAL",
          paymentStatus: "PENDING"
        }
      })
    }

    // Return the redirect URL for Pesapal's payment page
    // Pesapal will handle the M-Pesa STK push on their end
    return NextResponse.json({
      success: true,
      message: "M-Pesa payment initiated. Please check your phone for the STK push.",
      orderId,
      amount,
      phoneNumber: normalizedPhone,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderId}?payment=pending`,
      status: "PENDING"
    })

  } catch (error) {
    console.error("[STK Push] Error:", error)
    return NextResponse.json({
      error: "Failed to initiate M-Pesa payment",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

// ============================================================================
// GET /api/pesapal/stk-push?orderId=xxx
// Check STK Push payment status
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get("orderId")

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    // Get order and payment
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { pesapalPayment: true }
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (user.role !== "ADMIN" && order.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (!order.pesapalPayment?.pesapalTrackingId) {
      return NextResponse.json({ 
        error: "No Pesapal payment found",
        requiresInitiation: true
      }, { status: 400 })
    }

    // Check payment status with Pesapal
    const statusResponse = await pesapalService.getTransactionStatus(
      order.pesapalPayment.pesapalTrackingId
    )

    // Map status
    const status = {
      orderId: order.id,
      trackingId: order.pesapalPayment.pesapalTrackingId,
      paymentStatus: statusResponse.payment_status,
      statusCode: statusResponse.payment_status_code,
      statusDescription: statusResponse.payment_status_description,
      paymentMethod: statusResponse.payment_method,
      amount: statusResponse.amount,
      currency: statusResponse.currency,
      modifiedDate: statusResponse.modified_date
    }

    return NextResponse.json({
      success: true,
      payment: order.pesapalPayment,
      status
    })

  } catch (error) {
    console.error("[STK Push] Status check error:", error)
    return NextResponse.json({
      error: "Failed to check payment status"
    }, { status: 500 })
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function normalizePhoneNumber(phone: string): string {
  // Remove any non-numeric characters except leading +
  let cleaned = phone.replace(/[^\d+]/g, '')
  
  // Handle Kenyan phone numbers
  if (cleaned.startsWith('+254')) {
    return cleaned
  } else if (cleaned.startsWith('254')) {
    return '+' + cleaned
  } else if (cleaned.startsWith('0')) {
    return '+254' + cleaned.substring(1)
  } else if (cleaned.length === 10) {
    // Assume Kenyan number without country code
    return '+254' + cleaned
  }
  
  // Return as-is if we can't determine format
  return phone.startsWith('+') ? phone : '+' + cleaned
}

