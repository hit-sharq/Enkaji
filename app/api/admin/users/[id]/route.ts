import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()
    const { action } = await request.json()
    const userId = params.id

    switch (action) {
      case "activate":
        await prisma.user.update({
          where: { id: userId },
          data: { isActive: true },
        })
        break

      case "deactivate":
        await prisma.user.update({
          where: { id: userId },
          data: { isActive: false },
        })
        break

      case "delete":
        await prisma.user.delete({
          where: { id: userId },
        })
        break

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}
