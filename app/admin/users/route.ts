import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { db } from "@/lib/db"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await requireAdmin()

    const users = await db.user.findMany({
      include: {
        sellerProfile: true,
        _count: {
          select: {
            orders: true,
            products: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
