"use client"

import { useState } from "react"
import { useEffect } from "react"
import { CheckoutForm } from "@/components/checkout/checkout-form"
import { OrderSummary } from "@/components/checkout/order-summary"
import { ShippingOptions } from "@/components/checkout/shipping-options"
import { LumynDeliveryOption } from "@/components/checkout/lumyn-delivery-option"
import { useRouter } from "next/navigation"
import { useCart } from "@/components/providers/cart-provider"

const LUMYN_OPTION_ID = 'lumyn-express'

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
  const [useLumyn, setUseLumyn] = useState(false)

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
    setUseLumyn(false)
    setSelectedShippingId(optionId)
    setShippingCost(price)
  }

  const handleLumynSelect = () => {
    setUseLumyn(true)
    setSelectedShippingId(LUMYN_OPTION_ID)
    setShippingCost(150)
  }

  const handleDestinationChange = (destination: { country: string; city: string; state?: string }) => {
    setShippingDestination({
      country: destination.country,
      city: destination.city,
      state: destination.state || "",
    })
    setSelectedShippingId("")
    setShippingCost(0)
    setUseLumyn(false)
  }

  const cartTotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const isNairobi = shippingDestination.city.toLowerCase().includes('nairobi') ||
    shippingDestination.country === 'KE' || shippingDestination.country === 'Kenya' ||
    !shippingDestination.city

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <h1 className="font-playfair text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <CheckoutForm
              onDestinationChange={handleDestinationChange}
              shippingCost={shippingCost}
            />

            {isNairobi && (
              <div className="space-y-3">
                <h2 className="font-semibold text-gray-800">Express Delivery Option</h2>
                <LumynDeliveryOption
                  selected={useLumyn}
                  onSelect={handleLumynSelect}
                  cartTotal={cartTotal}
                />
              </div>
            )}

            {!useLumyn && (
              <ShippingOptions
                destination={shippingDestination}
                cartItems={state.items}
                selectedShippingId={selectedShippingId}
                onShippingSelect={handleShippingSelect}
                onCodChange={setIsCodEnabled}
                isCodEnabled={isCodEnabled}
              />
            )}
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
