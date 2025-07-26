import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, ShoppingCart, Heart } from "lucide-react"

interface Product {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  category: {
    id: string
    name: string
  }
  seller: {
    firstName: string
    lastName: string
    imageUrl: string | null
  }
  _count: {
    reviews: number
  }
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const sellerName = `${product.seller.firstName} ${product.seller.lastName}`
  const sellerInitials = `${product.seller.firstName[0]}${product.seller.lastName[0]}`

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
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
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>
          <div className="absolute top-2 left-2">
            <Badge variant="secondary">{product.category.name}</Badge>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-primary">KES {product.price.toLocaleString()}</div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm text-gray-600">({product._count.reviews})</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={product.seller.imageUrl || undefined} />
              <AvatarFallback className="text-xs">{sellerInitials}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-600">by {sellerName}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 space-y-2">
        <div className="flex gap-2 w-full">
          <Button asChild className="flex-1">
            <Link href={`/products/${product.id}`}>View Details</Link>
          </Button>
          <Button size="icon" variant="outline">
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
