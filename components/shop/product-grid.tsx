"use client"
import { db } from "@/lib/db"
import { ProductCard } from "@/components/products/product-card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter } from "lucide-react"

interface Product {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  category: {
    id: string
    name: string
  }
  seller: {
    firstName: string
    lastName: string
    imageUrl: string | null
  }
  _count: {
    reviews: number
  }
  createdAt: string
}

interface Category {
  id: string
  name: string
}

async function getCategories() {
  const response = await fetch("/api/categories")
  if (!response.ok) {
    throw new Error("Failed to fetch categories")
  }
  return response.json()
}

export async function ProductGrid({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const categorySlug = typeof searchParams.category === "string" ? searchParams.category : undefined
  const searchQuery = typeof searchParams.search === "string" ? searchParams.search : undefined

  const products = await db.product.findMany({
    where: {
      isActive: true,
      name: searchQuery ? { contains: searchQuery } : undefined,
      category: categorySlug ? { slug: categorySlug } : undefined,
    },
    include: {
      category: true,
      seller: {
        select: {
          firstName: true,
          lastName: true,
          imageUrl: true,
        },
      },
      _count: {
        select: { reviews: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 24,
  })

  const categories = await getCategories()

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input placeholder="Search products..." value={searchQuery || ""} className="pl-10" readOnly />
          </div>
        </form>

        <div className="flex gap-2">
          <Select value={categorySlug || "all"} onValueChange={() => {}}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found</p>
          <p className="text-gray-400">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={{
                id: p.id,
                name: p.name,
                description: p.description,
                price: p.price,
                images: p.images,
                category: { id: p.category.id, name: p.category.name },
                seller: {
                  firstName: p.seller.firstName || "",
                  lastName: p.seller.lastName || "",
                  imageUrl: p.seller.imageUrl,
                },
                _count: { reviews: p._count.reviews },
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
