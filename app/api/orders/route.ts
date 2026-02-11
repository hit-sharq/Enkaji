import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    console.log("🔍 Attempting to get current user from Clerk...")
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.log("✅ User found from Clerk:", user.id)

    const requestData = await request.json()
    console.log("[v0] Order request data:", JSON.stringify(requestData, null, 2))

    const { items, shippingAddress, billingAddress, paymentMethod, paymentIntentId, subtotal, tax, shipping, total } =
      requestData

    console.log(
      "[v0] Validation check - subtotal:",
      subtotal,
      "shipping:",
      shipping,
      "total:",
      total,
      "items length:",
      items?.length,
    )

    if (subtotal === undefined || subtotal === null || shipping === undefined || shipping === null || total === undefined || total === null || !items || items.length === 0) {
      console.log("[v0] Validation failed - missing required fields")
      return NextResponse.json(
        {
          error: "Missing required order data",
          details: {
            subtotal: subtotal !== undefined && subtotal !== null,
            shipping: shipping !== undefined && shipping !== null,
            total: total !== undefined && total !== null,
            items: !!items,
            itemsLength: items?.length || 0,
          },
        },
        { status: 400 },
      )
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId: user.id,
        subtotal: Number(subtotal),
        tax: Number(tax) || 0,
        shipping: Number(shipping),
        total: Number(total),
        shippingAddress,
        billingAddress,
        paymentMethod: paymentMethod || "PESAPAL",
        paymentIntentId,
        status: "PENDING",
        paymentStatus: "PENDING",
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    // Create order items
    for (const item of items) {
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
        },
      })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
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
        OR: [{ userId: user.id }, { items: { some: { product: { sellerId: user.id } } } }],
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
