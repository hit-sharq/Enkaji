import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireRole } from "@/lib/auth"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireRole("ADMIN")

    const artisanProfile = await db.artisanProfile.update({
      where: { userId: params.id },
      data: { isApproved: true },
    })

    // Update user role to ARTISAN
    await db.user.update({
      where: { id: params.id },
      data: { role: "ARTISAN" },
    })

    return NextResponse.json({ message: "Artisan approved successfully" })
  } catch (error) {
    console.error("Error approving artisan:", error)
    return NextResponse.json({ error: "Failed to approve artisan" }, { status: 500 })
  }
}
