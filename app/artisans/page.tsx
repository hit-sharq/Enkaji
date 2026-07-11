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
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <p className="enkaji-eyebrow mb-4">Handcrafted With Care</p>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4">Meet Our Artisans</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover the talented Masai artisans behind every handcrafted piece. Each artisan brings generations of
            traditional knowledge and skill to their craft.
          </p>
        </div>

        <ArtisanGrid artisans={artisans as any} />
      </main>
      <WhatsAppButton />
    </div>
  )
}
