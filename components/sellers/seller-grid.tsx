import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Package, Globe } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface Seller {
  id: string
  firstName: string | null
  lastName: string | null
  imageUrl: string | null
  sellerProfile: {
    businessName: string | null
    description: string | null
    location: string | null
    businessType: string | null
    website: string | null
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

interface SellerGridProps {
  sellers: Seller[]
}

export function SellerGrid({ sellers }: SellerGridProps) {
  if (sellers.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No sellers found</h3>
        <p className="text-gray-600">Check back soon as more businesses join our platform!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {sellers.map((seller) => (
        <Card key={seller.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="aspect-square relative overflow-hidden">
            <Image
              src={seller.imageUrl || "/placeholder-user.jpg"}
              alt={seller.sellerProfile?.businessName || `${seller.firstName} ${seller.lastName}`}
              fill
              className="object-cover"
            />
          </div>
          <CardContent className="p-6">
            <div className="mb-4">
              <h3 className="font-playfair text-xl font-bold text-gray-900 mb-2">
                {seller.sellerProfile?.businessName || `${seller.firstName} ${seller.lastName}`}
              </h3>

              {seller.sellerProfile?.businessType && (
                <Badge variant="secondary" className="mb-2">
                  {seller.sellerProfile.businessType}
                </Badge>
              )}

              {seller.sellerProfile?.location && (
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="text-sm">{seller.sellerProfile.location}</span>
                </div>
              )}

              <div className="flex items-center text-gray-600 mb-3">
                <Package className="w-4 h-4 mr-1" />
                <span className="text-sm">{seller._count.products} products</span>
              </div>

              {seller.sellerProfile?.website && (
                <div className="flex items-center text-gray-600 mb-3">
                  <Globe className="w-4 h-4 mr-1" />
                  <a
                    href={seller.sellerProfile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Visit Website
                  </a>
                </div>
              )}

              {seller.sellerProfile?.description && (
                <p className="text-gray-600 text-sm line-clamp-3 mb-4">{seller.sellerProfile.description}</p>
              )}
            </div>

            {/* Featured Products */}
            {seller.products.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-sm text-gray-900 mb-2">Featured Products</h4>
                <div className="grid grid-cols-3 gap-2">
                  {seller.products.slice(0, 3).map((product) => (
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

            <Link href={`/sellers/${seller.id}`}>
              <Button className="w-full bg-orange-600 hover:bg-orange-700">View Store</Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
