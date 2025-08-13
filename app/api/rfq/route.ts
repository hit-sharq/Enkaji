import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { handleApiError } from "@/lib/errors"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, description, category, quantity, budget, deadline, location } = await request.json()

    const rfq = await prisma.rFQ.create({
      data: {
        title,
        description,
        category,
        quantity,
        budget,
        deadline,
        location,
        userId: user.id,
        status: "OPEN",
      },
    })

    return NextResponse.json({
      success: true,
      rfq,
    })
  } catch (error) {
    console.error("Error creating RFQ:", error)
    return NextResponse.json({ error: "Failed to create RFQ" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const rfqs = await prisma.rFQ.findMany({
      where: {
        userId: user.id,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(rfqs)
  } catch (error) {
    console.error("Error fetching RFQs:", error)
    return NextResponse.json({ error: "Failed to fetch RFQs" }, { status: 500 })
  }
}
