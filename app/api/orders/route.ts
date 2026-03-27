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

// Validate products exist
    console.log('Validating products:', items.map(i => ({productId: i.productId || i.id, quantity: i.quantity})));
    
    for (const item of items) {
      const productId = item.productId || item.id;
      const product = await prisma.product.findUnique({ 
        where: { id: productId },
        select: { id: true, name: true, inventory: true }
      });
      
      if (!product) {
        console.error(`Product not found: ${productId}`);
        return NextResponse.json({ 
          error: `Product not found: ${productId}`,
          details: 'Check if product exists in database'
        }, { status: 404 });
      }
      
      if (product.inventory < Number(item.quantity)) {
        return NextResponse.json({ 
          error: `Insufficient inventory for ${product.name}`,
          details: `Available: ${product.inventory}, Requested: ${item.quantity}`
        }, { status: 400 });
      }
      
      item.productId = productId;
    }

    // Create order items
    for (const item of items) {
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: item.productId!,
          quantity: Number(item.quantity),
          price: Number(item.price),
          total: Number(item.price * item.quantity),
        },
      });
    }

    // Clear user's cart
    await prisma.cartItem.deleteMany({
      where: { userId: user.id },
    })

    console.log(`✅ Order created: ${order.id} for user ${user.id}`)

    return NextResponse.json(order)
  } catch (error) {
    console.error("Order creation FULL ERROR:", {
      message: error instanceof Error ? error.message : 'Unknown',
      stack: error instanceof Error ? error.stack : 'No stack',
      name: error instanceof Error ? error.name : 'Unknown',
      cause: error instanceof Error ? (error as any).cause : 'No cause'
    });
    
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ 
      error: "Failed to create order: " + errorMessage,
      details: process.env.NODE_ENV === 'development' ? {
        message: errorMessage,
        ...(error instanceof Error && error.stack ? { stack: error.stack } : {})
      } : undefined 
    }, { status: 500 });
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

