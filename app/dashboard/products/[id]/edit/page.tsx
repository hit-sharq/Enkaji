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

  console.log('🔍 DEBUG EDIT: User:', user ? {id: user.id, role: user.role} : 'NO USER')

  if (!user) {
    console.log('❌ DEBUG EDIT: No user - redirecting to signin')
    redirect("/auth/signin")
  }

console.log('🔍 DEBUG EDIT: Product ID:', params.id)
  console.log('🔍 DEBUG EDIT: Looking for product...')

  const product = await db.product.findUnique({
    where: {
      id: params.id,
    },
    include: {
      category: true,
    },
  })

  console.log('🔍 DEBUG EDIT: Product found:', !!product)
  if (product) {
    console.log('🔍 DEBUG EDIT: Product details:', {
      id: product.id,
      sellerId: product.sellerId,
      name: product.name,
      isActive: product.isActive,
    })
  }

  if (!product) {
    console.log('❌ DEBUG EDIT: Product NOT FOUND - triggering notFound()')
    notFound()
  }

// Check if user owns this product or is admin
  console.log('🔍 DEBUG EDIT: Ownership check:', {
    userId: user.id,
    userRole: user.role,
    productSellerId: product.sellerId,
    ownsProduct: product.sellerId === user.id,
    isAdmin: user.role === 'ADMIN'
  })

  if (product.sellerId !== user.id && user.role !== "ADMIN") {
    console.log('❌ DEBUG EDIT: Ownership denied - redirecting to /dashboard/products')
    redirect("/dashboard/products")
  }
  console.log('✅ DEBUG EDIT: Ownership verified')

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
