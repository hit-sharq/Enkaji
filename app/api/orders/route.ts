import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    console.log("User ID:", user?.id || "No user")

    if (!user) {
      return NextResponse.json({ error: "Please sign in to place an order" }, { status: 401 })
    }

    const requestData = await request.json()
    console.log("Order request:", requestData)

    const { items, shippingAddress, subtotal, tax, shipping, total, paymentMethod } = requestData

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items in cart" }, { status: 400 })
    }

    if (!total || total <= 0) {
      return NextResponse.json({ error: "Invalid total" }, { status: 400 })
    }

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user.id,
        subtotal: Number(subtotal || 0),
        tax: Number(tax || 0),
        shipping: Number(shipping || 0),
        total: Number(total),
        shippingAddress,
        paymentMethod: paymentMethod || "PESAPAL",
        status: "PENDING",
        paymentStatus: "PENDING",
      },
    })

    // Create order items
    for (const item of items) {
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: item.id,  // Note: cart item id === productId in context
          quantity: Number(item.quantity),
          price: Number(item.price),
          total: Number(item.price * item.quantity),
        },
      })
    }

    // Clear user's cart
    await prisma.cartItem.deleteMany({
      where: { userId: user.id },
    })

    console.log(`✅ Order created: ${order.id} for user ${user.id}`)

    return NextResponse.json(order)
  } catch (error) {
    console.error("Order creation error:", error)
    return NextResponse.json({ 
      error: "Failed to create order",
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined 
    }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { userId: user.id },
          { 
            items: { 
              some: { 
                product: { sellerId: user.id } 
              } 
            } 
          }
        ],
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

