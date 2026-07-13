"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, ShoppingCart, MapPin, Verified, Weight } from "lucide-react"
import { formatDualCurrency } from "@/lib/currency"
import { formatWeight } from "@/lib/shipping"
import { useCart } from "@/components/providers/cart-provider"
import { useToast } from "@/hooks/use-toast"
import { FavoriteButton } from "@/components/favorites/favorite-button"
import { csrfFetch } from "@/lib/csrf-client"

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
  isFavorite?: boolean
  avgRating?: number
}

interface ProductCardProps {
  product: Product
  viewMode?: "grid" | "list"
}

export function ProductCard({ product, viewMode = "grid" }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false)
  const { toast } = useToast()
  const cartContext = useCart()
  const dispatch = cartContext?.dispatch

  const sellerName = product.seller.businessName || `${product.seller.firstName} ${product.seller.lastName}`
  const sellerInitials = `${product.seller.firstName[0]}${product.seller.lastName[0]}`

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isAdding) return
    
    setIsAdding(true)
    try {
      const response = await csrfFetch("/api/cart", {
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
        // Dispatch to local cart state for immediate UI update
        dispatch?.({
          type: "ADD_ITEM",
          payload: {
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image: product.images[0] || undefined,
            weight: product.weight,
          },
        })
        
        toast({
          title: "Added to cart",
          description: `${product.name} added to your cart.`,
        })
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to add to cart")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Please sign in to add items to cart.",
        variant: "destructive",
      })
    } finally {
      setIsAdding(false)
    }
  }

  if (viewMode === "list") {
    return (
        <Card className="group border-enkaji-gold/20 bg-card rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition border-l-4 border-l-transparent hover:border-l-enkaji-gold">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            {/* Image */}
            <div className="relative md:w-64 aspect-square md:aspect-video overflow-hidden">
              <Image
                src={product.images[0] || "/placeholder.png?height=200&width=300"}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-200"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.png"
                }}
              />
              <div className="absolute top-2 left-2">
                <Badge variant="secondary">{product.category.name}</Badge>
              </div>
              <div className="absolute top-2 right-2">
                <FavoriteButton 
                  productId={product.id} 
                  initialIsFavorite={product.isFavorite}
                  size="sm"
                  variant="secondary"
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 space-y-4">
              <div>
                <h3 className="font-display font-semibold text-xl mb-2 line-clamp-1 group-hover:text-enkaji-gold transition-colors">{product.name}</h3>
                <p className="text-muted-foreground line-clamp-2">{product.description}</p>
              </div>

              <div className="flex items-center justify-between">
                 <div className="text-2xl font-bold text-enkaji-gold">{formatDualCurrency(product.price)}</div>
                <div className="flex items-center gap-4">
                  {product.weight && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Weight className="h-4 w-4" />
                      {formatWeight(product.weight)}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-enkaji-gold text-enkaji-gold" />
                    <span className="text-sm text-muted-foreground">({product._count.reviews})</span>
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
                        {product.seller.isVerified && <Verified className="h-3 w-3 text-enkaji-green" />}
                    </div>
                      {product.seller.location && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
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
                  <Button 
                    size="icon" 
                    variant="outline"
                    onClick={handleAddToCart}
                    disabled={isAdding}
                  >
                    {isAdding ? (
                      <span className="h-4 w-4 animate-spin" />
                    ) : (
                      <ShoppingCart className="h-4 w-4" />
                    )}
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
    <Card className="group border border-enkaji-gold/20 bg-card rounded-xl shadow-sm hover:shadow-xl hover:border-enkaji-gold/40 hover:-translate-y-1 transition-all duration-300">
      <CardContent className="p-0">
        {/* Image area (GAIA-like) */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl">
          <Image
            src={product.images[0] || "/placeholder.png?height=300&width=300"}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.png"
            }}
          />

          {/* Category eyebrow */}
          <div className="absolute top-3 left-3">
            <span className="enkaji-eyebrow bg-enkaji-ink/70 text-enkaji-gold px-3 py-1 rounded-full backdrop-blur-sm">
              {product.category.name}
            </span>
          </div>


          {/* Favorite */}
          <div className="absolute top-3 right-3">
            <FavoriteButton
              productId={product.id}
              initialIsFavorite={product.isFavorite}
              size="sm"
              variant="secondary"
              className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity bg-enkaji-ink/50 text-enkaji-ivory rounded-full p-2 shadow-lg hover:bg-enkaji-ink/70"
            />
          </div>

          {/* Quick add overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-enkaji-ink/80 via-enkaji-ink/10 to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
            <Button
              className="w-full bg-enkaji-gold hover:bg-enkaji-gold/90 text-enkaji-ink font-semibold"
              onClick={handleAddToCart}
              disabled={isAdding}
            >
              {isAdding ? (
                <span className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-3">
          {/* Name */}
          <div>
            <h3 className="font-display font-semibold text-lg leading-snug line-clamp-1 group-hover:text-enkaji-gold transition-colors">
              {product.name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{product.description}</p>
          </div>

          {/* Price row (GAIA-ish) */}
          <div className="flex items-center justify-between">
            <div className="text-xl font-bold font-display text-enkaji-gold">{formatDualCurrency(product.price)}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {product.weight ? (
                <span className="flex items-center gap-1">
                  <Weight className="h-3 w-3" />
                  {formatWeight(product.weight)}
                </span>
              ) : null}
              {product._count.reviews > 0 ? (
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-enkaji-gold text-enkaji-gold" />
                  <span className="text-muted-foreground">({product._count.reviews})</span>
                </span>
              ) : null}
            </div>
          </div>

          {/* Footer (GAIA-like badge + MOQ line using available data) */}
          <div className="flex items-center justify-between pt-3 border-t border-enkaji-gold/10">
            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20">
              In stock
            </Badge>
            <div className="text-[11px] text-muted-foreground">
              MOQ: <span className="text-foreground/90 font-medium">1</span>
            </div>
          </div>

          {/* Seller row (keep existing) */}
          <div className="flex items-center gap-2 pt-3">
            <Avatar className="h-6 w-6">
              <AvatarImage src={product.seller.imageUrl || undefined} />
              <AvatarFallback className="text-[10px]">{sellerInitials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-xs text-foreground truncate font-medium">{sellerName}</span>
                {product.seller.isVerified && <Verified className="h-3 w-3 text-enkaji-green flex-shrink-0" />}
              </div>
            </div>
            <Button asChild size="sm" variant="outline" className="border-enkaji-gold/30 text-enkaji-gold hover:bg-enkaji-gold/10 bg-transparent px-3">
              <Link href={`/products/${product.id}`}>View</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

