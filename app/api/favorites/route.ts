import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const favorites = await db.favorite.findMany({
      where: { userId: user.id },
      include: {
        product: {
          include: {
            category: true,
            seller: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(favorites)
  } catch (error) {
    console.error("Error fetching favorites:", error)
    return NextResponse.json({ error: "Failed to fetch favorites" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { productId } = await request.json()

    const existingFavorite = await db.favorite.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
    })

    if (existingFavorite) {
      await db.favorite.delete({
        where: { id: existingFavorite.id },
      })
      return NextResponse.json({ message: "Removed from favorites", isFavorite: false })
    } else {
      await db.favorite.create({
        data: {
          userId: user.id,
          productId,
        },
      })
      return NextResponse.json({ message: "Added to favorites", isFavorite: true })
    }
  } catch (error) {
    console.error("Error toggling favorite:", error)
    return NextResponse.json({ error: "Failed to toggle favorite" }, { status: 500 })
  }
}
