import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { pesapalService } from "@/lib/pesapal"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { orderId, currency = "KES", paymentMethod } = await request.json()

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    // Get order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (order.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Prepare Pesapal order data
    const pesapalOrderData = {
      id: orderId,
      currency,
      amount: order.total,
      description: `Payment for order ${order.orderNumber}`,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/pesapal/callback`,
      notification_id: orderId, // We'll use orderId as notification_id for simplicity
      billing_address: {
        email_address: user.email,
        phone_number: user.phone || "",
        country_code: "KE", // Default to Kenya, can be made dynamic
        first_name: user.firstName || "",
        middle_name: "",
        last_name: user.lastName || "",
        line_1: order.shippingAddress?.address || "",
        line_2: "",
        city: order.shippingAddress?.city || "",
        state: order.shippingAddress?.state || "",
        postal_code: order.shippingAddress?.zipCode || "",
        zip_code: order.shippingAddress?.zipCode || ""
      }
    }

    // Submit order to Pesapal
    const pesapalResponse = await pesapalService.submitOrder(pesapalOrderData)

    // Create Pesapal payment record
    const pesapalPayment = await prisma.pesapalPayment.create({
      data: {
        orderId,
        userId: user.id,
        amount: order.total,
        currency,
        pesapalTrackingId: pesapalResponse.order_tracking_id,
        pesapalMerchantRef: pesapalResponse.merchant_reference,
        paymentMethod: paymentMethod || "CARD",
        status: "PENDING"
      }
    })

    // Update order with payment method
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentMethod: "PESAPAL",
        paymentStatus: "PENDING"
      }
    })

    return NextResponse.json({
      success: true,
      pesapalPayment,
      redirect_url: pesapalResponse.redirect_url,
      order_tracking_id: pesapalResponse.order_tracking_id
    })

  } catch (error) {
    console.error("Error submitting Pesapal order:", error)
    return NextResponse.json({
      error: "Failed to submit order to Pesapal",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
