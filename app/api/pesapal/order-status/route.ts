export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { pesapalService } from "@/lib/pesapal"

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const orderIdParam = searchParams.get("orderId")

    if (!orderIdParam) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    const orderId = orderIdParam

    // Get Pesapal payment record
    const pesapalPayment = await prisma.pesapalPayment.findFirst({
      where: {
        orderId,
        userId: user.id
      }
    })

    if (!pesapalPayment) {
      return NextResponse.json({ error: "Pesapal payment not found" }, { status: 404 })
    }

    if (!pesapalPayment.pesapalTrackingId) {
      return NextResponse.json({ error: "Pesapal tracking ID not found" }, { status: 400 })
    }

    // Query Pesapal for latest status
    const statusResponse = await pesapalService.getTransactionStatus(pesapalPayment.pesapalTrackingId)

    // Update local records if status changed
    if (statusResponse.payment_status_description !== pesapalPayment.paymentStatusDescription) {
      await prisma.pesapalPayment.update({
        where: { id: pesapalPayment.id },
        data: {
          status: statusResponse.payment_status_code === 1 ? "COMPLETED" :
                  statusResponse.payment_status_code === 0 ? "FAILED" : "PENDING",
          paymentStatusDescription: statusResponse.payment_status_description
        }
      })

      // Update order status
      const orderStatus = statusResponse.payment_status_code === 1 ? "CONFIRMED" :
                         statusResponse.payment_status_code === 0 ? "CANCELLED" : "PENDING"
      const paymentStatus = statusResponse.payment_status_code === 1 ? "PAID" :
                           statusResponse.payment_status_code === 0 ? "FAILED" : "PENDING"

      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: orderStatus,
          paymentStatus
        }
      })
    }

    return NextResponse.json({
      success: true,
      payment: pesapalPayment,
      pesapalStatus: statusResponse
    })

  } catch (error) {
    console.error("Error checking Pesapal order status:", error)
    return NextResponse.json({
      error: "Failed to check order status",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
