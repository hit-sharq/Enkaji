import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("Pesapal IPN received:", JSON.stringify(body, null, 2))

    const {
      OrderTrackingId,
      OrderNotificationType,
      OrderMerchantReference,
      OrderTrackingId: pesapalTrackingId,
      OrderMerchantReference: pesapalMerchantRef,
      pesapal_transaction_tracking_id,
      payment_method,
      amount,
      currency,
      status,
      status_description,
      payment_account,
      call_back_url,
      description,
      message,
      reference,
      third_party_reference
    } = body

    // Store IPN data
    await prisma.pesapalIPN.create({
      data: {
        pesapalTransactionId: pesapal_transaction_tracking_id || OrderTrackingId,
        pesapalTrackingId: pesapalTrackingId || OrderTrackingId,
        pesapalMerchantRef: pesapalMerchantRef || OrderMerchantReference,
        paymentMethod: payment_method,
        amount: parseFloat(amount),
        currency,
        status,
        statusDescription: status_description,
        paymentAccount: payment_account,
        callBackUrl: call_back_url,
        description,
        message,
        reference,
        thirdPartyReference: third_party_reference,
        rawData: body,
        processedAt: new Date()
      }
    })

    // Find the order using merchant reference (which is our orderId)
    const orderId = pesapalMerchantRef || OrderMerchantReference

    if (orderId) {
      // Update Pesapal payment record
      const pesapalPayment = await prisma.pesapalPayment.findFirst({
        where: { orderId }
      })

      if (pesapalPayment) {
        await prisma.pesapalPayment.update({
          where: { id: pesapalPayment.id },
          data: {
            pesapalTransactionId: pesapal_transaction_tracking_id || OrderTrackingId,
            status: status === "200" ? "COMPLETED" : status === "1" ? "FAILED" : "PENDING",
            paymentStatusDescription: status_description
          }
        })

        // Update order status
        const orderStatus = status === "200" ? "CONFIRMED" : status === "1" ? "CANCELLED" : "PENDING"
        const paymentStatus = status === "200" ? "PAID" : status === "1" ? "FAILED" : "PENDING"

        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: orderStatus,
            paymentStatus
          }
        })

        console.log(`Order ${orderId} payment status updated: ${paymentStatus}`)
      }
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Pesapal IPN processing error:", error)
    return NextResponse.json({ error: "IPN processing failed" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  // Handle callback redirects from Pesapal
  const { searchParams } = new URL(request.url)
  const OrderTrackingId = searchParams.get('OrderTrackingId')
  const OrderMerchantReference = searchParams.get('OrderMerchantReference')

  if (OrderTrackingId && OrderMerchantReference) {
    // Redirect to order confirmation page
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/orders/${OrderMerchantReference}?payment=completed`)
  }

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/orders`)
}
