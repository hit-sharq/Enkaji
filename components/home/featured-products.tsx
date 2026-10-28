"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Heart, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { useEffect, useState, useMemo, useCallback } from "react"
import Image from "next/image"

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

const ProductsSkeleton = () => (
  <section className="bg-background py-16 md:py-24">
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="mb-14 text-center">
        <div className="mx-auto mb-4 h-12 w-96 animate-pulse rounded-lg bg-muted" />
        <div className="mx-auto h-6 w-80 animate-pulse rounded-lg bg-muted" />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Card key={i} className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="h-64 animate-pulse bg-muted" />
            <CardContent className="p-4">
              <div className="mb-2 h-4 animate-pulse rounded bg-muted" />
              <div className="mb-3 h-3 animate-pulse rounded bg-muted" />
              <div className="mb-4 h-4 animate-pulse rounded bg-muted" />
              <div className="h-10 animate-pulse rounded-lg bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
)

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const calculateAverageRating = useCallback((reviews: { rating: number }[]) => {
    if (!reviews || reviews.length === 0) return 0
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
    return sum / reviews.length
  }, [])

  const getBadgeInfo = useCallback((product: Product) => {
    if (product.featured) return { text: "Featured", color: "bg-enkaji-orange" }
    if (product.originalPrice && product.originalPrice > product.price) {
      return { text: "Sale", color: "bg-enkaji-orange" }
    }
    return { text: "New", color: "bg-enkaji-orange" }
  }, [])

  const fetchFeaturedProducts = useCallback(async () => {
    try {
      const response = await fetch("/api/products?featured=true&limit=4")
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      } else {
        console.error("Featured products fetch failed:", response.status)
        setProducts([])
      }
    } catch (error) {
      console.error("Failed to fetch featured products:", error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFeaturedProducts()
  }, [fetchFeaturedProducts])

  const productCards = useMemo(
    () =>
      products.map((product) => {
        const averageRating = calculateAverageRating(product.reviews || [])
        const badge = getBadgeInfo(product)
        const discountPercentage = product.originalPrice
          ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
          : 0

        return (
          <Card
            key={product.id}
            className="group overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated"
          >
            <div className="relative overflow-hidden">
              <Image
                src={
                  product.images[0] ||
                  `/placeholder.svg?height=300&width=300&text=${encodeURIComponent(product.name) || "/placeholder.svg"}`
                }
                alt={product.name}
                width={300}
                height={300}
                className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105 md:h-64"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                loading="lazy"
              />
              <Badge className={`absolute left-3 top-3 rounded-full ${badge.color} text-white`}>{badge.text}</Badge>
              <div className="absolute right-3 top-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-card/90 hover:bg-card">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
              {discountPercentage > 0 && (
                <div className="absolute bottom-3 left-3 rounded-lg bg-enkaji-orange px-2 py-1 text-sm font-medium text-enkaji-ink">
                  {discountPercentage}% OFF
                </div>
              )}
            </div>
            <CardContent className="p-3 md:p-4">
              <div className="mb-1.5 md:mb-2">
                <h3 className="mb-0.5 line-clamp-2 text-sm font-semibold text-foreground md:mb-1 md:text-base">{product.name}</h3>
                <p className="text-[10px] text-muted-foreground md:text-sm">{product.seller.businessName}</p>
              </div>

              <div className="mb-1.5 flex items-center gap-1 md:mb-3">
                <div className="flex items-center">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 md:h-4 md:w-4 ${
                        i < Math.floor(averageRating) ? "fill-current text-enkaji-orange" : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-muted-foreground md:text-sm">({product._count?.reviews || 0})</span>
              </div>

              <div className="mb-2 flex items-center justify-between md:mb-4">
                <div className="flex items-center gap-1 md:gap-2">
                  <span className="text-base font-bold text-foreground md:text-lg">KSh {product.price.toLocaleString()}</span>
                  {product.originalPrice && (
                    <span className="text-[10px] text-muted-foreground line-through md:text-sm">
                      KSh {product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              <Button asChild className="h-8 w-full rounded-xl bg-enkaji-orange text-xs font-semibold text-white hover:bg-enkaji-orange/90 group/btn md:h-10 md:text-sm">
                <Link href={`/products/${product.id}`}>
                  <ShoppingCart className="mr-1 h-3 w-3 transition-transform group-hover/btn:scale-110 md:mr-2 md:h-4 md:w-4" />
                  <span className="hidden md:inline">View Product</span>
                  <span className="md:hidden">View</span>
                </Link>
              </Button>
            </CardContent>
          </Card>
        )
      }),
    [products, calculateAverageRating, getBadgeInfo],
  )

  if (loading) {
    return <ProductsSkeleton />
  }

  return (
    <section className="bg-background py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 text-center md:mb-14">
          <p className="enkaji-eyebrow mb-2 md:mb-4">Featured</p>
          <h2 className="mb-2 font-display text-3xl font-semibold md:mb-4 md:text-4xl lg:text-5xl">
            <span className="enkaji-gradient-text">
              Featured Sellers
            </span>
          </h2>
          <p className="mx-auto max-w-2xl px-2 text-sm text-muted-foreground md:text-xl md:px-0">
            Top-rated sellers offering quality products for your business
          </p>
        </div>

        {products.length === 0 ? (
          <div className="py-8 text-center md:py-12">
            <p className="text-sm text-muted-foreground md:text-lg">No featured products available at the moment.</p>
            <Button asChild className="mt-4 rounded-full bg-enkaji-orange font-semibold text-white hover:bg-enkaji-orange/90">
              <Link href="/shop">Browse All Products</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">{productCards}</div>

            <div className="mt-10 text-center md:mt-12">
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border border-enkaji-orange/50 bg-transparent px-7 py-6 font-semibold text-enkaji-orange hover:bg-enkaji-orange/10"
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
