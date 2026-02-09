
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/components/providers/cart-provider"
import { formatDualCurrency } from "@/lib/currency"
import { calculateShippingCost, formatWeight } from "@/lib/shipping"
import { Weight, Package, ShoppingBag } from "lucide-react"
import Link from "next/link"

type CartItem = { id: string; price: number; quantity: number; weight?: number }

export function CartSummary() {
  const cartContext = useCart()
  const state = cartContext?.state
  
  const items = state?.items || []
  const totalWeight = state?.totalWeight || 0
  const loading = state?.loading || false

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  
  // Only calculate shipping when cart has items
  const showShipping = items.length > 0 && !loading
  const { cost: shipping, tier } = showShipping 
    ? calculateShippingCost(totalWeight)
    : { cost: 0, tier: { name: "", cost: 0 } }
    
  const tax = subtotal * 0.16 // 16% VAT for Kenya
  const finalTotal = subtotal + shipping + tax

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <span>Subtotal ({items.length} items)</span>
          <span>{formatDualCurrency(subtotal)}</span>
        </div>

        {showShipping ? (
          <>
            <div className="flex justify-between text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Weight className="h-4 w-4" />
                <span>Total Weight</span>
              </div>
              <span>{formatWeight(totalWeight)}</span>
            </div>

            <div className="flex justify-between">
              <div className="flex items-center gap-1">
                <Package className="h-4 w-4" />
                <span>Shipping ({tier.name})</span>
              </div>
              <span>{formatDualCurrency(shipping)}</span>
            </div>
          </>
        ) : (
          <div className="flex justify-between text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <ShoppingBag className="h-4 w-4" />
              <span>Shipping</span>
            </div>
            <span className="text-gray-400">Calculated at checkout</span>
          </div>
        )}

        {showShipping ? (
          <div className="flex justify-between">
            <span>Tax (16%)</span>
            <span>{formatDualCurrency(tax)}</span>
          </div>
        ) : (
          <div className="flex justify-between text-sm text-gray-600">
            <span>Tax</span>
            <span className="text-gray-400">Calculated at checkout</span>
          </div>
        )}

        <Separator />

        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>{formatDualCurrency(finalTotal)}</span>
        </div>

        {items.length > 0 && !loading ? (
          <Link href="/checkout" className="block">
            <Button className="w-full bg-red-800 hover:bg-red-900 text-white">Proceed to Checkout</Button>
          </Link>
        ) : (
          <Button className="w-full bg-gray-300 cursor-not-allowed" disabled>
            {loading ? "Loading..." : "Cart is Empty"}
          </Button>
        )}

        <Link href="/shop" className="block">
          <Button variant="outline" className="w-full bg-transparent">
            Continue Shopping
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

