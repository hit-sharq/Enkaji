"use client"

import { useState, useEffect } from "react"
import { ProductCard } from "@/components/products/product-card"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Loader2 } from "lucide-react"

interface Product {
  id: string
  name: string
  price: number
  images: string[]
  artisan: {
    firstName?: string
    lastName?: string
  }
}

interface Favorite {
  id: string
  product: Product
}

interface FavoritesListProps {
  userId: string
}

export function FavoritesList({ userId }: FavoritesListProps) {
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchFavorites()
  }, [userId])

  const fetchFavorites = async () => {
    try {
      const response = await fetch("/api/favorites")
      if (response.ok) {
        const data = await response.json()
        setFavorites(data)
      }
    } catch (error) {
      console.error("Error fetching favorites:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    )
  }

  if (favorites.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Heart className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No favorites yet</h3>
          <p className="text-gray-600 text-center">Start exploring our products and save your favorites here.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {favorites.map((favorite) => (
        <ProductCard key={favorite.id} product={favorite.product} />
      ))}
    </div>
  )
}
