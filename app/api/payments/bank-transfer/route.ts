import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const {
      orderId,
      bankName,
      accountNumber,
      accountName,
      referenceNumber,
      amount,
    } = await request.json()

    // Create bank transfer payment
    const bankTransfer = await prisma.bankTransferPayment.create({
      data: {
        userId: user.id,
        orderId,
        amount,
        bankName,
        accountNumber,
        accountName,
        referenceNumber,
        status: "PENDING",
      },
    })

    // Update order payment method
    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentMethod: "BANK_TRANSFER",
          paymentStatus: "PENDING",
        },
      })
    }

    return NextResponse.json({
      success: true,
      bankTransfer,
    })
  } catch (error) {
    console.error("Error creating bank transfer payment:", error)
    return NextResponse.json({ error: "Failed to create bank transfer payment" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get("orderId")

    const where: any = { userId: user.id }
    if (orderId) {
      where.orderId = orderId
    }

    const bankTransfers = await prisma.bankTransferPayment.findMany({
      where,
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(bankTransfers)
  } catch (error) {
    console.error("Error fetching bank transfers:", error)
    return NextResponse.json({ error: "Failed to fetch bank transfers" }, { status: 500 })
  }
}
