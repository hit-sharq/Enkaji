import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { handleApiError } from "@/lib/errors"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, subject, message } = body

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Create contact message (using a simple approach since no contactMessage table exists)
    console.log(`Contact form submission: ${name} (${email}) - ${subject}: ${message}`)

    return NextResponse.json({ success: true, message: "Message received" })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function GET() {
  try {
    // Return empty array since no contactMessage table exists
    return NextResponse.json([])
  } catch (error) {
    return handleApiError(error)
  }
}
