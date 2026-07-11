"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/components/providers/cart-provider"
import { formatDualCurrency } from "@/lib/currency"
import { formatWeight } from "@/lib/shipping"
import { calculateOrderTotals } from "@/hooks/use-order-totals"
import { detectShippingZone, getShippingOptions } from "@/lib/shipping-enhanced"
import { Weight, Package, ShoppingBag, Info } from "lucide-react"
import Link from "next/link"

export function CartSummary() {
  const cartContext = useCart()
  const state = cartContext?.state

  const items = state?.items || []
  const totalWeight = state?.totalWeight || 0
  const loading = state?.loading || false

  // Only calculate shipping estimate when cart has items
  const estimatedShipping = (items.length > 0 && !loading)
    ? (() => {
        const zone = detectShippingZone("Kenya", "Nairobi")
        const shippingOptions = getShippingOptions(zone, totalWeight, 0)
        return shippingOptions[0]?.price || 0
      })()
    : 0

  const { subtotal, tax, shipping, grandTotal } = calculateOrderTotals({
    items,
    shippingCost: estimatedShipping,
  })

  const showShipping = items.length > 0 && !loading

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display font-semibold text-foreground">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <span>Subtotal ({items.length} items)</span>
          <span>{formatDualCurrency(subtotal)}</span>
        </div>

        {showShipping ? (
          <>
            <div className="flex justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
              <Weight className="h-4 w-4 text-enkaji-gold" />
                <span>Total Weight</span>
              </div>
              <span>{formatWeight(totalWeight)}</span>
            </div>

            <div className="flex justify-between">
              <div className="flex items-center gap-1">
                <Package className="h-4 w-4 text-enkaji-gold" />
                <span>Shipping</span>
              </div>
              <span>{formatDualCurrency(shipping)}</span>
            </div>

            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Info className="h-3 w-3 text-enkaji-gold" />
              <span>Shipping estimate based on Nairobi. Final cost calculated at checkout.</span>
            </div>
          </>
        ) : (
          <div className="flex justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <ShoppingBag className="h-4 w-4 text-enkaji-gold" />
              <span>Shipping</span>
            </div>
              <span className="text-muted-foreground">Calculated at checkout</span>
          </div>
        )}

        {showShipping ? (
          <div className="flex justify-between">
            <span>Tax (16%)</span>
            <span>{formatDualCurrency(tax)}</span>
          </div>
        ) : (
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Tax</span>
              <span className="text-muted-foreground">Calculated at checkout</span>
          </div>
        )}

        <Separator />

        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>{formatDualCurrency(grandTotal)}</span>
        </div>

        {items.length > 0 && !loading ? (
          <Link href="/checkout" className="block">
            <Button className="w-full" size="lg">Proceed to Checkout</Button>
          </Link>
        ) : (
          <Button className="w-full" size="lg" disabled>
            {loading ? "Loading..." : "Cart is Empty"}
          </Button>
        )}

        <Link href="/shop" className="block">
          <Button variant="outline" className="w-full">
            Continue Shopping
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

