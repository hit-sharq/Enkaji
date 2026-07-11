"use client"

import { useState, useEffect } from "react"
import { CheckoutForm } from "@/components/checkout/checkout-form"
import { OrderSummary } from "@/components/checkout/order-summary"
import { ShippingOptions } from "@/components/checkout/shipping-options"
import { PromoCode } from "@/components/checkout/promo-code"
import { useRouter } from "next/navigation"
import { useCart } from "@/components/providers/cart-provider"
import { calculateOrderTotals } from "@/hooks/use-order-totals"
import { Card, CardContent } from "@/components/ui/card"

export default function CheckoutPage() {
  const { state } = useCart()
  const router = useRouter()

  const [shippingDestination, setShippingDestination] = useState({
    country: "",
    city: "",
    state: "",
  })
  const [selectedShippingId, setSelectedShippingId] = useState<string>("")
  const [shippingCost, setShippingCost] = useState(0)
  const [isCodEnabled, setIsCodEnabled] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState<string>("")
  const [discountAmount, setDiscountAmount] = useState(0)
  const [addInsurance, setAddInsurance] = useState(false)

  useEffect(() => {
    if (!state.loading && state.items.length === 0) {
      router.push("/cart")
    }
  }, [state.loading, state.items.length, router])

  if (state.loading) {
    return (
      <div className="min-h-screen">
        <main className="container mx-auto px-4 py-10 md:py-16">
          <p className="enkaji-eyebrow mb-3">Secure Purchase</p>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-10">Checkout</h1>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              {[1, 2].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="h-4 bg-muted rounded w-1/3 animate-pulse"></div>
                      <div className="h-10 bg-muted rounded-md animate-pulse"></div>
                      <div className="h-10 bg-muted rounded-md animate-pulse"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="space-y-4">
              <div className="animate-pulse">
                <div className="h-40 bg-muted rounded-xl"></div>
              </div>
              <div className="animate-pulse">
                <div className="h-80 bg-muted rounded-xl"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (state.items.length === 0) {
    return null
  }

  const handleShippingSelect = (optionId: string, price: number) => {
    setSelectedShippingId(optionId)
    setShippingCost(price)
  }

  const handleDestinationChange = (destination: { country: string; city: string; state?: string }) => {
    setShippingDestination({
      country: destination.country,
      city: destination.city,
      state: destination.state || "",
    })
    setSelectedShippingId("")
    setShippingCost(0)
  }

  // Single source of truth for order totals
  const { subtotal: cartTotal, grandTotal } = calculateOrderTotals({
    items: state.items,
    shippingCost,
    discountAmount,
    insuranceEnabled: addInsurance,
  })

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-10 md:py-16">
        <p className="enkaji-eyebrow mb-3">Secure Purchase</p>
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-10">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <CheckoutForm
              onDestinationChange={handleDestinationChange}
              shippingCost={shippingCost}
              discountAmount={discountAmount}
              insuranceEnabled={addInsurance}
            />

            <ShippingOptions
              destination={shippingDestination}
              cartItems={state.items}
              selectedShippingId={selectedShippingId}
              onShippingSelect={handleShippingSelect}
              onCodChange={setIsCodEnabled}
              isCodEnabled={isCodEnabled}
            />
          </div>
          <div className="space-y-4">
            <PromoCode
              orderTotal={cartTotal}
              appliedCode={appliedCoupon}
              discountAmount={discountAmount}
              onDiscount={(code, amount) => { setAppliedCoupon(code); setDiscountAmount(amount) }}
              onRemove={() => { setAppliedCoupon(""); setDiscountAmount(0) }}
            />
            <OrderSummary
              cartItems={state.items}
              total={state.total}
              shippingCost={shippingCost}
              discountAmount={discountAmount}
              couponCode={appliedCoupon}
              insurance={addInsurance ? 1 : 0}
              onInsuranceChange={setAddInsurance}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
