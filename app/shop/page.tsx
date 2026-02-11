import { ProductGrid } from "@/components/shop/product-grid"
import { ShopFilters } from "@/components/shop/shop-filters"
import { WhatsAppButton } from "@/components/ui/whatsapp-button"
import { db } from "@/lib/db"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

async function getCategories() {
  return await db.category.findMany({
    include: {
      _count: {
        select: {
          products: {
            where: {
              isActive: true,
            },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  })
}

async function getProductsCount() {
  return await db.product.count({
    where: {
      isActive: true,
    },
  })
}

function ShopPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Skeleton className="h-10 w-80 mb-4" />
        <Skeleton className="h-6 w-96" />
      </div>
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-1/4">
          <Skeleton className="h-96 w-full" />
        </aside>
        <div className="lg:w-3/4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const [categories, productsCount] = await Promise.all([getCategories(), getProductsCount()])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-800 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl">
            <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-4">Discover Quality Products</h1>
            <p className="text-xl text-blue-100 mb-6">
              Browse through {productsCount.toLocaleString()}+ products from verified suppliers across Kenya
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Verified Suppliers</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span>Quality Guaranteed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>Nationwide Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <Suspense fallback={<ShopPageSkeleton />}>
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <aside className="lg:w-1/4">
              <div className="sticky top-4">
                <ShopFilters categories={categories} />
              </div>
            </aside>

            {/* Products Grid */}
            <div className="lg:w-3/4">
              <ProductGrid searchParams={searchParams} />
            </div>
          </div>
        </Suspense>
      </main>

      <WhatsAppButton />
    </div>
  )
}
