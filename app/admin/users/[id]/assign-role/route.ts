import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requirePermission, canManageUser } from "@/lib/auth"

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if user has permission to assign roles
    await requirePermission("roles.assign")

    const { role } = await request.json()
    const userId = params.id

    // Validate role
    const validRoles = [
      "BUYER",
      "SELLER",
      "ARTISAN",
      "ADMIN",
      "MODERATOR",
      "SUPPORT_AGENT",
      "CONTENT_MANAGER",
      "FINANCE_MANAGER",
      "REGIONAL_MANAGER",
    ]

    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    // Check if current user can manage the target user
    const canManage = await canManageUser(userId)
    if (!canManage) {
      return NextResponse.json({ error: "Cannot assign role to this user" }, { status: 403 })
    }

    // Update user role
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({
      message: "Role assigned successfully",
      user: updatedUser,
    })
  } catch (error) {
    console.error("Error assigning role:", error)
    return NextResponse.json({ error: "Failed to assign role" }, { status: 500 })
  }
}
