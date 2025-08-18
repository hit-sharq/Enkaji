"use client"

import { useEffect } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { CheckoutForm } from "@/components/checkout/checkout-form"
import { OrderSummary } from "@/components/checkout/order-summary"
import { useRouter } from "next/navigation"
import { useCart } from "@/components/providers/cart-provider"

export default function CheckoutPage() {
  const { state } = useCart()
  const router = useRouter()

  useEffect(() => {
    if (!state.loading && state.items.length === 0) {
      router.push("/cart")
    }
  }, [state.loading, state.items.length, router])

  if (state.loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">Loading...</div>
        </div>
        <Footer />
      </div>
    )
  }

  if (state.items.length === 0) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="font-playfair text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <CheckoutForm />
          <OrderSummary cartItems={state.items} total={state.total} />
        </div>
      </main>
      <Footer />
    </div>
  )
}
