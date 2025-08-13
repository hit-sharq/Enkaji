import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { handleApiError, AuthenticationError, NotFoundError } from "@/lib/errors"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new AuthenticationError()
    }

    const order = await prisma.order.findFirst({
      where: {
        id: params.id,
        OR: [
          { userId: user.id }, // Buyer can see their order
          { items: { some: { product: { sellerId: user.id } } } }, // Seller can see orders for their products
        ],
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              include: {
                seller: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                    sellerProfile: {
                      select: {
                        businessName: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!order) {
      throw new NotFoundError("Order not found")
    }

    return NextResponse.json(order)
  } catch (error) {
    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new AuthenticationError()
    }

    const { status, trackingNumber } = await request.json()

    // Check if user is seller for this order
    const order = await prisma.order.findFirst({
      where: {
        id: params.id,
        items: { some: { product: { sellerId: user.id } } },
      },
    })

    if (!order) {
      throw new NotFoundError("Order not found or unauthorized")
    }

    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: {
        status,
        trackingNumber,
        updatedAt: new Date(),
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    // If order is completed, process seller payouts
    if (status === "DELIVERED") {
      await processSellerPayouts(updatedOrder)
    }

    return NextResponse.json(updatedOrder)
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

  for (const item of order.items) {
    const sellerId = item.product.sellerId
    if (!sellerItems.has(sellerId)) {
      sellerItems.set(sellerId, [])
    }
    sellerItems.get(sellerId).push(item)
  }

  // Create payout records for each seller
  for (const [sellerId, items] of sellerItems) {
    const grossAmount = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)
    const platformFee = grossAmount * PLATFORM_COMMISSION_RATE
    const processingFee = grossAmount * PAYMENT_PROCESSING_FEE_RATE + PAYMENT_PROCESSING_FIXED_FEE
    const netAmount = grossAmount - platformFee - processingFee

    await prisma.sellerPayout.create({
      data: {
        sellerId,
        orderId: order.id,
        amount: netAmount,
        grossAmount,
        platformFee,
        processingFee,
        status: "PENDING",
        recipientDetails: {
          method: "MPESA",
          phone: "+254700000000" // Placeholder - should get from seller profile
        }
      },
    })
  }
}
