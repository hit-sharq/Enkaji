import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { z } from "zod"
import { apiRateLimit } from "@/lib/rate-limit"
import sanitizeHtml from "sanitize-html"

// Validation schemas
const testimonialsQuerySchema = z.object({
  featured: z.string().optional().transform(val => val === "true"),
  limit: z.string().optional().transform(val => {
    const num = Number.parseInt(val || "10")
    return Math.min(Math.max(num, 1), 100) // Limit between 1 and 100
  })
})

const testimonialCreateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters").max(1000),
  rating: z.number().int().min(1).max(5).optional(),
})

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await apiRateLimit(request)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.resetTime || Date.now() + 900000) / 1000).toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          }
        }
      )
    }

    const { searchParams } = new URL(request.url)

    // Validate query parameters
    const validationResult = testimonialsQuerySchema.safeParse({
      featured: searchParams.get("featured"),
      limit: searchParams.get("limit")
    })

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const { featured, limit } = validationResult.data

    const where: any = {}

    if (featured) {
      where.isFeatured = true
    }

    const testimonials = await prisma.contact.findMany({
      where: {
        ...where,
        type: "TESTIMONIAL"
      },
      orderBy: [{ createdAt: "desc" }],
      take: limit,
    })

    return NextResponse.json({ testimonials })
  } catch (error) {
    console.error("Error fetching testimonials:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting for POST requests
    const rateLimitResult = await apiRateLimit(request)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.resetTime || Date.now() + 900000) / 1000).toString(),
          }
        }
      )
    }

    const body = await request.json()

    // Validate input
    const validationResult = testimonialCreateSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input data", details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const { name, email, message, rating } = validationResult.data

    // Sanitize HTML content
    const sanitizedMessage = sanitizeHtml(message, {
      allowedTags: [],
      allowedAttributes: {}
    })

    const testimonial = await prisma.contact.create({
      data: {
        email,
        firstName: name.split(' ')[0],
        lastName: name.split(' ').slice(1).join(' ') || '',
        message: sanitizedMessage,
        subject: rating ? `Testimonial Rating: ${rating}/5` : 'Testimonial',
        type: "TESTIMONIAL"
      }
    })

    return NextResponse.json({
      success: true,
      testimonial: {
        id: testimonial.id,
        name,
        email,
        message: sanitizedMessage,
        rating,
        createdAt: testimonial.createdAt
      }
    })
  } catch (error) {
    console.error("Error creating testimonial:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
