import { type NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Get database user
    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id },
      select: {
        id: true,
        clerkId: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    })

    // Check if user is in ADMIN_IDS
    const adminIds = process.env.ADMIN_IDS?.split(",") || []
    const isEnvAdmin = adminIds.includes(user.id)

    return NextResponse.json({
      clerk: {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      database: dbUser,
      adminStatus: {
        isEnvAdmin,
        isDatabaseAdmin: dbUser?.role === "ADMIN",
        adminIds: adminIds.length > 0 ? `${adminIds.length} admin(s) configured` : "No admins configured",
      },
      instructions: {
        toMakeAdmin: `Add your Clerk ID (${user.id}) to ADMIN_IDS environment variable`,
        example: `ADMIN_IDS=${user.id}`,
      },
    })
  } catch (error) {
    console.error("Error getting user info:", error)
    return NextResponse.json({ error: "Failed to get user info" }, { status: 500 })
  }
}
