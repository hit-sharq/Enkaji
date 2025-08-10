import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Package, Calendar } from "lucide-react"
import Image from "next/image"
import { ProductCard } from "@/components/products/product-card"

interface ArtisanProfileProps {
  artisan: {
    id: string
    firstName: string | null
    lastName: string | null
    imageUrl: string | null
    createdAt: Date
    sellerProfile: {
      bio: string | null
      location: string | null
      isVerified?: boolean | null
    } | null
    products: Array<{
      id: string
      name: string
      description: string
      price: number
      images: string[]
      category: {
        name: string
      }
      _count: {
        reviews: number
      }
      seller?: {
        firstName: string | null
        lastName: string | null
        imageUrl: string | null
      } | null
    }>
  }
}

export function ArtisanProfile({ artisan }: ArtisanProfileProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Artisan Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="aspect-square relative overflow-hidden rounded-full mx-auto mb-4 w-48 h-48">
                <Image
                  src={artisan.imageUrl || "/placeholder.svg?height=192&width=192&query=profile%20photo"}
                  alt={`${artisan.firstName ?? ""} ${artisan.lastName ?? ""}`}
                  fill
                  className="object-cover"
                />
              </div>
              <h1 className="font-playfair text-2xl font-bold text-gray-900 mb-2">
                {artisan.firstName} {artisan.lastName}
              </h1>

              {artisan.sellerProfile?.location && (
                <div className="flex items-center justify-center text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{artisan.sellerProfile.location}</span>
                </div>
              )}

              <div className="flex items-center justify-center text-gray-600 mb-2">
                <Package className="w-4 h-4 mr-1" />
                <span>{artisan.products.length} products</span>
              </div>

              <div className="flex items-center justify-center text-gray-600 mb-4">
                <Calendar className="w-4 h-4 mr-1" />
                <span>Joined {new Date(artisan.createdAt).toLocaleDateString()}</span>
              </div>

              <Badge className="bg-green-100 text-green-800">
                {artisan.sellerProfile?.isVerified ? "Verified Artisan" : "Community Artisan"}
              </Badge>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <h2 className="font-playfair text-2xl font-bold text-gray-900 mb-4">About {artisan.firstName}</h2>
              {artisan.sellerProfile?.bio ? (
                <p className="text-gray-700 leading-relaxed">{artisan.sellerProfile.bio}</p>
              ) : (
                <p className="text-gray-500 italic">This artisan hasn't added a bio yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Products Section */}
      <div>
        <h2 className="font-playfair text-3xl font-bold text-gray-900 mb-8">Products by {artisan.firstName}</h2>

        {artisan.products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {artisan.products.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  id: product.id,
                  name: product.name,
                  description: product.description,
                  price: product.price,
                  images: product.images,
                  category: { id: "", name: product.category.name },
                  seller: {
                    firstName: artisan.firstName ?? "",
                    lastName: artisan.lastName ?? "",
                    imageUrl: artisan.imageUrl,
                  },
                  _count: { reviews: product._count.reviews },
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products yet</h3>
            <p className="text-gray-600">{artisan.firstName} hasn't listed any products yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  )
}
