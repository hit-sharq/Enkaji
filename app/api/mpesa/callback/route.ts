import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log("M-Pesa Callback received:", JSON.stringify(body, null, 2))

    const { Body } = body
    const { stkCallback } = Body

    if (stkCallback.ResultCode === 0) {
      // Payment successful
      const { CallbackMetadata } = stkCallback
      const items = CallbackMetadata.Item

      const amount = items.find((item: any) => item.Name === "Amount")?.Value
      const mpesaReceiptNumber = items.find((item: any) => item.Name === "MpesaReceiptNumber")?.Value
      const phoneNumber = items.find((item: any) => item.Name === "PhoneNumber")?.Value
      const transactionDate = items.find((item: any) => item.Name === "TransactionDate")?.Value

      // Find and update the order
      const checkoutRequestId = stkCallback.CheckoutRequestID

      // You might want to store the checkoutRequestId when creating the order
      // For now, we'll log the successful payment
      console.log("Payment successful:", {
        amount,
        mpesaReceiptNumber,
        phoneNumber,
        transactionDate,
        checkoutRequestId,
      })

      // Update order status if you have a way to match it
      // await db.order.update({
      //   where: { checkoutRequestId },
      //   data: {
      //     status: "CONFIRMED",
      //     paymentId: mpesaReceiptNumber,
      //   },
      // })
    } else {
      // Payment failed
      console.log("Payment failed:", stkCallback.ResultDesc)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("M-Pesa callback error:", error)
    return NextResponse.json({ error: "Callback processing failed" }, { status: 500 })
  }
}
