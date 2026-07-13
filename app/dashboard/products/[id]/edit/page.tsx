import { notFound, redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { ProductForm } from "@/components/dashboard/product-form"

interface EditProductPageProps {
  params: {
    id: string
  }
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/signin")
  }

  const product = await db.product.findUnique({
    where: {
      id: params.id,
    },
    include: {
      category: true,
    },
  })

  if (!product) {
    notFound()
  }

  if (product.sellerId !== user.id && user.role !== "ADMIN") {
    redirect("/dashboard/products")
  }

  const categories = await db.category.findMany({
    orderBy: {
      name: "asc",
    },
  })

  // Convert Decimal types to numbers for the form
  const productForForm = {
    ...product,
    price: Number(product.price),
    inventory: Number(product.inventory),
    weight: product.weight ? Number(product.weight) : null,
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Edit Product</h1>
        <ProductForm categories={categories} product={productForForm} />
      </div>
    </div>
  )
}
