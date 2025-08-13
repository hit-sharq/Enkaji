import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { orderSchema } from "@/lib/validation"
import { handleApiError, AuthenticationError, ValidationError } from "@/lib/errors"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20",
})

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new AuthenticationError()
    }

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                price: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(orders)
  } catch (error) {
    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new AuthenticationError()
    }

    const body = await request.json()
    const { shippingAddress, paymentMethod } = orderSchema.parse(body)

    // Get cart items with product details
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            stock: true,
            isActive: true,
          },
        },
      },
    })

    if (cartItems.length === 0) {
      throw new ValidationError("Cart is empty")
    }

    // Validate stock and active status
    for (const item of cartItems) {
      if (!item.product.isActive) {
        throw new ValidationError(`Product ${item.product.name} is no longer available`)
      }
      if (item.product.stock < item.quantity) {
        throw new ValidationError(`Insufficient stock for ${item.product.name}`)
      }
    }

    const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
    const shippingCost = subtotal > 5000 ? 0 : 500 // Free shipping over 5000 KES
    const total = subtotal + shippingCost

    let paymentId: string | null = null
    let clientSecret: string | null = null

    if (paymentMethod === "STRIPE") {
      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(total * 100), // Convert to cents
          currency: "kes",
          metadata: {
            userId: user.id,
            orderType: "product_purchase",
          },
        })
        paymentId = paymentIntent.id
        clientSecret = paymentIntent.client_secret
      } catch (stripeError) {
        console.error("Stripe error:", stripeError)
        throw new ValidationError("Payment processing failed")
      }
    }

    // Create order in transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          userId: user.id,
          total,
          shippingCost,
          shippingAddress: JSON.stringify(shippingAddress),
          paymentMethod,
          paymentId,
          status: paymentMethod === "MPESA" ? "CONFIRMED" : "PENDING",
          orderItems: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
              total: item.product.price * item.quantity,
            })),
          },
        },
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  name: true,
                  images: true,
                },
              },
            },
          },
        },
      })

      // Update product stock
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        })
      }

      // Clear cart
      await tx.cartItem.deleteMany({
        where: { userId: user.id },
      })

      return newOrder
    })

    return NextResponse.json({
      order,
      clientSecret,
      message: "Order created successfully",
    })
  } catch (error) {
    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}
