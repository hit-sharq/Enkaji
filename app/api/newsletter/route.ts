import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { newsletterSchema } from "@/lib/validation"
import { handleApiError, ConflictError } from "@/lib/error"
import { apiRateLimit } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = apiRateLimit(request)
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    const body = await request.json()
    const { email } = newsletterSchema.parse(body)

    // Check if already subscribed
    const existingSubscription = await prisma.contact.findFirst({
      where: {
        email,
        type: "NEWSLETTER",
      },
    })

    if (existingSubscription) {
      throw new ConflictError("Email is already subscribed to our newsletter")
    }

    // Create new subscription
    await prisma.contact.create({
      data: {
        email,
        type: "NEWSLETTER",
        subject: "Newsletter Subscription",
        message: "Newsletter subscription request",
      },
    })

    // TODO: Send welcome email
    // await sendWelcomeEmail(email)

    return NextResponse.json({
      message: "Successfully subscribed to newsletter",
    })
  } catch (error) {
    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")
    const token = searchParams.get("token")

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // TODO: Verify unsubscribe token for security
    // if (!token || !verifyUnsubscribeToken(email, token)) {
    //   return NextResponse.json({ error: "Invalid unsubscribe link" }, { status: 400 })
    // }

    await prisma.contact.deleteMany({
      where: {
        email,
        type: "NEWSLETTER",
      },
    })

    return NextResponse.json({
      message: "Successfully unsubscribed from newsletter",
    })
  } catch (error) {
    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}
