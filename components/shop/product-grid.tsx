import { ProductCard } from "@/components/products/product-card"
import { db } from "@/lib/db"

interface ProductGridProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

async function getProducts(searchParams: any) {
  const page = Number.parseInt((searchParams.page as string) || "1")
  const limit = 12
  const category = searchParams.category as string
  const minPrice = searchParams.minPrice as string
  const maxPrice = searchParams.maxPrice as string
  const search = searchParams.search as string

  const where: any = {
    isActive: true,
  }

  if (category) {
    where.category = {
      slug: category,
    }
  }

  if (minPrice || maxPrice) {
    where.price = {}
    if (minPrice) where.price.gte = Number.parseFloat(minPrice)
    if (maxPrice) where.price.lte = Number.parseFloat(maxPrice)
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ]
  }

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      include: {
        category: true,
        artisan: {
          select: {
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.product.count({ where }),
  ])

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  }
}

export async function ProductGrid({ searchParams }: ProductGridProps) {
  const { products, pagination } = await getProducts(searchParams)

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">
          Showing {products.length} of {pagination.total} products
        </p>
        <select className="border border-gray-300 rounded-md px-3 py-2">
          <option>Sort by: Featured</option>
          <option>Price: Low to High</option>
          <option>Price: High to Low</option>
          <option>Newest First</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center mt-12">
          <div className="flex space-x-2">
            {pagination.page > 1 && (
              <a
                href={`?${new URLSearchParams({ ...searchParams, page: (pagination.page - 1).toString() })}`}
                className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Previous
              </a>
            )}

            {[...Array(pagination.pages)].map((_, i) => {
              const pageNum = i + 1
              return (
                <a
                  key={pageNum}
                  href={`?${new URLSearchParams({ ...searchParams, page: pageNum.toString() })}`}
                  className={`px-3 py-2 rounded-md ${
                    pageNum === pagination.page ? "bg-red-800 text-white" : "border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </a>
              )
            })}

            {pagination.page < pagination.pages && (
              <a
                href={`?${new URLSearchParams({ ...searchParams, page: (pagination.page + 1).toString() })}`}
                className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Next
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
