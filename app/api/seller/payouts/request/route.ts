import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { handleApiError } from "@/lib/errors"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "SELLER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { amount, method, recipientDetails } = await request.json()

    const payoutRequest = await prisma.payoutRequest.create({
      data: {
        sellerId: user.id,
        amount,
        method,
        recipientDetails,
        status: "PENDING",
      },
    })

    return NextResponse.json({
      success: true,
      payoutRequest,
    })
  } catch (error) {
    console.error("Error creating payout request:", error)
    return NextResponse.json({ error: "Failed to create payout request" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "SELLER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payoutRequests = await prisma.payoutRequest.findMany({
      where: { sellerId: user.id },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(payoutRequests)
  } catch (error) {
    console.error("Error fetching payout requests:", error)
    return NextResponse.json({ error: "Failed to fetch payout requests" }, { status: 500 })
  }
}
