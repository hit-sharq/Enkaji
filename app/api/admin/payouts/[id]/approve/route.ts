import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { pesapalService } from "@/lib/pesapal"
import type { PesapalOrderData } from "@/lib/pesapal"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()

    const payoutRequestId = params.id
    const { approved, notes } = await request.json()

    const payoutRequest = await prisma.payoutRequest.findUnique({
      where: { id: payoutRequestId },
      include: {
        seller: true
      }
    })

    if (!payoutRequest) {
      return NextResponse.json({ error: "Payout request not found" }, { status: 404 })
    }

    if (approved) {
await prisma.$transaction(async (tx) => {
        // Update payout request
        await tx.payoutRequest.update({
          where: { id: payoutRequestId },
          data: {
            status: "APPROVED",
            adminNotes: notes,
            processedAt: new Date(),
          }
        })

        // Create seller payout
        const sellerPayout = await tx.sellerPayout.create({
          data: {
            sellerId: payoutRequest.sellerId,
            amount: Number(payoutRequest.amount) * 0.95,
            grossAmount: Number(payoutRequest.amount),
            platformFee: Number(payoutRequest.amount) * 0.05,
            processingFee: Number(payoutRequest.amount) * 0.01,
            status: "PROCESSING",
            method: "PESAPAL",
            recipientDetails: payoutRequest.recipientDetails as any
          }
        })

        // Submit to Pesapal (demo/sandbox)
        const orderData: PesapalOrderData = {
          id: sellerPayout.id,
          currency: 'KES',
          amount: sellerPayout.amount.toString(),
          description: `Payout to ${payoutRequest.seller.firstName || 'Seller'} ${payoutRequest.seller.lastName || ''}`,
          callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000'}/api/pesapal/callback`,
          notification_id: `payout-${sellerPayout.id}`,
          billing_address: {
            email_address: payoutRequest.seller.email || '',
            phone_number: ((payoutRequest.recipientDetails as any)?.phone || '').toString(),
            country_code: 'KE',
            first_name: payoutRequest.seller.firstName || 'Seller',
            last_name: payoutRequest.seller.lastName || '',
            line_1: (payoutRequest.recipientDetails as any)?.line1 || '',
            city: (payoutRequest.recipientDetails as any)?.city || 'Nairobi',
            state: 'Nairobi',
            postal_code: '00100'
          }
        }

        const pesapalResponse = await pesapalService.submitOrder(orderData)
        
        // Track Pesapal order
        await tx.sellerPayout.update({
          where: { id: sellerPayout.id },
          data: {
            transactionId: pesapalResponse.order_tracking_id
          }
        })
      })

      return NextResponse.json({ 
        success: true, 
        message: "Payout approved and submitted to Pesapal" 
      })
    } else {
      // Reject
      await prisma.payoutRequest.update({
        where: { id: payoutRequestId },
        data: {
          status: "REJECTED",
          adminNotes: notes || "Rejected by admin",
          processedAt: new Date()
        }
      })

      return NextResponse.json({ 
        success: true, 
        message: "Payout rejected" 
      })
    }
  } catch (error) {
    console.error('Payout approval error:', error)
    return NextResponse.json({ 
      error: 'Failed to process payout request',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 })
  }
}
