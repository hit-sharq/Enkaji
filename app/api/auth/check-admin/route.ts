import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { isUserAdmin, getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ isAdmin: false, user: null })
    }

    // Check if user is admin using both env var and database
    const isAdmin = await isUserAdmin(userId)

    // Get user details
    const user = await getCurrentUser()

    return NextResponse.json({
      isAdmin,
      user: user
        ? {
            id: user.id,
            clerkId: user.clerkId,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            imageUrl: user.imageUrl,
          }
        : null,
    })
  } catch (error) {
    console.error("Error checking admin status:", error)
    return NextResponse.json({ isAdmin: false, user: null })
  }
}
