import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// ============================================================================
// Pesapal Callback/IPN Handler
// Handles payment notifications from Pesapal
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Log incoming callback for debugging
    console.log("[Callback] IPN received:", JSON.stringify(body, null, 2))

    // Extract callback data
    const orderTrackingId = body.OrderTrackingId || body.order_tracking_id
    const merchantReference = body.OrderMerchantReference || body.merchant_reference
    const statusCode = body.status_code || body.payment_status_code
    const statusDescription = body.status_description || body.payment_status_description
    const transactionId = body.pesapal_transaction_tracking_id || body.transaction_id
    const paymentMethod = body.payment_method
    const amount = body.amount
    const currency = body.currency

    // Store raw IPN data for audit
    await prisma.pesapalIPN.create({
      data: {
        pesapalTransactionId: transactionId || orderTrackingId,
        pesapalTrackingId: orderTrackingId,
        pesapalMerchantRef: merchantReference,
        paymentMethod: mapPaymentMethod(paymentMethod),
        amount: parseFloat(amount) || 0,
        currency: currency || "KES",
        status: mapPesapalStatus(statusCode),
        statusDescription: statusDescription,
        description: body.description,
        message: body.message,
        reference: body.reference,
        thirdPartyReference: body.third_party_reference,
        rawData: body,
        processedAt: new Date()
      }
    })

    // Find the order using merchant reference
    const orderId = merchantReference

    if (!orderId) {
      console.warn("[Callback] No merchant reference found")
      return NextResponse.json({ success: false, error: "No merchant reference" }, { status: 400 })
    }

    // Get the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { pesapalPayment: true }
    })

    if (!order) {
      console.warn(`[Callback] Order not found: ${orderId}`)
      return NextResponse.json({ success: true, warning: "Order not found" })
    }

    // Map statuses
    const paymentStatus = mapOrderPaymentStatus(statusCode)
    const orderStatus = mapOrderStatus(statusCode)

    // Update or create payment record
    if (order.pesapalPayment) {
      await prisma.pesapalPayment.update({
        where: { id: order.pesapalPayment.id },
        data: {
          pesapalTransactionId: transactionId || orderTrackingId,
          status: mapPesapalStatus(statusCode),
          paymentStatusDescription: statusDescription,
          paymentMethod: mapPaymentMethod(paymentMethod) || order.pesapalPayment.paymentMethod
        }
      })
    } else {
      await prisma.pesapalPayment.create({
        data: {
          orderId,
          userId: order.userId,
          amount: parseFloat(amount) || Number(order.total),
          currency: currency || "KES",
          pesapalTrackingId: orderTrackingId,
          pesapalMerchantRef: merchantReference,
          pesapalTransactionId: transactionId,
          paymentMethod: mapPaymentMethod(paymentMethod) || "CARD",
          status: mapPesapalStatus(statusCode),
          paymentStatusDescription: statusDescription
        }
      })
    }

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: orderStatus,
        paymentStatus: paymentStatus,
        paymentMethod: paymentMethod ? `PESAPAL_${paymentMethod}` : "PESAPAL"
      }
    })

    console.log(`[Callback] Order ${orderId} updated: orderStatus=${orderStatus}, paymentStatus=${paymentStatus}`)

    // Handle payment states
    await handlePaymentState(order, paymentStatus, statusCode)

    return NextResponse.json({ 
      success: true, 
      orderId,
      paymentStatus,
      orderStatus 
    })

  } catch (error) {
    console.error("[Callback] Error:", error)
    return NextResponse.json({ success: false, error: "Callback processing failed" }, { status: 500 })
  }
}

// ============================================================================
// GET /api/pesapal/callback - Handle redirect from Pesapal
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderTrackingId = searchParams.get("OrderTrackingId")
    const merchantReference = searchParams.get("OrderMerchantReference")
    const status = searchParams.get("status")

    console.log("[Callback] Redirect received:", { orderTrackingId, merchantReference, status })

    if (orderTrackingId && merchantReference) {
      const redirectUrl = new URL(`${process.env.NEXT_PUBLIC_APP_URL}/orders/${merchantReference}`)
      redirectUrl.searchParams.set("payment", "completed")
      redirectUrl.searchParams.set("tracking_id", orderTrackingId)
      return NextResponse.redirect(redirectUrl.toString())
    }

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/orders?payment=error`)

  } catch (error) {
    console.error("[Callback] Redirect error:", error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/orders?payment=error`)
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

// Map Pesapal status code to OrderStatus enum
function mapOrderStatus(statusCode: number | string): "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED" {
  const code = typeof statusCode === "string" ? parseInt(statusCode) : statusCode
  
  switch (code) {
    case 1: return "CONFIRMED"      // Payment completed
    case 0: return "CANCELLED"      // Payment failed
    case 4: return "REFUNDED"       // Payment reversed
    default: return "PENDING"       // Payment pending
  }
}

// Map Pesapal status code to PaymentStatus enum
function mapOrderPaymentStatus(statusCode: number | string): "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "PARTIALLY_REFUNDED" {
  const code = typeof statusCode === "string" ? parseInt(statusCode) : statusCode
  
  switch (code) {
    case 1: return "PAID"          // Payment completed
    case 0: return "FAILED"         // Payment failed
    case 4: return "REFUNDED"       // Payment reversed
    default: return "PENDING"       // Payment pending
  }
}

// Map Pesapal status code to PesapalPaymentStatus enum
function mapPesapalStatus(statusCode: number | string): "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED" | "INVALID" | "REVERSED" {
  const code = typeof statusCode === "string" ? parseInt(statusCode) : statusCode
  
  switch (code) {
    case 1: return "COMPLETED"
    case 0: return "FAILED"
    case 2: return "PENDING"
    case 3: return "INVALID"
    case 4: return "REVERSED"
    default: return "PENDING"
  }
}

// Map payment method string to enum
function mapPaymentMethod(method: string): "CARD" | "MPESA" | "AIRTEL_MONEY" | "EQUITY_BANK" | "KCB_BANK" | "BANK_TRANSFER" | "MOBILE_BANKING" {
  if (!method) return "CARD"
  
  const normalized = method.toUpperCase().replace(/[\s-]/g, '_')
  const validMethods = ["CARD", "MPESA", "AIRTEL_MONEY", "EQUITY_BANK", "KCB_BANK", "BANK_TRANSFER", "MOBILE_BANKING"]
  
  return (validMethods.includes(normalized) ? normalized : "CARD") as any
}

// Handle different payment states
async function handlePaymentState(order: any, paymentStatus: string, statusCode: number | string): Promise<void> {
  const code = typeof statusCode === "string" ? parseInt(statusCode) : statusCode

  switch (code) {
    case 1: // Payment completed
      console.log(`[Callback] Payment completed for order ${order.id}`)
      // TODO: Send confirmation email
      // TODO: Update inventory
      break
    case 0: // Payment failed
      console.log(`[Callback] Payment failed for order ${order.id}`)
      // TODO: Send failure notification
      break
    case 4: // Payment reversed/refunded
      console.log(`[Callback] Payment reversed for order ${order.id}`)
      break
    default:
      console.log(`[Callback] Payment pending (status ${code}) for order ${order.id}`)
  }
}

