"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, ShoppingCart, MapPin, Verified, Weight, Package, MessageSquare, Minus, Plus } from "lucide-react"
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
  originalPrice?: number
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
  inventory?: number
  sku?: string
  leadTime?: string
  moq?: number
}

interface ProductCardProps {
  product: Product
  viewMode?: "grid" | "list"
}

export function ProductCard({ product, viewMode = "grid" }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [qty, setQty] = useState(product.moq ?? 1)
  const { toast } = useToast()
  const cartContext = useCart()
  const dispatch = cartContext?.dispatch

  const sellerName = product.seller.businessName || `${product.seller.firstName} ${product.seller.lastName}`
  const sellerInitials = `${product.seller.firstName[0]}${product.seller.lastName[0]}`
  const moq = product.moq ?? 1
  const inventory = product.inventory ?? 0
  const inStock = inventory > 0
  const tierPrice = Math.round(product.price * 0.92)

  const handleAddToCart = async (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    if (isAdding) return
    setIsAdding(true)
    try {
      const response = await csrfFetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: qty }),
      })
      if (response.ok) {
        dispatch?.({
          type: "ADD_ITEM",
          payload: {
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: qty,
            image: product.images[0] || undefined,
            weight: product.weight,
          },
        })
        toast({ 
          title: "Added to order", 
          description: `${qty} × ${product.name} added.`,
          action: (
            <button
              onClick={() => (window.location.href = "/cart")}
              className="text-sm font-semibold text-enkaji-orange underline"
            >
              View Cart
            </button>
          ),
        })
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to add to cart")
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Please sign in to add items.", variant: "destructive" })
    } finally {
      setIsAdding(false)
    }
  }

  if (viewMode === "list") {
    return (
      <Card className="group overflow-hidden rounded-xl border border-border/60 bg-card shadow-card transition-all duration-200 hover:border-enkaji-orange/30 hover:shadow-card-hover">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            <div className="relative md:w-44 aspect-square md:aspect-[4/3] overflow-hidden bg-muted">
              <Image
                src={product.images[0] || "/placeholder.png?height=200&width=300"}
                alt={product.name}
                fill
                className="object-cover"
                onError={(e) => { e.currentTarget.src = "/placeholder.png" }}
              />
              <div className="absolute left-2 top-2">
                <Badge variant="secondary" className="rounded-md text-[10px] font-semibold uppercase tracking-wide">
                  {product.category.name}
                </Badge>
              </div>
            </div>

            <div className="flex-1 p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link href={`/products/${product.id}`} className="block">
                    <h3 className="font-display text-base font-semibold text-foreground leading-snug line-clamp-1 group-hover:text-enkaji-orange transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  {product.sku && (
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">SKU: {product.sku}</p>
                  )}
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{product.description}</p>
                </div>
                <FavoriteButton productId={product.id} initialIsFavorite={product.isFavorite} size="sm" variant="ghost" />
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Package className="h-3.5 w-3.5" />
                  MOQ {moq}
                </span>
                {product.leadTime && (
                  <span className="flex items-center gap-1">
                    <Weight className="h-3.5 w-3.5" />
                    Lead {product.leadTime}
                  </span>
                )}
                {product.weight && (
                  <span>{formatWeight(product.weight)} / unit</span>
                )}
                {product._count.reviews > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-enkaji-orange text-enkaji-orange" />
                    {product.avgRating?.toFixed(1) ?? "—"} ({product._count.reviews})
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 pt-2 border-t border-border">
                <div>
                  <div className="font-display text-lg font-bold text-enkaji-orange leading-none">
                    {formatDualCurrency(product.price)}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1">
                    {moq > 1 ? `${moq}+ units: ${formatDualCurrency(tierPrice)}` : "per unit"}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center rounded-lg border border-border bg-card">
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); setQty((q) => Math.max(moq, q - 1)) }}
                      className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{qty}</span>
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); setQty((q) => q + 1) }}
                      className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <Button size="sm" onClick={handleAddToCart} disabled={isAdding || !inStock} className="h-8">
                    {isAdding ? "Adding…" : "Add to Order"}
                  </Button>
                  <Button asChild size="sm" variant="outline" className="h-8">
                    <Link href={`/products/${product.id}`}>Details</Link>
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={product.seller.imageUrl || undefined} />
                  <AvatarFallback className="text-[9px]">{sellerInitials}</AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium text-foreground truncate">{sellerName}</span>
                {product.seller.isVerified && <Verified className="h-3 w-3 flex-shrink-0 text-enkaji-orange" />}
                {product.seller.location && (
                  <span className="text-xs text-muted-foreground flex items-center gap-0.5 ml-auto">
                    <MapPin className="h-3 w-3" />
                    {product.seller.location}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="group flex h-full flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-card transition-all duration-200 hover:border-enkaji-orange/30 hover:shadow-card-hover">
      <CardContent className="flex h-full flex-col p-0">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <Image
            src={product.images[0] || "/placeholder.png?height=300&width=300"}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => { e.currentTarget.src = "/placeholder.png" }}
          />
          <div className="absolute left-2 top-2 flex gap-1.5">
            <Badge variant="secondary" className="rounded-md text-[10px] font-semibold uppercase tracking-wide">
              {product.category.name}
            </Badge>
            {product.originalPrice && product.originalPrice > product.price && (
              <Badge className="rounded-md text-[10px] font-semibold uppercase tracking-wide bg-enkaji-orange/90 text-white">
                -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
              </Badge>
            )}
            {inStock && inventory > 0 && inventory <= 5 && (
              <Badge className="rounded-md text-[10px] font-semibold uppercase tracking-wide bg-enkaji-orange/80 text-white">
                Low Stock
              </Badge>
            )}
            {!inStock && (
              <Badge variant="destructive" className="rounded-md text-[10px] font-semibold uppercase tracking-wide">
                Out of stock
              </Badge>
            )}
          </div>
          <div className="absolute right-2 top-2">
            <FavoriteButton
              productId={product.id}
              initialIsFavorite={product.isFavorite}
              size="sm"
              variant="ghost"
              className="h-7 w-7 rounded-md bg-card/80 p-0 backdrop-blur-sm"
            />
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-3 p-4">
          {/* Name + SKU */}
          <div>
            <Link href={`/products/${product.id}`} className="block">
              <h3 className="font-display text-sm font-semibold leading-snug text-foreground line-clamp-2 group-hover:text-enkaji-orange transition-colors">
                {product.name}
              </h3>
            </Link>
            {product.sku && (
              <p className="text-[11px] text-muted-foreground font-mono mt-0.5">SKU {product.sku}</p>
            )}
          </div>

          {/* Specs row */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Package className="h-3 w-3" />
              MOQ {moq}
            </span>
            {product.leadTime && (
              <span>Lead {product.leadTime}</span>
            )}
            {product.weight && (
              <span>{formatWeight(product.weight)}/unit</span>
            )}
            {product._count.reviews > 0 && (
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-enkaji-orange text-enkaji-orange" />
                {product.avgRating?.toFixed(1) ?? "—"}
              </span>
            )}
          </div>

          {/* Price */}
          <div className="mt-auto pt-2 border-t border-border">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="font-display text-lg font-bold text-enkaji-orange leading-none">
                  {formatDualCurrency(product.price)}
                </span>
                <span className="text-[11px] text-muted-foreground ml-1">/ unit</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <div className="text-[11px] text-muted-foreground line-through mt-0.5">
                    {formatDualCurrency(product.originalPrice)}
                  </div>
                )}
              </div>
              {moq > 1 && (
                <span className="text-[11px] text-muted-foreground">
                  {moq}+ : {formatDualCurrency(tierPrice)}
                </span>
              )}
            </div>
          </div>

          {/* Supplier */}
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={product.seller.imageUrl || undefined} />
              <AvatarFallback className="text-[9px]">{sellerInitials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <span className="truncate text-xs font-medium text-foreground">{sellerName}</span>
                {product.seller.isVerified && <Verified className="h-3 w-3 flex-shrink-0 text-enkaji-orange" />}
              </div>
              {product.seller.location && (
                <p className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                  <MapPin className="h-2.5 w-2.5" />
                  {product.seller.location}
                </p>
              )}
            </div>
          </div>

          {/* Quantity + actions */}
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-border bg-card">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(moq, q - 1))}
                className="h-8 w-7 flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-7 text-center text-sm font-medium">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => q + 1)}
                className="h-8 w-7 flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <Button size="sm" onClick={handleAddToCart} disabled={isAdding || !inStock} className="flex-1 h-8 text-xs">
              {isAdding ? "Adding…" : "Add to Order"}
            </Button>
          </div>
          <Button asChild size="sm" variant="outline" className="h-8 text-xs">
            <Link href={`/products/${product.id}`}>
              <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
              Request Quote
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
