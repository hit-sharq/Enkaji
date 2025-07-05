import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Package } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface Artisan {
  id: string
  firstName: string | null
  lastName: string | null
  imageUrl: string | null
  artisanProfile: {
    bio: string | null
    location: string | null
  } | null
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
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No artisans found</h3>
        <p className="text-gray-600">Check back soon as we onboard more talented artisans!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {artisans.map((artisan) => (
        <Card key={artisan.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="aspect-square relative overflow-hidden">
            <Image
              src={artisan.imageUrl || "/placeholder-user.jpg"}
              alt={`${artisan.firstName} ${artisan.lastName}`}
              fill
              className="object-cover"
            />
          </div>
          <CardContent className="p-6">
            <div className="mb-4">
              <h3 className="font-playfair text-xl font-bold text-gray-900 mb-2">
                {artisan.firstName} {artisan.lastName}
              </h3>

              {artisan.artisanProfile?.location && (
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="text-sm">{artisan.artisanProfile.location}</span>
                </div>
              )}

              <div className="flex items-center text-gray-600 mb-3">
                <Package className="w-4 h-4 mr-1" />
                <span className="text-sm">{artisan._count.products} products</span>
              </div>

              {artisan.artisanProfile?.bio && (
                <p className="text-gray-600 text-sm line-clamp-3 mb-4">{artisan.artisanProfile.bio}</p>
              )}
            </div>

            {/* Featured Products */}
            {artisan.products.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-sm text-gray-900 mb-2">Featured Products</h4>
                <div className="grid grid-cols-3 gap-2">
                  {artisan.products.slice(0, 3).map((product) => (
                    <div key={product.id} className="aspect-square relative overflow-hidden rounded">
                      <Image
                        src={product.images[0] || "/placeholder.jpg"}
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
              <Button className="w-full bg-red-800 hover:bg-red-900">View Profile</Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
