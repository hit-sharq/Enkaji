import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/products/product-card"
import { db } from "@/lib/db"

async function getFeaturedProducts() {
  const products = await db.product.findMany({
    where: { isActive: true },
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
    take: 4,
  })

  return products
}

export async function FeaturedProducts() {
  const products = await getFeaturedProducts()

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-gray-900 mb-4">Featured Crafts</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our most popular handmade pieces, each telling a unique story of Masai culture and tradition.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center">
          <Link href="/shop">
            <Button size="lg" className="bg-red-800 hover:bg-red-900 text-white px-8 py-3">
              View All Products
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
