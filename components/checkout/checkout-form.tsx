
"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useCart } from "@/components/providers/cart-provider"
import { PesapalPaymentForm } from "./pesapal-payment-form"
import { CreditCard, Smartphone, ShieldCheck } from "lucide-react"

interface CheckoutFormProps {
  onDestinationChange?: (destination: { country: string; city: string; state: string }) => void
  shippingCost?: number
}

export function CheckoutForm({ onDestinationChange, shippingCost = 0 }: CheckoutFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("STRIPE")
  const [shippingCountry, setShippingCountry] = useState("Kenya")
  const [shippingCity, setShippingCity] = useState("")
  const [shippingState, setShippingState] = useState("")
  const [showPesapalForm, setShowPesapalForm] = useState(false)
  const [createdOrder, setCreatedOrder] = useState<any>(null)
  const { toast } = useToast()
  const router = useRouter()

  const { state } = useCart()
  const { items: cartItems, total } = state

  const tax = total * 0.16 // 16% VAT
  const finalTotal = total + tax + shippingCost

  // Handle destination changes
  const handleCountryChange = (value: string) => {
    setShippingCountry(value)
    notifyDestinationChange(value, shippingCity, shippingState)
  }

  const handleCityChange = (value: string) => {
    setShippingCity(value)
    notifyDestinationChange(shippingCountry, value, shippingState)
  }

  const handleStateChange = (value: string) => {
    setShippingState(value)
    notifyDestinationChange(shippingCountry, shippingCity, value)
  }

  const notifyDestinationChange = (country: string, city: string, state: string) => {
    onDestinationChange?.({ country, city, state })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const shippingAddress = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      address: formData.get("address"),
      city: shippingCity || formData.get("city"),
      state: shippingState || formData.get("state"),
      zipCode: formData.get("zipCode"),
      country: shippingCountry,
    }

    const orderData = {
      items: cartItems.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
      })),
      subtotal: total,
      tax: tax,
      shipping: shippingCost,
      total: finalTotal,
      shippingAddress,
      paymentMethod,
    }

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      if (response.ok) {
        const data = await response.json()
        setCreatedOrder(data)

        // Handle different payment methods
        if (paymentMethod === "PESAPAL") {
          setShowPesapalForm(true)
          setIsLoading(false)
          return
        } else if (paymentMethod === "STRIPE" && data.clientSecret) {
          toast({
            title: "Order placed successfully!",
            description: "You will receive a confirmation email shortly.",
          })
        } else if (paymentMethod === "MPESA") {
          toast({
            title: "Order placed successfully!",
            description: "Please complete payment via M-Pesa to confirm your order.",
          })
        }

        router.push(`/orders/${data.id}`)
      } else {
        throw new Error("Failed to place order")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePesapalSuccess = (paymentData: any) => {
    toast({
      title: "Payment Initiated!",
      description: "Please complete payment on Pesapal.",
    })
    router.push(`/orders/${createdOrder?.id || paymentData.orderId}?payment=pending`)
  }

  const handlePesapalError = (error: string) => {
    toast({
      title: "Payment Error",
      description: error,
      variant: "destructive",
    })
    setShowPesapalForm(false)
  }

  if (state.loading) {
    return <div>Loading cart...</div>
  }

  // Show Pesapal payment form after order is created
  if (showPesapalForm && createdOrder) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-green-600" />
              Complete Payment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PesapalPaymentForm
              orderId={createdOrder.id}
              amount={Number(finalTotal)}
              onSuccess={handlePesapalSuccess}
              onError={handlePesapalError}
              onCancel={() => setShowPesapalForm(false)}
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Shipping Information */}
      <Card>
        <CardHeader>
          <CardTitle>Shipping Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" name="firstName" required />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" name="lastName" required />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" name="phone" type="tel" required />
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input 
                id="city" 
                name="city" 
                required 
                placeholder="e.g., Nairobi"
                value={shippingCity}
                onChange={(e) => handleCityChange(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="state">State/Province</Label>
              <Input 
                id="state" 
                name="state" 
                required 
                value={shippingState}
                onChange={(e) => handleStateChange(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="zipCode">ZIP/Postal Code</Label>
              <Input id="zipCode" name="zipCode" />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                name="country"
                defaultValue="Kenya"
                required
                value={shippingCountry}
                onChange={(e) => handleCountryChange(e.target.value)}
              />
            </div>
          </div>

          {/* Order Summary in Form */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Subtotal</span>
              <span>KSh {total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tax (16%)</span>
              <span>KSh {tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Shipping</span>
              <span>KSh {shippingCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center mt-2 pt-2 border-t">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-lg">KSh {finalTotal.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={paymentMethod} onValueChange={setPaymentMethod}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="STRIPE" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Card
              </TabsTrigger>
              <TabsTrigger value="PESAPAL" className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Pesapal
              </TabsTrigger>
              <TabsTrigger value="MPESA" className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                M-Pesa
              </TabsTrigger>
            </TabsList>

            <TabsContent value="STRIPE" className="mt-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  Pay securely with your credit or debit card via Stripe.
                </p>
                <div className="flex gap-2 mt-2">
                  <img src="https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/us.svg" alt="Visa" className="h-6" />
                  <img src="https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/eu.svg" alt="Mastercard" className="h-6" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="PESAPAL" className="mt-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">
                  Pay securely with Pesapal - supports multiple payment methods:
                </p>
                <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                  <li>Credit/Debit Cards (Visa, Mastercard)</li>
                  <li>M-Pesa mobile money</li>
                  <li>Airtel Money</li>
                  <li>Bank Transfer (Equity, KCB)</li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="MPESA" className="mt-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  Pay using M-Pesa mobile money. You will receive an STK push notification on your phone.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Button 
        type="submit" 
        disabled={isLoading} 
        className="w-full bg-red-800 hover:bg-red-900 text-white" 
        size="lg"
      >
        {isLoading ? "Processing..." : `Pay KSh ${finalTotal.toLocaleString()}`}
      </Button>
    </form>
  )
}

