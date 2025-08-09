import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()
    const { verify } = await request.json()
    const userId = params.id

    await prisma.sellerProfile.update({
      where: { userId },
      data: { isVerified: verify },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating seller verification:", error)
    return NextResponse.json({ error: "Failed to update seller verification" }, { status: 500 })
  }
}
