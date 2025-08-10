"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/components/providers/cart-provider"
import Link from "next/link"

type CartItem = { id: string; price: number; quantity: number }

export function CartSummary() {
  const { state } = useCart() as {
    state: { items: CartItem[] }
  }

  const items = state.items || []
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const shipping = subtotal > 5000 ? 0 : 500
  const tax = Math.round(subtotal * 0.08)
  const finalTotal = subtotal + shipping + tax

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <span>Subtotal ({items.length} items)</span>
          <span>KES {subtotal.toLocaleString()}</span>
        </div>

        <div className="flex justify-between">
          <span>Shipping</span>
          <span>{shipping === 0 ? "Free" : `KES ${shipping.toLocaleString()}`}</span>
        </div>

        <div className="flex justify-between">
          <span>Tax</span>
          <span>KES {tax.toLocaleString()}</span>
        </div>

        <Separator />

        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>KES {finalTotal.toLocaleString()}</span>
        </div>

        {subtotal > 5000 && <p className="text-sm text-green-600">🎉 You qualify for free shipping!</p>}

        <Link href="/checkout" className="block">
          <Button className="w-full bg-red-800 hover:bg-red-900 text-white">Proceed to Checkout</Button>
        </Link>

        <Link href="/shop" className="block">
          <Button variant="outline" className="w-full bg-transparent">
            Continue Shopping
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
