import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { pesapalService } from "@/lib/pesapal"
import { sendEmail, paymentCallbackEmail } from "@/lib/email"

// ============================================================================
// Pesapal IPN (Instant Payment Notification) Handler
// This is the dedicated IPN endpoint. The callback route also handles IPN,
// but this separate endpoint allows for cleaner separation of concerns.
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Log incoming IPN for debugging
    console.log("[IPN] Received:", JSON.stringify(body, null, 2))

    // Extract IPN data
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
    const merchantRef = merchantReference
    const isSubscriptionPayment = merchantRef?.startsWith('SUB-')
    const isCheckoutPayment = merchantRef?.startsWith('PAY-')

    if (!merchantRef) {
      console.warn("[IPN] No merchant reference found")
      return NextResponse.json({ success: false, error: "No merchant reference" }, { status: 400 })
    }

    // Check if this is a subscription payment
    if (isSubscriptionPayment) {
      return await handleSubscriptionPayment(merchantRef, statusCode, statusDescription, transactionId, paymentMethod, amount, currency, body)
    }

    // Try to find order by multiple identifiers
    let order = null
    let orderId = merchantRef

    // First, try finding by order ID directly
    order = await prisma.order.findUnique({
      where: { id: merchantRef },
      include: {
        pesapalPayment: true,
        user: true
      }
    })

    // If not found, try finding by orderNumber
    if (!order) {
      order = await prisma.order.findFirst({
        where: { orderNumber: merchantRef },
        include: {
          pesapalPayment: true,
          user: true
        }
      })
      if (order) {
        orderId = order.id
      }
    }

    // If still not found and this is a checkout payment, create order now
    if (!order && isCheckoutPayment) {
      console.log(`[IPN] Creating order from checkout payment: ${merchantRef}`)
      order = await createOrderFromPayment(merchantRef, statusCode, body)
      if (order) {
        orderId = order.id
      }
    }

    if (!order) {
      console.warn(`[IPN] Order not found for merchant ref: ${merchantRef}`)
      // Still return success to acknowledge IPN receipt
      return NextResponse.json({ success: true, warning: "Order not found - may be pending creation" })
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

    console.log(`[IPN] Order ${orderId} updated: orderStatus=${orderStatus}, paymentStatus=${paymentStatus}`)

    // Handle payment states
    await handlePaymentState(order, paymentStatus, statusCode, merchantReference)

    return NextResponse.json({
      success: true,
      orderId,
      paymentStatus,
      orderStatus
    })

  } catch (error) {
    console.error("[IPN] Error:", error)
    return NextResponse.json({ success: false, error: "IPN processing failed" }, { status: 500 })
  }
}

// ============================================================================
// Helper Functions (copied from callback route for self-containment)
// ============================================================================

function mapOrderStatus(statusCode: number | string): "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED" {
  const code = typeof statusCode === "string" ? parseInt(statusCode) : statusCode
  switch (code) {
    case 1: return "CONFIRMED"
    case 0: return "CANCELLED"
    case 4: return "REFUNDED"
    default: return "PENDING"
  }
}

function mapOrderPaymentStatus(statusCode: number | string): "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "PARTIALLY_REFUNDED" {
  const code = typeof statusCode === "string" ? parseInt(statusCode) : statusCode
  switch (code) {
    case 1: return "PAID"
    case 0: return "FAILED"
    case 4: return "REFUNDED"
    default: return "PENDING"
  }
}

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

function mapPaymentMethod(method: string): "CARD" | "MPESA" | "AIRTEL_MONEY" | "EQUITY_BANK" | "KCB_BANK" | "BANK_TRANSFER" | "MOBILE_BANKING" {
  if (!method) return "CARD"
  const normalized = method.toUpperCase().replace(/[\s-]/g, '_')
  const validMethods = ["CARD", "MPESA", "AIRTEL_MONEY", "EQUITY_BANK", "KCB_BANK", "BANK_TRANSFER", "MOBILE_BANKING"]
  return (validMethods.includes(normalized) ? normalized : "CARD") as any
}

async function handlePaymentState(order: any, paymentStatus: string, statusCode: number | string, merchantReference?: string): Promise<void> {
  const code = typeof statusCode === "string" ? parseInt(statusCode) : statusCode
  switch (code) {
    case 1: // Payment completed
      console.log(`[IPN] Payment completed for order ${order.id}`)
      if (!order.id && merchantReference) {
        await createOrderFromPayment(merchantReference)
      }
      const customerName = `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() || 'Customer'
      await sendEmail(
        order.user.email,
        `Payment Successful — Order ${order.orderNumber}`,
        paymentCallbackEmail(customerName, order.orderNumber, Number(order.total), 'completed', 'Pesapal')
      )
      break
    case 0: // Payment failed
      console.log(`[IPN] Payment failed for order ${order.id}`)
      const customerNameFail = `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() || 'Customer'
      await sendEmail(
        order.user.email,
        `Payment Failed — Order ${order.orderNumber}`,
        paymentCallbackEmail(customerNameFail, order.orderNumber, Number(order.total), 'failed', 'Pesapal')
      )
      break
    case 4: // Payment reversed/refunded
      console.log(`[IPN] Payment reversed for order ${order.id}`)
      break
    default:
      console.log(`[IPN] Payment pending (status ${code}) for order ${order.id}`)
  }
}

async function createOrderFromPayment(paymentReference: string, statusCode?: number | string, rawData?: any): Promise<any> {
  try {
    const code = typeof statusCode === "string" ? parseInt(statusCode) : statusCode
    if (code !== 1) {
      console.log(`[IPN] Skipping order creation - payment not completed (status: ${code})`)
      return null
    }
    const existingOrder = await prisma.order.findFirst({ where: { orderNumber: paymentReference } })
    if (existingOrder) {
      console.log(`[IPN] Found existing order: ${existingOrder.id}`)
      return existingOrder
    }
    return null
  } catch (error) {
    console.error(`[IPN] Error creating order from payment:`, error)
    return null
  }
}

async function handleSubscriptionPayment(
  orderId: string,
  statusCode: number | string,
  statusDescription: string | undefined,
  transactionId: string | undefined,
  paymentMethod: string | undefined,
  amount: string | undefined,
  currency: string | undefined,
  rawData: any
): Promise<NextResponse> {
  try {
    const code = typeof statusCode === "string" ? parseInt(statusCode) : statusCode
    const subscriptionId = orderId.split('-')[1]
    if (!subscriptionId) {
      console.warn(`[IPN] Invalid subscription order ID: ${orderId}`)
      return NextResponse.json({ success: false, error: "Invalid subscription ID" }, { status: 400 })
    }

    const subscription = await prisma.sellerSubscription.findUnique({
      where: { id: subscriptionId },
      include: { seller: true }
    })

    if (!subscription) {
      console.warn(`[IPN] Subscription not found: ${subscriptionId}`)
      return NextResponse.json({ success: true, warning: "Subscription not found" })
    }

    if (code === 1) {
      await prisma.sellerSubscription.update({
        where: { id: subscriptionId },
        data: {
          status: "ACTIVE",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      })
      console.log(`[IPN] Subscription ${subscriptionId} activated successfully`)
    } else {
      await prisma.sellerSubscription.update({
        where: { id: subscriptionId },
        data: { status: "UNPAID" }
      })
      console.log(`[IPN] Subscription ${subscriptionId} payment failed`)
    }

    return NextResponse.json({
      success: true,
      subscriptionId,
      status: code === 1 ? "ACTIVE" : "UNPAID"
    })

  } catch (error) {
    console.error("[IPN] Subscription payment error:", error)
    return NextResponse.json({ success: false, error: "Subscription IPN processing failed" }, { status: 500 })
  }
}

