export const dynamic = 'force-dynamic'

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
              isShopApproved: true, // Only count approved products
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
    isShopApproved: true, // Only show admin-approved products
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

   // Calculate average rating and flatten seller data
   const productsWithRatings = await Promise.all(
     products.map(async (product) => {
       const avgRatingResult = await db.review.aggregate({
         where: { productId: product.id },
         _avg: { rating: true },
       })
       const avgRating = avgRatingResult._avg.rating || 0
       
       // Build product object matching ProductCard's Product interface
       return {
         id: product.id,
         name: product.name,
         description: product.description,
         price: product.price.toNumber(),
         images: product.images || [],
         category: {
           id: product.category.id,
           name: product.category.name,
           slug: product.category.slug,
         },
         seller: {
           firstName: product.seller.firstName || 'Unknown',
           lastName: product.seller.lastName || 'Seller',
           imageUrl: product.seller.imageUrl,
           businessName: product.seller.sellerProfile?.businessName || undefined,
           location: product.seller.sellerProfile?.location || undefined,
           isVerified: product.seller.sellerProfile?.isVerified || false,
         },
         _count: {
           reviews: product._count.reviews,
         },
         avgRating,
       }
     }),
   )

  return (
    <div className="min-h-screen bg-background">
      <main>
        {/* Breadcrumb */}
        <section className="bg-card border-b border-border py-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center space-x-2 text-sm">
              <Link href="/" className="text-muted-foreground hover:text-enkaji-gold transition-colors">
                Home
              </Link>
              <span className="text-muted-foreground">/</span>
              <Link href="/categories" className="text-muted-foreground hover:text-enkaji-gold transition-colors">
                Categories
              </Link>
              <span className="text-muted-foreground">/</span>
              <span className="text-foreground font-medium">{category.name}</span>
            </div>
          </div>
        </section>

        {/* Category Header */}
        <section className="py-12 bg-card border-b border-border">
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
                <span className="enkaji-eyebrow mb-2 block">{category.name}</span>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">{category.name}</h1>
                <p className="text-muted-foreground">{category._count.products} products available in this category</p>
              </div>
            </div>
          </div>
        </section>

        {/* Filters and Search */}
        <section className="py-6 bg-card border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
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
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            {productsWithRatings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {productsWithRatings.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-card border border-border rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-display font-semibold text-foreground mb-2">No Products Found</h3>
                <p className="text-muted-foreground mb-6">
                  {search
                    ? `No products found matching "${search}" in ${category.name}`
                    : `No products available in ${category.name} yet`}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/categories">
                    <Button variant="outline" className="border-enkaji-gold/50 text-enkaji-gold hover:bg-enkaji-gold/10">Browse Other Categories</Button>
                  </Link>
                  <Link href="/rfq">
                    <Button className="bg-enkaji-gold hover:bg-enkaji-gold/90 text-enkaji-ink font-semibold">Request for Quotation</Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Related Categories */}
        {productsWithRatings.length > 0 && (
          <section className="py-20 bg-card border-y border-border">
            <div className="container mx-auto px-4">
              <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">Explore Other Categories</h2>
              <div className="flex justify-center">
                <Link href="/categories">
                  <Button variant="outline" className="border-enkaji-gold/50 text-enkaji-gold hover:bg-enkaji-gold/10 px-8 py-3 bg-transparent">
                    View All Categories
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  )
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
    description: `Browse ${category.name} products on Enkaji marketplace.`,
  }
}
