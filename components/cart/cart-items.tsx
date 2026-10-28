"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Minus, Plus, Trash2, Weight, ShoppingBag } from "lucide-react"
import { useCart } from "@/components/providers/cart-provider"
import { formatWeight } from "@/lib/shipping"
import { csrfFetch } from "@/lib/csrf-client"
import Link from "next/link"

type CartItem = {
  id: string
  name: string
  price: number
  quantity: number
  image?: string | null
  weight?: number
}

export function CartItems() {
  const cartContext = useCart()
  const state = cartContext?.state
  const dispatch = cartContext?.dispatch

  const items = state?.items || []

  const updateQuantity = (id: string, quantity: number) => {
    dispatch?.({ type: "UPDATE_QUANTITY", payload: { id, quantity } })
  }

  const removeItem = async (id: string) => {
    try {
      const response = await csrfFetch(`/api/cart/${id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        const cartResponse = await csrfFetch('/api/cart')
        if (cartResponse.ok) {
          const data = await cartResponse.json()
          const cartItems = data.items?.map((item: any) => ({
            id: item.productId,
            name: item.product?.name || "Unknown Product",
            price: Number(item.product?.price) || 0,
            quantity: item.quantity,
            image: item.product?.images?.[0] || null,
            weight: item.product?.weight ? Number(item.product.weight) : 0,
          })) || []
          dispatch({ type: "LOAD_CART", payload: cartItems })
        }
      }
    } catch (error) {
      console.error('Error removing item:', error)
    }
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 md:p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-enkaji-orange/10">
            <ShoppingBag className="h-8 w-8 text-enkaji-orange" />
          </div>
          <h2 className="font-display text-lg font-semibold text-foreground mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Browse the marketplace and add products to get started. Your cart is saved across devices.
          </p>
          <Button asChild>
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Card key={item.id} className="border border-border shadow-card transition-all duration-300 hover:shadow-card-hover">
          <CardContent className="p-5 md:p-6">
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
                <Image
                  src={item.image || "/placeholder.svg?height=80&width=80&query=cart%20item"}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-display font-semibold text-lg text-foreground line-clamp-1">{item.name}</h3>
                <p className="font-display font-bold text-enkaji-orange">KES {item.price.toLocaleString()}</p>
                {item.weight && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Weight className="w-3 h-3 text-enkaji-orange" />
                    Weight: {formatWeight(item.weight * item.quantity)}
                  </p>
                )}
              </div>

              <div className="flex items-center rounded-xl border border-border bg-card">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                  className="h-9 w-9 rounded-l-xl"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                <Button variant="ghost" size="icon" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="h-9 w-9 rounded-r-xl">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeItem(item.id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}