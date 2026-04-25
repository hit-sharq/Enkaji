"use client"

import { useState, useEffect } from "react"
import { CheckoutForm } from "@/components/checkout/checkout-form"
import { OrderSummary } from "@/components/checkout/order-summary"
import { ShippingOptions } from "@/components/checkout/shipping-options"
import { PromoCode } from "@/components/checkout/promo-code"
import { useRouter } from "next/navigation"
import { useCart } from "@/components/providers/cart-provider"
import { calculateOrderTotals } from "@/hooks/use-order-totals"

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
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">Loading...</div>
        </div>
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
      <main className="container mx-auto px-4 py-8">
        <h1 className="font-playfair text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

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
