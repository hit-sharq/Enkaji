import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { handleApiError, AuthenticationError, ValidationError, NotFoundError } from "@/lib/errors"
import { z } from "zod"

const addToCartSchema = z.object({
  productId: z
    .string()
    .min(1, "Product ID is required")
    .regex(/^c[a-z0-9]{24}$/, "Invalid product ID"),
  quantity: z.number().int().min(1, "Quantity must be at least 1").max(100, "Maximum quantity is 100"),
})

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new AuthenticationError()
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: {
        product: {
          include: {
            category: {
              select: {
                name: true,
              },
            },
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

    // Filter out inactive products
    const activeCartItems = cartItems.filter((item) => item.product.isActive)

    // Remove inactive products from cart
    const inactiveItems = cartItems.filter((item) => !item.product.isActive)
    if (inactiveItems.length > 0) {
      await prisma.cartItem.deleteMany({
        where: {
          id: {
            in: inactiveItems.map((item) => item.id),
          },
        },
      })
    }

    // Fix the total calculation by converting Decimal to number
    const total = activeCartItems.reduce((sum, item) => {
      return sum + Number(item.product.price) * item.quantity
    }, 0)

    const itemCount = activeCartItems.reduce((sum, item) => sum + item.quantity, 0)

    return NextResponse.json({
      items: activeCartItems,
      total,
      itemCount,
      currency: "KES",
    })
  } catch (error) {
    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new AuthenticationError()
    }

    const body = await request.json()
    const { productId, quantity } = addToCartSchema.parse(body)

    // Check if product exists and is active
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      throw new NotFoundError("Product not found")
    }

    if (!product.isActive) {
      throw new ValidationError("Product is not available")
    }

    // Fix stock validation - use inventory instead of stock
    if (product.inventory < quantity) {
      throw new ValidationError(`Only ${product.inventory} items available in stock`)
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
    })

    let cartItem
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity

      // Fix existing item stock validation
      if (newQuantity > product.inventory) {
        throw new ValidationError(`Cannot add more items. Only ${product.inventory} available in stock`)
      }

      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
        include: {
          product: {
            select: {
              name: true,
              price: true,
              images: true,
            },
          },
        },
      })
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          userId: user.id,
          productId,
          quantity,
        },
        include: {
          product: {
            select: {
              name: true,
              price: true,
              images: true,
            },
          },
        },
      })
    }

    return NextResponse.json({
      message: "Item added to cart successfully",
      cartItem,
    })
  } catch (error) {
    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}
