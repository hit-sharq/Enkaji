import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { handleApiError, AuthenticationError, ValidationError } from "@/lib/errors"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new AuthenticationError()
    }

    const { orderId, action } = await request.json()

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                seller: true,
              },
            },
          },
        },
        escrowPayment: true,
      },
    })

    if (!order) {
      throw new ValidationError("Order not found")
    }

    // Only buyer can release escrow or seller can request release
    const isBuyer = order.userId === user.id
    const isSeller = order.orderItems.some((item) => item.product.sellerId === user.id)

    if (!isBuyer && !isSeller) {
      throw new ValidationError("Unauthorized")
    }

    switch (action) {
      case "HOLD":
        // Create escrow hold (done during order creation)
        if (!order.escrowPayment) {
          await prisma.escrowPayment.create({
            data: {
              orderId: order.id,
              amount: order.total,
              status: "HELD",
              heldAt: new Date(),
            },
          })
        }
        break

      case "RELEASE":
        // Buyer releases payment to seller
        if (!isBuyer) {
          throw new ValidationError("Only buyer can release escrow payment")
        }

        await prisma.escrowPayment.update({
          where: { orderId: order.id },
          data: {
            status: "RELEASED",
            releasedAt: new Date(),
          },
        })

        // Process seller payouts
        await processSellerPayouts(order)
        break

      case "REQUEST_RELEASE":
        // Seller requests payment release
        if (!isSeller) {
          throw new ValidationError("Only seller can request payment release")
        }

        await prisma.escrowPayment.update({
          where: { orderId: order.id },
          data: {
            status: "RELEASE_REQUESTED",
            releaseRequestedAt: new Date(),
          },
        })

        // Send notification to buyer
        // TODO: Implement notification system
        break

      case "DISPUTE":
        // Either party can raise a dispute
        await prisma.escrowPayment.update({
          where: { orderId: order.id },
          data: {
            status: "DISPUTED",
            disputedAt: new Date(),
          },
        })

        // Create dispute record
        await prisma.paymentDispute.create({
          data: {
            orderId: order.id,
            raisedBy: user.id,
            status: "OPEN",
            description: "Payment dispute raised",
          },
        })
        break

      default:
        throw new ValidationError("Invalid action")
    }

    return NextResponse.json({ message: "Escrow action completed successfully" })
  } catch (error) {
    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}

async function processSellerPayouts(order: any) {
  const PLATFORM_COMMISSION_RATE = 0.05 // 5%
  const PAYMENT_PROCESSING_FEE_RATE = 0.029 // 2.9%
  const PAYMENT_PROCESSING_FIXED_FEE = 30 // KES 30

  // Group order items by seller
  const sellerItems = new Map()

  for (const item of order.orderItems) {
    const sellerId = item.product.sellerId
    if (!sellerItems.has(sellerId)) {
      sellerItems.set(sellerId, [])
    }
    sellerItems.get(sellerId).push(item)
  }

  // Create payout records for each seller
  for (const [sellerId, items] of sellerItems) {
    const grossAmount = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)
    const platformCommission = grossAmount * PLATFORM_COMMISSION_RATE
    const paymentProcessingFee = grossAmount * PAYMENT_PROCESSING_FEE_RATE + PAYMENT_PROCESSING_FIXED_FEE
    const netAmount = grossAmount - platformCommission - paymentProcessingFee

    await prisma.sellerPayout.create({
      data: {
        sellerId,
        orderId: order.id,
        grossAmount,
        platformCommission,
        paymentProcessingFee,
        netAmount,
        status: "PENDING",
        currency: "KES",
      },
    })
  }
}
