import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { handleApiError } from "@/lib/errors"

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()

    const user = await db.user.update({
      where: { id: params.id },
      data: { role: "SELLER" }
    })

    return NextResponse.json({ success: true, user })
  } catch (error) {
    return handleApiError(error)
  }
}
