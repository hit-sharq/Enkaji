import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Package } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface SellerProfile {
  bio: string | null
  location: string | null
}

interface Artisan {
  id: string
  firstName: string | null
  lastName: string | null
  imageUrl: string | null
  sellerProfile: SellerProfile | null
  products: Array<{
    id: string
    name: string
    price: number
    images: string[]
  }>
  _count: {
    products: number
  }
}

interface ArtisanGridProps {
  artisans: Artisan[]
}

export function ArtisanGrid({ artisans }: ArtisanGridProps) {
  if (artisans.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium text-foreground mb-2">No artisans found</h3>
        <p className="text-muted-foreground">Check back soon as we onboard more talented artisans!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {artisans.map((artisan) => (
        <Card key={artisan.id} className="overflow-hidden border border-border bg-card rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <div className="aspect-square relative overflow-hidden">
            <Image
              src={artisan.imageUrl || "/placeholder.svg?height=600&width=600&query=profile%20photo"}
              alt={`${artisan.firstName ?? ""} ${artisan.lastName ?? ""}`}
              fill
              className="object-cover"
            />
          </div>
          <CardContent className="p-6">
            <div className="mb-4">
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                {artisan.firstName} {artisan.lastName}
              </h3>

              {artisan.sellerProfile?.location && (
                <div className="flex items-center text-muted-foreground mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="text-sm">{artisan.sellerProfile.location}</span>
                </div>
              )}

              <div className="flex items-center text-muted-foreground mb-3">
                <Package className="w-4 h-4 mr-1" />
                <span className="text-sm">{artisan._count.products} products</span>
              </div>

              {artisan.sellerProfile?.bio && (
                <p className="text-muted-foreground text-sm line-clamp-3 mb-4">{artisan.sellerProfile.bio}</p>
              )}
            </div>

            {artisan.products.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-sm text-foreground mb-2">Featured Products</h4>
                <div className="grid grid-cols-3 gap-2">
                  {artisan.products.slice(0, 3).map((product) => (
                    <div key={product.id} className="aspect-square relative overflow-hidden rounded-lg">
                      <Image
                        src={product.images[0] || "/placeholder.svg?height=120&width=120&query=product%20image"}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Link href={`/artisans/${artisan.id}`}>
              <Button className="w-full bg-enkaji-gold hover:bg-enkaji-gold/90 text-enkaji-ink font-semibold">
                View Profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
