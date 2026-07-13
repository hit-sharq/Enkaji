"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Minus, Plus, Trash2, Weight } from "lucide-react"
import { useCart } from "@/components/providers/cart-provider"
import { formatWeight } from "@/lib/shipping"
import { csrfFetch } from "@/lib/csrf-client"

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
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground text-lg">Your cart is empty</p>
          <Button className="mt-4">Continue Shopping</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Card key={item.id} className="border border-border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 rounded-xl">
          <CardContent className="p-5 md:p-6">
            <div className="flex items-center gap-4">
              <Image
                src={item.image || "/placeholder.svg?height=80&width=80&query=cart%20item"}
                alt={item.name}
                width={80}
                height={80}
                className="rounded-lg object-cover"
              />

              <div className="flex-1 min-w-0">
                <h3 className="font-display font-semibold text-lg text-foreground line-clamp-1">{item.name}</h3>
                <p className="text-enkaji-gold font-bold">KES {item.price.toLocaleString()}</p>
                {item.weight && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Weight className="w-3 h-3 text-enkaji-gold" />
                    Weight: {formatWeight(item.weight * item.quantity)}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                <Button variant="outline" size="icon" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
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