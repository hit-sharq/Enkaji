import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { isUserAdmin } from "@/lib/auth"

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      console.log("No userId found in auth")
      return NextResponse.json({ isAdmin: false })
    }

    console.log("Checking admin status for userId:", userId)
    console.log("ADMIN_IDS env var:", process.env.ADMIN_IDS)

    const adminStatus = await isUserAdmin(userId)
    console.log("Admin status result:", adminStatus)

    return NextResponse.json({ isAdmin: adminStatus })
  } catch (error) {
    console.error("Error checking admin status:", error)
    return NextResponse.json({ isAdmin: false })
  }
}
