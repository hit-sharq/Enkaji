import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { WhatsAppButton } from "@/components/ui/whatsapp-button"
import { ArtisanGrid } from "@/components/artisans/artisan-grid"
import { db } from "@/lib/db"

async function getArtisans() {
  return await db.user.findMany({
    where: {
      role: "SELLER",
      sellerProfile: {
        isVerified: true,
      },
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

export default async function ArtisansPage() {
  const artisans = await getArtisans()

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="font-playfair text-3xl md:text-4xl font-bold text-gray-900 mb-4">Meet Our Artisans</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the talented Masai artisans behind every handcrafted piece. Each artisan brings generations of
            traditional knowledge and skill to their craft.
          </p>
        </div>

        <ArtisanGrid artisans={artisans as any} />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}
