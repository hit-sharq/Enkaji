import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProductCard } from "@/components/products/product-card"
import Link from "next/link"
import { Search, Filter, Grid, List, ArrowLeft } from "lucide-react"
import { db } from "@/lib/db"
import { notFound } from "next/navigation"

interface CategoryPageProps {
  params: {
    slug: string
  }
  searchParams: {
    sort?: string
    minPrice?: string
    maxPrice?: string
    search?: string
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = params
  const { sort = "newest", minPrice, maxPrice, search } = searchParams

  // Get category
  const category = await db.category.findUnique({
    where: { slug },
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
  })

  if (!category) {
    notFound()
  }

  // Build where clause for products
  const where: any = {
    categoryId: category.id,
    isActive: true,
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ]
  }

  if (minPrice || maxPrice) {
    where.price = {}
    if (minPrice) where.price.gte = Number.parseFloat(minPrice)
    if (maxPrice) where.price.lte = Number.parseFloat(maxPrice)
  }

  // Build orderBy clause
  let orderBy: any = { createdAt: "desc" }
  switch (sort) {
    case "price-low":
      orderBy = { price: "asc" }
      break
    case "price-high":
      orderBy = { price: "desc" }
      break
    case "name":
      orderBy = { name: "asc" }
      break
    case "newest":
    default:
      orderBy = { createdAt: "desc" }
      break
  }

  // Get products
  const products = await db.product.findMany({
    where,
    orderBy,
    include: {
      seller: {
        include: {
          sellerProfile: true,
        },
      },
      category: true,
      _count: {
        select: {
          reviews: true,
        },
      },
    },
    take: 50, // Limit to 50 products per page
  })

  // Calculate average rating for each product
  const productsWithRatings = await Promise.all(
    products.map(async (product) => {
      const avgRating = await db.review.aggregate({
        where: { productId: product.id },
        _avg: { rating: true },
      })
      
      // Transform the product data to match the Product interface
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price.toNumber(),
        images: product.images || [],
        category: {
          id: product.category.id,
          name: product.category.name,
        },
        seller: {
          firstName: product.seller.firstName || 'Unknown',
          lastName: product.seller.lastName || 'Seller',
          imageUrl: product.seller.imageUrl,
        },
        _count: {
          reviews: product._count.reviews,
        },
        avgRating: avgRating._avg.rating || 0,
      }
    }),
  )

  return (
    <div className="min-h-screen">
      <Header />

      <main>
        {/* Breadcrumb */}
        <section className="bg-gray-50 py-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center space-x-2 text-sm">
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                Home
              </Link>
              <span className="text-gray-400">/</span>
              <Link href="/categories" className="text-gray-500 hover:text-gray-700">
                Categories
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium">{category.name}</span>
            </div>
          </div>
        </section>

        {/* Category Header */}
        <section className="py-8 bg-white border-b">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-4 mb-4">
                  <Link href="/categories">
                    <Button variant="ghost" size="sm">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Categories
                    </Button>
                  </Link>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{category.name}</h1>
                <p className="text-gray-600">{category._count.products} products available in this category</p>
              </div>
            </div>
          </div>
        </section>

        {/* Filters and Search */}
        <section className="py-6 bg-gray-50 border-b">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input placeholder={`Search in ${category.name}...`} className="pl-10" defaultValue={search} />
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center space-x-4">
                <Select defaultValue={sort}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="name">Name A-Z</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>

                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            {productsWithRatings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {productsWithRatings.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Found</h3>
                <p className="text-gray-600 mb-6">
                  {search
                    ? `No products found matching "${search}" in ${category.name}`
                    : `No products available in ${category.name} yet`}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/categories">
                    <Button variant="outline">Browse Other Categories</Button>
                  </Link>
                  <Link href="/rfq">
                    <Button>Request for Quotation</Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Related Categories */}
        {productsWithRatings.length > 0 && (
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Explore Other Categories</h2>
              <div className="flex justify-center">
                <Link href="/categories">
                  <Button variant="outline" className="px-8 py-3 bg-transparent">
                    View All Categories
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}

export async function generateStaticParams() {
  const categories = await db.category.findMany({
    select: { slug: true },
  })

  return categories.map((category) => ({
    slug: category.slug,
  }))
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const category = await db.category.findUnique({
    where: { slug: params.slug },
  })

  if (!category) {
    return {
      title: "Category Not Found",
    }
  }

  return {
    title: `${category.name} - Enkaji Trade Kenya`,
    description: `Browse ${category.name} products from verified suppliers in Kenya. Find quality products at competitive prices.`,
  }
}
