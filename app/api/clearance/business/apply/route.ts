import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { handleApiError, AuthenticationError, ValidationError } from "@/lib/error"
import { apiRateLimit } from "@/lib/rate-limit"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new AuthenticationError()
    }

    const rateLimitResult = await apiRateLimit(request)
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    const body = await request.json()
    const { businessName, businessType, location, phone, email, description } = body

    if (!businessName || !businessType || !location || !phone || !email) {
      throw new ValidationError("Missing required fields")
    }

    const existing = await prisma.clearanceBusiness.findUnique({
      where: { userId: user.id },
    })

    if (existing) {
      throw new ValidationError("You have already submitted a clearance business application")
    }

    const application = await prisma.clearanceBusiness.create({
      data: {
        userId: user.id,
        businessName,
        businessType,
        location,
        phone,
        email,
        description,
      },
    })

    return NextResponse.json({ success: true, application }, { status: 201 })
  } catch (error) {
    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}
