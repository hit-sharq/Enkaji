import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { handleApiError, ValidationError, NotFoundError } from "@/lib/errors"
 
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { quantity } = await request.json()

    if (quantity <= 0) {
      await db.cartItem.delete({
        where: {
          id: params.id,
          userId: user.id,
        },
      })
      return NextResponse.json({ message: "Item removed from cart" })
    }

    const currentItem = await db.cartItem.findUnique({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        product: {
          select: {
            inventory: true,
          },
        },
      },
    })

    if (!currentItem?.product) {
      throw new NotFoundError("Cart item or product not found")
    }

    if (quantity > currentItem.product.inventory) {
      throw new ValidationError(`Cannot update to ${quantity} items. Only ${currentItem.product.inventory} available in stock`)
    }

    const cartItem = await db.cartItem.update({
      where: {
        id: params.id,
        userId: user.id,
      },
      data: { quantity },
      include: {
        product: true,
      },
    })

    return NextResponse.json(cartItem)
  } catch (error) {
    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await db.cartItem.delete({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    return NextResponse.json({ message: "Item removed from cart" })
  } catch (error) {
    console.error("Error removing cart item:", error)
    return NextResponse.json({ error: "Failed to remove cart item" }, { status: 500 })
  }
}
