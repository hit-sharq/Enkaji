import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get("featured")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    const where: any = {}

    if (featured === "true") {
      where.isFeatured = true
    }

    const testimonials = await db.testimonial.findMany({
      where,
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      take: limit,
    })

    return NextResponse.json({ testimonials })
  } catch (error) {
    console.error("Error fetching testimonials:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
