import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requirePermission } from "@/lib/auth"
import { handleApiError } from "@/lib/errors"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if user has permission to approve artisans
    await requirePermission("artisans.approve")

    const userId = params.id
    const { approved, reason } = await request.json()

    // Update artisan profile
    const artisanProfile = await db.artisanProfile.update({
      where: { userId },
      data: {
        isApproved: approved,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    })

    // Update user role if approved
    if (approved) {
      await db.user.update({
        where: { id: userId },
        data: { role: "ARTISAN" },
      })
    }

    // Create approval log
    await db.artisanApproval.create({
      data: {
        artisanId: userId,
        approved,
        reason: reason || (approved ? "Artisan profile approved" : "Artisan profile rejected"),
        approvedBy: (await requirePermission("artisans.approve")).id,
      },
    })

    return NextResponse.json({
      message: approved ? "Artisan approved successfully" : "Artisan rejected",
      artisan: artisanProfile,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
