import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { handleApiError, AuthenticationError, ValidationError } from "@/lib/errors"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new AuthenticationError()
    }

    const { orderId, bankDetails, amount } = await request.json()

    if (!bankDetails.accountNumber || !bankDetails.bankName || !bankDetails.accountName) {
      throw new ValidationError("Complete bank details required")
    }

    // Create bank transfer payment record
    const bankTransfer = await prisma.bankTransferPayment.create({
      data: {
        orderId,
        userId: user.id,
        amount,
        bankName: bankDetails.bankName,
        accountNumber: bankDetails.accountNumber,
        accountName: bankDetails.accountName,
        swiftCode: bankDetails.swiftCode,
        status: "PENDING",
        currency: "KES",
      },
    })

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "PENDING_PAYMENT",
        paymentMethod: "BANK_TRANSFER",
        paymentId: bankTransfer.id,
      },
    })

    return NextResponse.json({
      message: "Bank transfer payment initiated",
      transferDetails: {
        referenceNumber: bankTransfer.id,
        amount: amount,
        currency: "KES",
        instructions: [
          "Transfer the exact amount to the provided bank details",
          "Use the reference number in your transfer description",
          "Payment will be verified within 24 hours",
          "Order will be processed after payment confirmation",
        ],
      },
    })
  } catch (error) {
    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new AuthenticationError()
    }

    const transfers = await prisma.bankTransferPayment.findMany({
      where: { userId: user.id },
      include: {
        order: {
          select: {
            id: true,
            total: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(transfers)
  } catch (error) {
    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}
