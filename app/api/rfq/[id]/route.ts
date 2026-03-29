import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { handleApiError } from "@/lib/errors"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const rfqId = params.id

    const rfq = await prisma.rFQ.findUnique({
      where: { id: rfqId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          }
        }
      }
    })

    if (!rfq || rfq.userId !== user.id) {
      return NextResponse.json({ error: "RFQ not found" }, { status: 404 })
    }

    // TODO: Include quotes when Quote model exists
    const rfqData = {
      ...rfq,
      items: [], // RFQItem[] - to be implemented
      quotes: [] // Quote[] - to be implemented
    }

    return NextResponse.json(rfqData)
  } catch (error) {
    console.error("Error fetching RFQ:", error)
    return NextResponse.json({ error: "Failed to fetch RFQ" }, { status: 500 })
  }
}

