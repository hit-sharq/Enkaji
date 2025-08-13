import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { handleApiError } from "@/lib/errors"
import { isUserAdmin } from "@/lib/auth"
// ProductStatus doesn't exist in schema, use proper status handling

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
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

    const product = await db.product.findUnique({
      where: { id: params.id },
      include: {
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            sellerProfile: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        orderItems: {
          include: {
            order: {
              select: {
                id: true,
                status: true,
                total: true,
                createdAt: true,
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
          orderBy: { order: { createdAt: "desc" } },
          take: 10,
        },
        _count: {
          select: {
            orderItems: true,
            favorites: true,
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error fetching product:", error)
    return handleApiError(error)
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
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

    const { status, featured, reason } = await req.json()

    const updateData: any = {
      updatedAt: new Date(),
    }

    if (status) {
      // Handle product status validation properly
      const validStatuses = ["PENDING", "APPROVED", "REJECTED", "DRAFT", "PUBLISHED"]
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 })
      }
      updateData.isActive = status === "APPROVED" || status === "PUBLISHED"
    }

    if (typeof featured === "boolean") {
      updateData.featured = featured
    }

    const updatedProduct = await db.product.update({
      where: { id: params.id },
      data: updateData,
      include: {
        seller: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    })

    // Get the current user to log the approval
    const currentUser = await db.user.findUnique({
      where: { clerkId: userId },
    })

    // Log the approval action if we have a valid user
    if (status && currentUser) {
      await db.productApproval.create({
        data: {
          productId: params.id,
          approvedBy: currentUser.id,
          approved: status === "APPROVED",
          reason: reason || null,
        },
      })
    }

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error("Error updating product:", error)
    return handleApiError(error)
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
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

    await db.product.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("Error deleting product:", error)
    return handleApiError(error)
  }
}
