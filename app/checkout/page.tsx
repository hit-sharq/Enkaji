
"use client"

import { useState } from "react"
import { useEffect } from "react"
import { CheckoutForm } from "@/components/checkout/checkout-form"
import { OrderSummary } from "@/components/checkout/order-summary"
import { ShippingOptions } from "@/components/checkout/shipping-options"
import { useRouter } from "next/navigation"
import { useCart } from "@/components/providers/cart-provider"

export default function CheckoutPage() {
  const { state } = useCart()
  const router = useRouter()
  
  // Shipping state
  const [shippingDestination, setShippingDestination] = useState({
    country: "",
    city: "",
    state: "",
  })
  const [selectedShippingId, setSelectedShippingId] = useState<string>("")
  const [shippingCost, setShippingCost] = useState(0)
  const [isCodEnabled, setIsCodEnabled] = useState(false)

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
    return null // Will redirect in useEffect
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
    // Reset shipping selection when destination changes
    setSelectedShippingId("")
    setShippingCost(0)
  }

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <h1 className="font-playfair text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <CheckoutForm 
              onDestinationChange={handleDestinationChange}
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
          <OrderSummary 
            cartItems={state.items} 
            total={state.total}
            shippingCost={shippingCost}
          />
        </div>
      </main>
    </div>
  )
}

