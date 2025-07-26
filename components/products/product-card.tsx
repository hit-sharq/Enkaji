"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, ShoppingCart, Star } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface ProductCardProps {
  product: {
    id: string
    name: string
    price: number
    images: string[]
    category: {
      name: string
    }
    seller: {
      firstName: string | null
      lastName: string | null
      imageUrl: string | null
      sellerProfile?: {
        businessName: string | null
      } | null
    }
    _count?: {
      reviews: number
    }
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const { toast } = useToast()

  const handleAddToCart = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
        }),
      })

      if (response.ok) {
        toast({
          title: "Added to cart",
          description: `${product.name} has been added to your cart.`,
        })
      } else {
        throw new Error("Failed to add to cart")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Please sign in to add items to cart.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleFavorite = async () => {
    try {
      const response = await fetch("/api/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setIsFavorite(data.isFavorite)
        toast({
          title: data.isFavorite ? "Added to favorites" : "Removed from favorites",
          description: data.message,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Please sign in to manage favorites.",
        variant: "destructive",
      })
    }
  }

  const sellerName =
    product.seller.sellerProfile?.businessName ||
    `${product.seller.firstName || ""} ${product.seller.lastName || ""}`.trim() ||
    "Unknown Seller"

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="relative">
        <Link href={`/products/${product.id}`}>
          <Image
            src={product.images[0] || "/placeholder.svg?height=300&width=300"}
            alt={product.name}
            width={300}
            height={300}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className={`absolute top-2 right-2 bg-white/80 hover:bg-white ${isFavorite ? "text-red-500" : ""}`}
          onClick={handleToggleFavorite}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
        </Button>
        <Badge className="absolute top-2 left-2 bg-orange-600 text-white">{product.category.name}</Badge>
      </div>

      <CardContent className="p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-lg mb-2 hover:text-orange-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-gray-600 mb-2">by {sellerName}</p>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
            ))}
          </div>
          <span className="text-sm text-gray-500">({product._count?.reviews || 0})</span>
        </div>
        <p className="text-xl font-bold text-orange-600">KSh {product.price.toLocaleString()}</p>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          onClick={handleAddToCart}
          disabled={isLoading}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {isLoading ? "Adding..." : "Add to Cart"}
        </Button>
      </CardFooter>
    </Card>
  )
}
