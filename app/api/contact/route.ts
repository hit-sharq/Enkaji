import { type NextRequest, NextResponse } from "next/server"
import { contactSchema } from "@/lib/validation"
import { handleApiError } from "@/lib/errors"
import { apiRateLimit } from "@/lib/rate-limit"
import { prisma } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    // Rate limiting for contact form
    const rateLimitResult = apiRateLimit(request)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
          },
        },
      )
    }

    const body = await request.json()
    const { name, email, subject, message } = contactSchema.parse(body)

    // Save contact message to database
    const contactMessage = await prisma.contactMessage.create({
      data: {
        name,
        email,
        subject,
        message,
        status: "UNREAD",
      },
    })

    // TODO: Send email notification to admin
    // await sendContactNotification({ name, email, subject, message })

    console.log("Contact form submission:", {
      id: contactMessage.id,
      name,
      email,
      subject,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: "Message sent successfully. We'll get back to you soon!",
      id: contactMessage.id,
    })
  } catch (error) {
    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}

export async function GET() {
  try {
    // This endpoint is for admin use only
    await requireAdmin()

    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 50, // Limit to recent 50 messages
    })

    return NextResponse.json(messages)
  } catch (error) {
    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}
