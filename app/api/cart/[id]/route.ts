import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
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
      await prisma.cartItem.delete({
        where: {
          id: params.id,
          userId: user.id,
        },
      })
      return NextResponse.json({ message: "Item removed from cart" })
    }

    const currentItem = await prisma.cartItem.findUnique({
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

    const cartItem = await prisma.cartItem.update({
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

    // Support both cartItem.id and productId (for context compatibility)
    const cartItemId = params.id
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        OR: [
          { id: cartItemId, userId: user.id },
          { productId: cartItemId, userId: user.id }
        ]
      },
    })

    if (!cartItem) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 })
    }

    await prisma.cartItem.delete({
      where: {
        id: cartItem.id,
      },
    })

    return NextResponse.json({ message: "Item removed from cart successfully" })
  } catch (error) {
    console.error("Error removing cart item:", error)
    return NextResponse.json({ error: "Failed to remove cart item" }, { status: 500 })
  }
}

