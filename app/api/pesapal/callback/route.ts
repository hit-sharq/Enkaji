import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { pesapalService } from "@/lib/pesapal"
import { sendEmail, paymentCallbackEmail } from "@/lib/email"
import type { User } from "@prisma/client"

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

    // Check if this is a subscription payment (starts with SUB-)
    const isSubscriptionPayment = orderId.startsWith('SUB-')
    
    if (isSubscriptionPayment) {
      // Handle subscription payment
      return await handleSubscriptionPayment(orderId, statusCode, statusDescription, transactionId, paymentMethod, amount, currency, body)
    }

    // Get the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { 
        pesapalPayment: true,
        user: true
      }
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
    await handlePaymentState(order, paymentStatus, statusCode, merchantReference)

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
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${request.headers.get("host")}`

  try {
    const { searchParams } = new URL(request.url)
    const orderTrackingId = searchParams.get("OrderTrackingId")
    const merchantReference = searchParams.get("OrderMerchantReference")

    console.log("[Callback] Redirect received:", { orderTrackingId, merchantReference })

    if (!orderTrackingId || !merchantReference) {
      return NextResponse.redirect(`${appUrl}/orders?payment=error`)
    }

    // Verify the transaction status directly with PesaPal
    let paymentStatus: "completed" | "pending" | "failed" = "pending"
    try {
      const txStatus = await pesapalService.getTransactionStatus(orderTrackingId)
      console.log("[Callback] PesaPal transaction status:", txStatus)

      const statusCode = txStatus.payment_status_code

      // Update order in database based on verified status
      const orderId = merchantReference
      const order = await prisma.order.findUnique({ where: { id: orderId } })

      if (order) {
        const orderStatus = mapOrderStatus(statusCode)
        const orderPaymentStatus = mapOrderPaymentStatus(statusCode)

        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: orderStatus,
            paymentStatus: orderPaymentStatus,
          },
        })

        // Update or create PesaPal payment record
        const existingPayment = await prisma.pesapalPayment.findFirst({
          where: { orderId },
        })
        const pesapalStatus = mapPesapalStatus(statusCode)

        if (existingPayment) {
          await prisma.pesapalPayment.update({
            where: { id: existingPayment.id },
            data: {
              pesapalTransactionId: txStatus.order_tracking_id,
              status: pesapalStatus,
              paymentStatusDescription: txStatus.payment_status_description,
              paymentMethod: mapPaymentMethod(txStatus.payment_method),
            },
          })
        }
      }

      if (statusCode === 1) paymentStatus = "completed"
      else if (statusCode === 0) paymentStatus = "failed"
      else paymentStatus = "pending"
    } catch (verifyError) {
      console.error("[Callback] Could not verify transaction with PesaPal:", verifyError)
      // Still redirect to order page — IPN may update it later
    }

    const redirectUrl = new URL(`${appUrl}/orders/${merchantReference}`)
    redirectUrl.searchParams.set("payment", paymentStatus)
    redirectUrl.searchParams.set("tracking_id", orderTrackingId)
    return NextResponse.redirect(redirectUrl.toString())

  } catch (error) {
    console.error("[Callback] Redirect error:", error)
    return NextResponse.redirect(`${appUrl}/orders?payment=error`)
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
async function handlePaymentState(order: any, paymentStatus: string, statusCode: number | string, merchantReference?: string): Promise<void> {
  const code = typeof statusCode === "string" ? parseInt(statusCode) : statusCode

  switch (code) {
    case 1: // Payment completed
      console.log(`[Callback] Payment completed for order ${order.id}`)
      
      // If order doesn't exist yet, create it now (new flow)
      if (!order.id && merchantReference) {
        console.log(`[Callback] Creating new order for payment reference: ${merchantReference}`)
        await createOrderFromPayment(merchantReference)
      }
      
      // Send confirmation email
      const customerName = `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() || 'Customer'
      await sendEmail(
        order.user.email,
        `Payment Successful — Order ${order.orderNumber}`,
        paymentCallbackEmail(customerName, order.orderNumber, Number(order.total), 'completed', 'Pesapal')
      )
      break
    case 0: // Payment failed
      console.log(`[Callback] Payment failed for order ${order.id}`)
      // Send failure notification
      const customerNameFail = `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() || 'Customer'
      await sendEmail(
        order.user.email,
        `Payment Failed — Order ${order.orderNumber}`,
        paymentCallbackEmail(customerNameFail, order.orderNumber, Number(order.total), 'failed', 'Pesapal')
      )
      break
    case 4: // Payment reversed/refunded
      console.log(`[Callback] Payment reversed for order ${order.id}`)
      break
    default:
      console.log(`[Callback] Payment pending (status ${code}) for order ${order.id}`)
  }
}

// Create order from successful payment
async function createOrderFromPayment(paymentReference: string): Promise<void> {
  try {
    // In a real implementation, you would retrieve checkout data from cache/database
    // For now, we'll log that this should be implemented
    console.log(`[Callback] TODO: Create order for payment reference: ${paymentReference}`)
    console.log(`[Callback] This should retrieve checkout data and create the order`)
    
    // The flow would be:
    // 1. Retrieve checkout data using paymentReference
    // 2. Validate inventory again
    // 3. Create order with status CONFIRMED
    // 4. Create order items
    // 5. Deduct inventory
    // 6. Clear user's cart
    
  } catch (error) {
    console.error(`[Callback] Error creating order from payment:`, error)
  }
}

// Handle subscription payment callback
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
    
    // Extract subscription ID from order ID (format: SUB-{subscriptionId}-{timestamp})
    const subscriptionId = orderId.split('-')[1]
    
    if (!subscriptionId) {
      console.warn(`[Callback] Invalid subscription order ID: ${orderId}`)
      return NextResponse.json({ success: false, error: "Invalid subscription ID" }, { status: 400 })
    }

    // Get the subscription
    const subscription = await prisma.sellerSubscription.findUnique({
      where: { id: subscriptionId },
      include: { seller: true }
    })

    if (!subscription) {
      console.warn(`[Callback] Subscription not found: ${subscriptionId}`)
      return NextResponse.json({ success: true, warning: "Subscription not found" })
    }

    // Store IPN data for audit
    await prisma.pesapalIPN.create({
      data: {
        pesapalTransactionId: transactionId || orderId,
        pesapalTrackingId: orderId,
        pesapalMerchantRef: orderId,
        paymentMethod: mapPaymentMethod(paymentMethod || "CARD"),
        amount: parseFloat(amount || "0") || 0,
        currency: currency || "KES",
        status: mapPesapalStatus(statusCode),
        statusDescription: statusDescription,
        rawData: rawData,
        processedAt: new Date()
      }
    })

    // Update subscription status based on payment result
    if (code === 1) {
      // Payment successful - activate subscription
      await prisma.sellerSubscription.update({
        where: { id: subscriptionId },
        data: {
          status: "ACTIVE",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        }
      })

      // Update Pesapal payment record if exists
      const existingPayment = await prisma.pesapalPayment.findFirst({
        where: { orderId: orderId }
      })

      if (existingPayment) {
        await prisma.pesapalPayment.update({
          where: { id: existingPayment.id },
          data: {
            status: "COMPLETED",
            pesapalTransactionId: transactionId,
            paymentStatusDescription: statusDescription
          }
        })
      }

      // Send confirmation email
      const sellerName = `${subscription.seller.firstName || ''} ${subscription.seller.lastName || ''}`.trim() || 'Seller'
      await sendEmail(
        subscription.seller.email,
        `Subscription Activated — Enkaji Trade`,
        `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#28a745">✅ Subscription Activated!</h2>
          <p>Hi ${sellerName},</p>
          <p>Your <strong>${subscription.plan}</strong> subscription has been activated successfully.</p>
          <p>You can now access all the features of your plan.</p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display:inline-block;background:#8B2635;color:white;padding:12px 24px;text-decoration:none;border-radius:4px;margin:16px 0">Go to Dashboard</a></p>
          <p style="color:#666;font-size:12px">Enkaji Trade Kenya</p>
        </div>`
      )

      console.log(`[Callback] Subscription ${subscriptionId} activated successfully`)
    } else {
      // Payment failed - keep subscription as UNPAID
      await prisma.sellerSubscription.update({
        where: { id: subscriptionId },
        data: {
          status: "UNPAID"
        }
      })

      console.log(`[Callback] Subscription ${subscriptionId} payment failed`)
    }

    return NextResponse.json({ 
      success: true, 
      subscriptionId,
      status: code === 1 ? "ACTIVE" : "UNPAID"
    })

  } catch (error) {
    console.error("[Callback] Subscription payment error:", error)
    return NextResponse.json({ success: false, error: "Subscription callback processing failed" }, { status: 500 })
  }
}

