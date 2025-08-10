import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ProductDetails } from "@/components/products/product-details"
import { WhatsAppButton } from "@/components/ui/whatsapp-button"
import { db } from "@/lib/db"
import { notFound } from "next/navigation"

async function getProduct(id: string) {
  const product = await db.product.findUnique({
    where: { id },
    include: {
      category: true,
      seller: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          imageUrl: true,
          sellerProfile: true,
        },
      },
      reviews: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              imageUrl: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: {
          reviews: true,
        },
      },
    },
  })

  if (!product) return null

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum: number, review) => sum + review.rating, 0) / product.reviews.length
      : 0

  return {
    ...product,
    avgRating: Math.round(avgRating * 10) / 10,
  }
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id)

  if (!product) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <ProductDetails product={product as any} />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}
