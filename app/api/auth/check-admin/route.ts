import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { isUserAdmin } from "@/lib/auth"

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ isAdmin: false })
    }

    const adminStatus = await isUserAdmin(userId)
    return NextResponse.json({ isAdmin: adminStatus })
  } catch (error) {
    console.error("Error checking admin status:", error)
    return NextResponse.json({ isAdmin: false })
  }
}
