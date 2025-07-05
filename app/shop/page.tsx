import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ProductGrid } from "@/components/shop/product-grid"
import { ShopFilters } from "@/components/shop/shop-filters"
import { WhatsAppButton } from "@/components/ui/whatsapp-button"
import { db } from "@/lib/db"

async function getCategories() {
  return await db.category.findMany({
    include: {
      _count: {
        select: {
          products: {
            where: { isActive: true },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  })
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const categories = await getCategories()

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-playfair text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Shop Authentic Masai Crafts
          </h1>
          <p className="text-lg text-gray-600">Discover unique handmade pieces from talented Masai artisans</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-1/4">
            <ShopFilters categories={categories} />
          </aside>
          <div className="lg:w-3/4">
            <ProductGrid searchParams={searchParams} />
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}
