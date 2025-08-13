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

    // Get product and seller details
    const product = await db.product.findUnique({
      where: { id: productId },
      include: {
        seller: {
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
    const bulkOrder = await db.bulkOrder.create({
      data: {
        userId: user.id,
        title: `Bulk order for ${product.name}`,
        description: message || "",
        totalAmount: totalPrice,
        status: "PENDING",
      },
    })

    // TODO: Send email notification to seller
    // await sendBulkOrderNotification(product.seller.email, bulkOrder)

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
      where.userId = user.id
    } else if (type === "received" && user.role === "SELLER") {
      // For received orders, we need to filter by seller through products
      const userProducts = await db.product.findMany({
        where: { sellerId: user.id },
        select: { id: true }
      })
      const productIds = userProducts.map(p => p.id)
      
      where.items = {
        some: {
          productId: {
            in: productIds
          }
        }
      }
    } else {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const bulkOrders = await db.bulkOrder.findMany({
      where,
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
                  },
                },
              },
            },
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
