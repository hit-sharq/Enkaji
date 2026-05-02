import { NextRequest, NextResponse } from "next/server"

/**
 * GET /api/app-update-notes
 * Returns release notes/change log for app updates
 * (Optional endpoint for mobile app)
 */
export async function GET(request: NextRequest) {
  try {
    // You can store this in env vars, a JSON file, or database
    // For now, return static notes from env or default
    const notes = process.env.NEXT_PUBLIC_RELEASE_NOTES
      ? [{ version: "1.0.2", notes: process.env.NEXT_PUBLIC_RELEASE_NOTES }]
      : [
          { version: "1.0.2", notes: "Fixed payment flow for mobile app. Improved checkout reliability." },
          { version: "1.0.1", notes: "Initial release" },
        ]

    return NextResponse.json({ notes })
  } catch (error) {
    console.error("Error fetching update notes:", error)
    return NextResponse.json({ notes: [] })
  }
}
