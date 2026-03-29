import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { detectShippingZone, getShippingOptions } from "@/lib/shipping-enhanced"
import type { ShippingOption } from "@/types/shipping"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    console.log("User ID:", user?.id || "No user")

    if (!user) {
      return NextResponse.json({ error: "Please sign in to place an order" }, { status: 401 })
    }

    const requestData = await request.json()
    console.log("Order request:", requestData)

    const { items, shippingAddress, subtotal, tax, paymentMethod, selectedShippingOption } = requestData

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items in cart" }, { status: 400 })
    }

    // Calculate totals & shipping automatically
    let totalWeight = 0
    let lineSubtotal = 0

    // Get product weights for calculation
    for (const item of items) {
      const productId = item.productId || item.id
        const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { weight: true }
      })
      const itemWeight = product?.weight ? Number(product.weight) : 1
      const itemQty = Number(item.quantity)
      totalWeight += itemWeight * itemQty // Default 1kg
      lineSubtotal += Number(item.price) * itemQty
    }

    // Detect zone from address
    const country = shippingAddress?.country || 'Kenya'
    const city = shippingAddress?.city || ''
    const zone = detectShippingZone(country, city)
    console.log('Detected shipping zone:', zone.displayName)

    // Get shipping options & use selected or cheapest
    const shippingOptions = getShippingOptions(zone, totalWeight, lineSubtotal)
    const shippingOption = selectedShippingOption 
      ? (shippingOptions.find((opt: ShippingOption) => opt.id === selectedShippingOption) as ShippingOption)
      : shippingOptions[0] as ShippingOption // Default cheapest

    if (!shippingOption) {
      return NextResponse.json({ error: "No shipping available for this destination" }, { status: 400 })
    }

    const shippingCost = shippingOption.price
    const taxRate = 0.16 // 16% VAT
    const taxAmount = lineSubtotal * taxRate
    const grandTotal = lineSubtotal + taxAmount + shippingCost

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`

    console.log(`Shipping calc: zone=${zone.id}, weight=${totalWeight.toFixed(1)}kg, cost=KES${shippingCost}, total=KES${grandTotal}`)

    // Atomic transaction: order + inventory deduction + orderItems
    const order = await prisma.$transaction(async (tx) => {
      // Create order first
      const orderData = await tx.order.create({
        data: {
          orderNumber,
          userId: user.id,
          subtotal: lineSubtotal,
          tax: taxAmount,
          shipping: shippingCost,
          total: grandTotal,
          shippingAddress,
          paymentMethod: paymentMethod || "PESAPAL",
          status: "PENDING",
          paymentStatus: "PENDING",
        },
      });

      console.log('Validating products:', items.map(i => ({productId: i.productId || i.id, quantity: i.quantity})));
      
      // Deduct inventory & create items
      for (const item of items) {
        const productId = item.productId || item.id;
        const quantity = Number(item.quantity);
        
        // Double-check inventory
        const product = await tx.product.findUnique({ 
          where: { id: productId },
          select: { inventory: true }
        });
        
        if (!product || product.inventory < quantity) {
          throw new Error(`Insufficient inventory for product ${productId}: ${product?.inventory || 0} < ${quantity}`);
        }
        
        // Update inventory
        await tx.product.update({
          where: { id: productId },
          data: { inventory: { decrement: quantity } }
        });
        
        // Create order item
        await tx.orderItem.create({
          data: {
            orderId: orderData.id,
            productId,
            quantity,
            price: Number(item.price),
            total: Number(item.price * quantity),
          },
        });
        
        item.productId = productId;
      }
      
      return orderData;
    });

    // Clear cart outside tx (less critical)
    await prisma.cartItem.deleteMany({
      where: { userId: user.id },
    })

    console.log(`✅ Order created: ${order.id} for user ${user.id}`)

    return NextResponse.json({
      ...order,
      shippingDetails: {
        zone: zone.displayName,
        option: shippingOption.service.name,
        provider: shippingOption.provider.name,
        estimatedWeight: totalWeight.toFixed(1) + 'kg',
        estimatedDelivery: shippingOption.formattedDelivery
      }
    })
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

