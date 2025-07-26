import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { WhatsAppButton } from "@/components/ui/whatsapp-button"
import { SellerGrid } from "@/components/sellers/seller-grid"
import { db } from "@/lib/db"

async function getSellers() {
  return await db.user.findMany({
    where: {
      role: "SELLER",
    },
    include: {
      sellerProfile: true,
      products: {
        where: { isActive: true },
        take: 3,
      },
      _count: {
        select: {
          products: {
            where: { isActive: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

export default async function SellersPage() {
  const sellers = await getSellers()

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="font-playfair text-3xl md:text-4xl font-bold text-gray-900 mb-4">Meet Our Sellers</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover trusted sellers and businesses from across Kenya. From small enterprises to large manufacturers,
            find the right partner for your business needs.
          </p>
        </div>

        <SellerGrid sellers={sellers} />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}
