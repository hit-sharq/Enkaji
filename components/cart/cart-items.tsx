"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Minus, Plus, Trash2, Weight } from "lucide-react"
import { useCart } from "@/components/providers/cart-provider"
import { formatWeight } from "@/lib/shipping"

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

  const removeItem = (id: string) => {
    dispatch?.({ type: "REMOVE_ITEM", payload: id })
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500 text-lg">Your cart is empty</p>
          <Button className="mt-4 bg-red-800 hover:bg-red-900">Continue Shopping</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Card key={item.id}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Image
                src={item.image || "/placeholder.svg?height=80&width=80&query=cart%20item"}
                alt={item.name}
                width={80}
                height={80}
                className="rounded-md object-cover"
              />

              <div className="flex-1">
                <h3 className="font-semibold text-lg">{item.name}</h3>
                <p className="text-red-800 font-bold">KES {item.price.toLocaleString()}</p>
                {item.weight && (
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Weight className="w-3 h-3" />
                    Weight: {formatWeight(item.weight * item.quantity)}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-8 text-center">{item.quantity}</span>
                <Button variant="outline" size="sm" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeItem(item.id)}
                className="text-red-600 hover:text-red-800"
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
