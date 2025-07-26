import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { productId, quantity, message, unitPrice, totalPrice } = await request.json()

    // Get product and artisan details
    const product = await db.product.findUnique({
      where: { id: productId },
      include: {
        artisan: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Create bulk order request
    const bulkOrder = await db.bulkOrderRequest.create({
      data: {
        buyerId: user.id,
        artisanId: product.artisanId,
        productId,
        quantity,
        unitPrice,
        totalPrice,
        message: message || "",
        status: "PENDING",
      },
    })

    // TODO: Send email notification to artisan
    // await sendBulkOrderNotification(product.artisan.email, bulkOrder)

    return NextResponse.json({
      success: true,
      message: "Bulk order request submitted successfully",
      bulkOrderId: bulkOrder.id,
    })
  } catch (error) {
    console.error("Error creating bulk order:", error)
    return NextResponse.json({ error: "Failed to submit bulk order request" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") // "sent" or "received"

    const where: any = {}

    if (type === "sent") {
      where.buyerId = user.id
    } else if (type === "received" && user.role === "ARTISAN") {
      where.artisanId = user.id
    } else {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const bulkOrders = await db.bulkOrderRequest.findMany({
      where,
      include: {
        product: {
          select: {
            name: true,
            images: true,
            price: true,
          },
        },
        buyer: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        artisan: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(bulkOrders)
  } catch (error) {
    console.error("Error fetching bulk orders:", error)
    return NextResponse.json({ error: "Failed to fetch bulk orders" }, { status: 500 })
  }
}
