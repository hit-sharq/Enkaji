import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { handleApiError } from "@/lib/errors"
import { EscrowStatus } from "@prisma/client"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { orderId, amount } = await request.json()

    // Create escrow payment
    const escrowPayment = await prisma.escrowPayment.create({
      data: {
        orderId,
        buyerId: user.id,
        amount,
        status: EscrowStatus.HELD,
      },
    })

    return NextResponse.json({
      success: true,
      escrowPayment,
    })
  } catch (error) {
    console.error("Error creating escrow payment:", error)
    return NextResponse.json({ error: "Failed to create escrow payment" }, { status: 500 })
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

    const where: any = {}
    if (orderId) {
      where.orderId = orderId
    }

    // For buyers, show their escrow payments
    if (user.role === "BUYER") {
      where.buyerId = user.id
    }

    const escrowPayments = await prisma.escrowPayment.findMany({
      where,
      include: {
        order: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(escrowPayments)
  } catch (error) {
    console.error("Error fetching escrow payments:", error)
    return NextResponse.json({ error: "Failed to fetch escrow payments" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { escrowPaymentId, action } = await request.json()

    const escrowPayment = await prisma.escrowPayment.findUnique({
      where: { id: escrowPaymentId },
      include: {
        order: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    })

    if (!escrowPayment) {
      return NextResponse.json({ error: "Escrow payment not found" }, { status: 404 })
    }

    // Check if user is seller for this order
    const isSeller = escrowPayment.order.items.some(
      (item: any) => item.product.sellerId === user.id
    )

    if (!isSeller) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Update escrow payment status
    let updatedStatus: EscrowStatus
    if (action === "release") {
      updatedStatus = EscrowStatus.RELEASED
    } else if (action === "dispute") {
      updatedStatus = EscrowStatus.DISPUTED
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    const updatedEscrowPayment = await prisma.escrowPayment.update({
      where: { id: escrowPaymentId },
      data: {
        status: updatedStatus,
      },
    })

    return NextResponse.json({
      success: true,
      escrowPayment: updatedEscrowPayment,
    })
  } catch (error) {
    console.error("Error updating escrow payment:", error)
    return NextResponse.json({ error: "Failed to update escrow payment" }, { status: 500 })
  }
}
