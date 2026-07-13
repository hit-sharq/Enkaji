import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { pesapalService } from "@/lib/pesapal"
import { sendEmail, paymentCallbackEmail } from "@/lib/email"
import { appConfig } from "@/lib/app-config"
import type { User } from "@prisma/client"

// ============================================================================
// Pesapal Callback/IPN Handler
// Handles payment notifications from Pesapal
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const forwarded = request.headers.get("x-forwarded-for") || ""
    const ip = request.headers.get("x-real-ip") || forwarded.split(",")[0].trim() || "unknown"
    
    const allowedPesapalIps = [
      "185.11.146.0/24",
      "185.11.147.0/24",
      "209.133.79.0/24",
      "209.133.80.0/24",
    ]
    
    const isAllowedIp = allowedPesapalIps.some((cidr) => {
      const [range, bits] = cidr.split("/")
      const mask = ~((1 << (32 - Number(bits))) - 1)
      const ipNum = ip.split(".").reduce((acc, octet) => (acc << 8) + Number(octet), 0)
      const rangeNum = range.split(".").reduce((acc, octet) => (acc << 8) + Number(octet), 0)
      return (ipNum & mask) === (rangeNum & mask)
    })
    
    if (!isAllowedIp && ip !== "unknown" && ip !== "127.0.0.1") {
      console.error("[Callback] Rejected request from non-Pesapal IP:", ip)
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }
    
    console.log("[Callback] IPN received from:", ip)

    const orderTrackingId = body.OrderTrackingId || body.order_tracking_id
    const merchantReference = body.OrderMerchantReference || body.merchant_reference
    const statusCode = body.status_code || body.payment_status_code
    const statusDescription = body.status_description || body.payment_status_description
    const transactionId = body.pesapal_transaction_tracking_id || body.transaction_id
    const paymentMethod = body.payment_method
    const amount = body.amount
    const currency = body.currency

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

    const merchantRef = merchantReference
    const isSubscriptionPayment = merchantRef?.startsWith('SUB-')
    const isCheckoutPayment = merchantRef?.startsWith('PAY-')
    
    if (!merchantRef) {
      console.warn("[Callback] No merchant reference found")
      return NextResponse.json({ success: false, error: "No merchant reference" }, { status: 400 })
    }

    if (isSubscriptionPayment) {
      return await handleSubscriptionPayment(merchantRef, statusCode, statusDescription, transactionId, paymentMethod, amount, currency, body)
    }

    let order = null
    let orderId = merchantRef
    
    order = await prisma.order.findUnique({
      where: { id: merchantRef },
      include: { 
        pesapalPayment: true,
        user: true
      }
    })
    
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
    
    if (!order && isCheckoutPayment) {
      console.log(`[Callback] Creating order from checkout payment: ${merchantRef}`)
      order = await createOrderFromPayment(merchantRef, statusCode, body)
      if (order) {
        orderId = order.id
      }
    }

    if (!order) {
      console.warn(`[Callback] Order not found for merchant ref: ${merchantRef}`)
      return NextResponse.json({ success: true, warning: "Order not found - may be pending creation" })
    }

    const paymentStatus = mapOrderPaymentStatus(statusCode)
    const orderStatus = mapOrderStatus(statusCode)

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

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: orderStatus,
        paymentStatus: paymentStatus,
        paymentMethod: paymentMethod ? `PESAPAL_${paymentMethod}` : "PESAPAL"
      }
    })

    console.log(`[Callback] Order ${orderId} updated: orderStatus=${orderStatus}, paymentStatus=${paymentStatus}`)

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

export async function GET(request: NextRequest) {
  const appUrl = appConfig.APP_URL || `https://${request.headers.get("host")}`

  try {
    const { searchParams } = new URL(request.url)
    const orderTrackingId = searchParams.get("OrderTrackingId")
    const merchantReference = searchParams.get("OrderMerchantReference")

    console.log("[Callback] Redirect received:", { orderTrackingId, merchantReference })

    if (!orderTrackingId || !merchantReference) {
      return NextResponse.redirect(`${appUrl}/orders?payment=error`)
    }

    let paymentStatus: "completed" | "pending" | "failed" = "pending"
    let order = null

    try {
       const txStatus = await pesapalService.getTransactionStatus(orderTrackingId)
       console.log("[Callback] PesaPal transaction status:", txStatus)

       const statusCode = txStatus.payment_status_code
       const merchantRef = merchantReference
       
       const isCheckoutPayment = merchantRef?.startsWith('PAY-')
       
       order = await prisma.order.findUnique({ where: { id: merchantRef } })
       
       if (!order) {
         order = await prisma.order.findFirst({ where: { orderNumber: merchantRef } })
       }
       
       if (!order && isCheckoutPayment && statusCode === 1) {
         console.log(`[Callback GET] Creating order from checkout session: ${merchantRef}`)
         order = await createOrderFromPayment(merchantRef, statusCode, txStatus)
       }

       if (order) {
         const orderStatus = mapOrderStatus(statusCode)
         const orderPaymentStatus = mapOrderPaymentStatus(statusCode)

         await prisma.order.update({
           where: { id: order.id },
           data: {
             status: orderStatus,
             paymentStatus: orderPaymentStatus,
           },
         })

         const existingPayment = await prisma.pesapalPayment.findFirst({
           where: { orderId: order.id },
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
     }

    const redirectUrl = new URL(`${appUrl}/orders/${order?.id || merchantReference}`)
    redirectUrl.searchParams.set("payment", paymentStatus)
    redirectUrl.searchParams.set("tracking_id", orderTrackingId)
    return NextResponse.redirect(redirectUrl.toString())

  } catch (error) {
    console.error("[Callback] Redirect error:", error)
    return NextResponse.redirect(`${appUrl}/orders?payment=error`)
  }
}

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
    case 1:
      console.log(`[Callback] Payment completed for order ${order.id}`)
      
      if (!order.id && merchantReference) {
        console.log(`[Callback] Creating new order for payment reference: ${merchantReference}`)
        await createOrderFromPayment(merchantReference)
      }
      
      const customerName = `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() || 'Customer'
      await sendEmail(
        order.user.email,
        `Payment Successful — Order ${order.orderNumber}`,
        paymentCallbackEmail(customerName, order.orderNumber, Number(order.total), 'completed', 'Pesapal')
      )
      break
    case 0:
      console.log(`[Callback] Payment failed for order ${order.id}`)
      const customerNameFail = `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() || 'Customer'
      await sendEmail(
        order.user.email,
        `Payment Failed — Order ${order.orderNumber}`,
        paymentCallbackEmail(customerNameFail, order.orderNumber, Number(order.total), 'failed', 'Pesapal')
      )
      break
    case 4:
      console.log(`[Callback] Payment reversed/refunded for order ${order.id}`)
      break
    default:
      console.log(`[Callback] Payment pending (status ${code}) for order ${order.id}`)
  }
}

async function createOrderFromPayment(
  paymentReference: string, 
  statusCode?: number | string,
  rawData?: any
): Promise<any> {
  try {
    const code = typeof statusCode === "string" ? parseInt(statusCode) : statusCode
    
    if (code !== 1) {
      console.log(`[Callback] Skipping order creation - payment not completed (status: ${code})`)
      return null
    }
    
    const checkoutSession = await prisma.checkoutSession.findFirst({
      where: {
        paymentReference: paymentReference,
        expiresAt: { gt: new Date() }
      }
    })

    if (!checkoutSession) {
      console.error(`[Callback] No checkout session found for payment: ${paymentReference}`)
      return null
    }

    const existingOrder = await prisma.order.findFirst({
      where: { orderNumber: paymentReference }
    })
    
    if (existingOrder) {
      console.log(`[Callback] Found existing order: ${existingOrder.id}`)
      return existingOrder
    }

    const items = checkoutSession.items as any[]
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error(`[Callback] No items in checkout session for payment: ${paymentReference}`)
      return null
    }

    const order = await prisma.$transaction(async (tx) => {
      const orderData = await tx.order.create({
        data: {
          orderNumber: paymentReference,
          userId: checkoutSession.userId,
          subtotal: checkoutSession.subtotal,
          tax: checkoutSession.tax,
          shipping: checkoutSession.shipping,
          total: checkoutSession.total,
          shippingAddress: checkoutSession.shippingAddress as any,
          paymentMethod: "PESAPAL",
          status: "CONFIRMED",
          paymentStatus: "PAID",
        }
      })

      for (const item of items) {
        const productId = item.productId || item.id
        const quantity = Number(item.quantity)

        await tx.product.update({
          where: { id: productId },
          data: { inventory: { decrement: quantity } }
        })

        await tx.orderItem.create({
          data: {
            orderId: orderData.id,
            productId,
            quantity,
            price: Number(item.price),
            total: Number(item.price) * quantity,
          }
        })
      }

      return orderData
    })

    console.log(`[Callback] Order created from checkout: ${order.id}`)

    await prisma.cartItem.deleteMany({
      where: { userId: checkoutSession.userId }
    })

    await prisma.checkoutSession.delete({
      where: { id: checkoutSession.id }
    })

    return order
    
  } catch (error) {
    console.error(`[Callback] Error creating order from payment:`, error)
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
      console.warn(`[Callback] Invalid subscription order ID: ${orderId}`)
      return NextResponse.json({ success: false, error: "Invalid subscription ID" }, { status: 400 })
    }

    const subscription = await prisma.sellerSubscription.findUnique({
      where: { id: subscriptionId },
      include: { seller: true }
    })

    if (!subscription) {
      console.warn(`[Callback] Subscription not found: ${subscriptionId}`)
      return NextResponse.json({ success: true, warning: "Subscription not found" })
    }

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

    if (code === 1) {
      await prisma.sellerSubscription.update({
        where: { id: subscriptionId },
        data: {
          status: "ACTIVE",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      })

      await prisma.user.update({
        where: { id: subscription.sellerId },
        data: { role: "SELLER" },
      })

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

      const sellerName = `${subscription.seller.firstName || ''} ${subscription.seller.lastName || ''}`.trim() || 'Seller'
      await sendEmail(
        subscription.seller.email,
        `Subscription Activated — ${appConfig.APP_NAME}`,
        `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#28a745">✅ Subscription Activated!</h2>
          <p>Hi ${sellerName},</p>
          <p>Your <strong>${subscription.plan}</strong> subscription has been activated successfully.</p>
          <p>You can now access all the features of your plan.</p>
          <p><a href="${appConfig.SELLER_DASHBOARD_URL}" style="display:inline-block;background:#8B2635;color:white;padding:12px 24px;text-decoration:none;border-radius:4px;margin:16px 0">Go to Dashboard</a></p>
          <p style="color:#666;font-size:12px">${appConfig.APP_FULL_NAME}</p>
        </div>`
      )

      console.log(`[Callback] Subscription ${subscriptionId} activated successfully`)
    } else {
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
