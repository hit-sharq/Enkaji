export const dynamic = 'force-dynamic'

import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { handleApiError } from "@/lib/errors"
import { isUserAdmin } from "@/lib/auth"
import { UserRole } from "@prisma/client"

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Use the proper admin check that includes environment variable
    const isAdmin = await isUserAdmin(userId)

    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const role = searchParams.get("role") || ""

    const skip = (page - 1) * limit

    const whereConditions: any[] = []

    if (search) {
      whereConditions.push({
        OR: [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      })
    }

    if (role && Object.values(UserRole).includes(role as UserRole)) {
      whereConditions.push({ role: role as UserRole })
    }

    const where = whereConditions.length > 0 ? { AND: whereConditions } : {}

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          sellerProfile: true,
          _count: {
            select: {
              orders: true,
              products: true,
            },
          },
        },
      }),
      db.user.count({ where }),
    ])

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return handleApiError(error)
  }
}
