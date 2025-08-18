import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, ShoppingCart, Heart, MapPin, Verified, Weight } from "lucide-react"
import { formatDualCurrency } from "@/lib/currency"
import { formatWeight } from "@/lib/shipping"

interface Product {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  weight?: number
  category: {
    id: string
    name: string
  }
  seller: {
    firstName: string
    lastName: string
    imageUrl: string | null
    isVerified?: boolean
    businessName?: string
    location?: string
  }
  _count: {
    reviews: number
  }
}

interface ProductCardProps {
  product: Product
  viewMode?: "grid" | "list"
}

export function ProductCard({ product, viewMode = "grid" }: ProductCardProps) {
  const sellerName = product.seller.businessName || `${product.seller.firstName} ${product.seller.lastName}`
  const sellerInitials = `${product.seller.firstName[0]}${product.seller.lastName[0]}`

  if (viewMode === "list") {
    return (
      <Card className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-transparent hover:border-l-blue-500">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            {/* Image */}
            <div className="relative md:w-64 aspect-square md:aspect-video overflow-hidden">
              <Image
                src={product.images[0] || "/placeholder.svg?height=200&width=300"}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-200"
              />
              <div className="absolute top-2 left-2">
                <Badge variant="secondary">{product.category.name}</Badge>
              </div>
              <div className="absolute top-2 right-2">
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-xl mb-2 line-clamp-1">{product.name}</h3>
                <p className="text-gray-600 line-clamp-2">{product.description}</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-blue-600">{formatDualCurrency(product.price)}</div>
                <div className="flex items-center gap-4">
                  {product.weight && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Weight className="h-4 w-4" />
                      {formatWeight(product.weight)}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-gray-600">({product._count.reviews})</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={product.seller.imageUrl || undefined} />
                    <AvatarFallback className="text-xs">{sellerInitials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">{sellerName}</span>
                      {product.seller.isVerified && <Verified className="h-3 w-3 text-blue-500" />}
                    </div>
                    {product.seller.location && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="h-3 w-3" />
                        {product.seller.location}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button asChild>
                    <Link href={`/products/${product.id}`}>View Details</Link>
                  </Button>
                  <Button size="icon" variant="outline">
                    <ShoppingCart className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
      <CardContent className="p-0">
        <div className="relative aspect-square overflow-hidden rounded-t-lg">
          <Image
            src={product.images[0] || "/placeholder.svg?height=300&width=300"}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
          />
          <div className="absolute top-2 right-2 space-y-2">
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="shadow-sm">
              {product.category.name}
            </Badge>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-blue-600 transition-colors">
              {product.name}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xl font-bold text-blue-600">{formatDualCurrency(product.price)}</div>
            <div className="flex items-center gap-3">
              {product.weight && (
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <Weight className="h-3 w-3" />
                  {formatWeight(product.weight)}
                </div>
              )}
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm text-gray-600">({product._count.reviews})</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={product.seller.imageUrl || undefined} />
              <AvatarFallback className="text-xs">{sellerInitials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-600 truncate">{sellerName}</span>
                {product.seller.isVerified && <Verified className="h-3 w-3 text-blue-500 flex-shrink-0" />}
              </div>
              {product.seller.location && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{product.seller.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 space-y-2">
        <div className="flex gap-2 w-full">
          <Button asChild className="flex-1">
            <Link href={`/products/${product.id}`}>View Details</Link>
          </Button>
          <Button size="icon" variant="outline" className="hover:bg-blue-50 hover:border-blue-200 bg-transparent">
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
