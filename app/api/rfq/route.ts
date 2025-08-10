import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { items, category, budget, deadline, additionalInfo } = await request.json()

    // Create RFQ
    const rfq = await db.rFQRequest.create({
      data: {
        buyerId: user.id,
        category,
        budget,
        deadline: deadline ? new Date(deadline) : null,
        additionalInfo: additionalInfo || "",
        status: "OPEN",
        items: {
          create: items.map((item: any) => ({
            productName: item.productName,
            quantity: item.quantity,
            specifications: item.specifications || "",
          })),
        },
      },
      include: {
        items: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: "RFQ submitted successfully",
      rfqId: rfq.id,
    })
  } catch (error) {
    console.error("Error creating RFQ:", error)
    return NextResponse.json({ error: "Failed to submit RFQ" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") // "my-rfqs" or "available" (for sellers)

    const where: any = {}

    if (type === "my-rfqs") {
      where.buyerId = user.id
    } else if (type === "available" && user.role === "SELLER") {
      where.status = "OPEN"
      // TODO: Add category matching based on seller's specialties
    } else {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const rfqs = await db.rFQRequest.findMany({
      where,
      include: {
        items: true,
        buyer: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            quotes: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(rfqs)
  } catch (error) {
    console.error("Error fetching RFQs:", error)
    return NextResponse.json({ error: "Failed to fetch RFQs" }, { status: 500 })
  }
}
