import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { type NextRequest } from "next/server"

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

    // Transform to return product data with isFavorite flag
    const favoriteProducts = favorites.map((fav) => ({
      ...fav.product,
      isFavorite: true,
      favoriteId: fav.id,
    }))

    return NextResponse.json(favoriteProducts)
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

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    // Check if product exists
    const product = await db.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

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
      return NextResponse.json({ 
        message: "Removed from favorites", 
        isFavorite: false,
        productId 
      })
    } else {
      await db.favorite.create({
        data: {
          userId: user.id,
          productId,
        },
      })
      return NextResponse.json({ 
        message: "Added to favorites", 
        isFavorite: true,
        productId 
      })
    }
  } catch (error) {
    console.error("Error toggling favorite:", error)
    return NextResponse.json({ error: "Failed to toggle favorite" }, { status: 500 })
  }
}

// DELETE handler for mobile app compatibility
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    const existingFavorite = await db.favorite.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
    })

    if (!existingFavorite) {
      return NextResponse.json({ 
        message: "Not in favorites", 
        isFavorite: false,
        productId 
      })
    }

    await db.favorite.delete({
      where: { id: existingFavorite.id },
    })

    return NextResponse.json({ 
      message: "Removed from favorites", 
      isFavorite: false,
      productId 
    })
  } catch (error) {
    console.error("Error removing favorite:", error)
    return NextResponse.json({ error: "Failed to remove favorite" }, { status: 500 })
  }
}
