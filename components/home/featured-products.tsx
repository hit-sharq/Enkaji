"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Heart, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  images: string[]
  seller: {
    id: string
    businessName: string
  }
  category: {
    name: string
  }
  reviews: {
    rating: number
  }[]
  _count: {
    reviews: number
  }
  featured: boolean
  status: string
}

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await fetch("/api/products?featured=true&limit=4&status=APPROVED")
        if (response.ok) {
          const data = await response.json()
          setProducts(data.products || [])
        }
      } catch (error) {
        console.error("Failed to fetch featured products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedProducts()
  }, [])

  const calculateAverageRating = (reviews: { rating: number }[]) => {
    if (!reviews || reviews.length === 0) return 0
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
    return sum / reviews.length
  }

  const getBadgeInfo = (product: Product) => {
    if (product.featured) return { text: "Featured", color: "bg-enkaji-green" }
    if (product.originalPrice && product.originalPrice > product.price) {
      return { text: "Sale", color: "bg-enkaji-ochre" }
    }
    return { text: "New", color: "bg-enkaji-gold" }
  }

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="h-12 bg-gray-200 rounded-lg w-96 mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded-lg w-80 mx-auto animate-pulse"></div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="overflow-hidden border-0 shadow-lg">
                <div className="h-64 bg-gray-200 animate-pulse"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded mb-3 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4 animate-pulse"></div>
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-enkaji-ochre to-enkaji-brown bg-clip-text text-transparent">
              Featured Suppliers
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Top-rated suppliers offering quality products for your business
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No featured products available at the moment.</p>
            <Button asChild className="mt-4 bg-enkaji-red hover:bg-enkaji-red/90">
              <Link href="/shop">Browse All Products</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product) => {
                const averageRating = calculateAverageRating(product.reviews || [])
                const badge = getBadgeInfo(product)
                const discountPercentage = product.originalPrice
                  ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                  : 0

                return (
                  <Card
                    key={product.id}
                    className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={
                          product.images[0] ||
                          `/placeholder.svg?height=300&width=300&text=${encodeURIComponent(product.name) || "/placeholder.svg"}`
                        }
                        alt={product.name}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <Badge className={`absolute top-3 left-3 ${badge.color} text-white`}>{badge.text}</Badge>
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button
                          size="icon"
                          variant="secondary"
                          className="w-8 h-8 rounded-full bg-white/90 hover:bg-white"
                        >
                          <Heart className="w-4 h-4" />
                        </Button>
                      </div>
                      {discountPercentage > 0 && (
                        <div className="absolute bottom-3 left-3 bg-enkaji-red text-white px-2 py-1 rounded text-sm font-medium">
                          {discountPercentage}% OFF
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <div className="mb-2">
                        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">{product.name}</h3>
                        <p className="text-sm text-gray-600">{product.seller.businessName}</p>
                      </div>

                      <div className="flex items-center gap-1 mb-3">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(averageRating) ? "text-enkaji-gold fill-current" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">({product._count?.reviews || 0})</span>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-enkaji-red">
                            KSh {product.price.toLocaleString()}
                          </span>
                          {product.originalPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              KSh {product.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>

                      <Button asChild className="w-full bg-enkaji-red hover:bg-enkaji-red/90 text-white group/btn">
                        <Link href={`/products/${product.id}`}>
                          <ShoppingCart className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                          View Product
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <div className="text-center mt-12">
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-enkaji-ochre text-enkaji-ochre hover:bg-enkaji-ochre hover:text-white bg-transparent"
              >
                <Link href="/shop">Browse All Products</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
