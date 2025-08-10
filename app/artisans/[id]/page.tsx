import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { WhatsAppButton } from "@/components/ui/whatsapp-button"
import { ArtisanProfile } from "@/components/artisans/artisan-profile"
import { db } from "@/lib/db"
import { notFound } from "next/navigation"

async function getArtisan(id: string) {
  return await db.user.findUnique({
    where: {
      id,
      role: "SELLER",
      sellerProfile: {
        isVerified: true,
      },
    },
    include: {
      sellerProfile: true,
      products: {
        where: { isActive: true },
        include: {
          category: true,
          _count: {
            select: {
              reviews: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  })
}

export default async function ArtisanProfilePage({ params }: { params: { id: string } }) {
  const artisan = await getArtisan(params.id)

  if (!artisan) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <ArtisanProfile artisan={artisan} />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}
