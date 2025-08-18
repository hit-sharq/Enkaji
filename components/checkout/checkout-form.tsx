"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { calculateShippingCost } from "@/lib/shipping"
import { useCart } from "@/components/providers/cart-provider"

export function CheckoutForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("STRIPE")
  const [shippingCountry, setShippingCountry] = useState("Kenya")
  const { toast } = useToast()
  const router = useRouter()

  const { state } = useCart()
  const { items: cartItems, total, totalWeight } = state

  const shippingCalculation = calculateShippingCost(totalWeight, shippingCountry)
  const tax = total * 0.16 // 16% VAT
  const finalTotal = total + tax + shippingCalculation.cost

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
      city: formData.get("city"),
      state: formData.get("state"),
      zipCode: formData.get("zipCode"),
      country: formData.get("country"),
    }

    const orderData = {
      items: cartItems.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
      })),
      subtotal: total,
      tax: tax,
      shipping: shippingCalculation.cost,
      total: finalTotal,
      shippingAddress,
      paymentMethod,
    }

    console.log("[v0] Cart items from context:", cartItems)
    console.log("[v0] Order data being sent:", orderData)
    console.log("[v0] Total weight:", totalWeight)

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

        if (paymentMethod === "STRIPE" && data.clientSecret) {
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

        router.push(`/orders/${data.order.id}`)
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

  if (state.loading) {
    return <div>Loading cart...</div>
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
              <Input id="city" name="city" required />
            </div>
            <div>
              <Label htmlFor="state">State/Province</Label>
              <Input id="state" name="state" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="zipCode">ZIP/Postal Code</Label>
              <Input id="zipCode" name="zipCode" required />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                name="country"
                defaultValue="Kenya"
                required
                onChange={(e) => setShippingCountry(e.target.value)}
              />
            </div>
          </div>

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
              <span className="text-sm text-gray-600">
                Shipping ({shippingCalculation.tier.name} - {shippingCalculation.zone.name})
              </span>
              <span>KSh {shippingCalculation.cost.toLocaleString()}</span>
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
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="STRIPE" id="stripe" />
              <Label htmlFor="stripe">Credit/Debit Card (Stripe)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="MPESA" id="mpesa" />
              <Label htmlFor="mpesa">M-Pesa (Kenya)</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Button type="submit" disabled={isLoading} className="w-full bg-red-800 hover:bg-red-900 text-white" size="lg">
        {isLoading ? "Processing..." : "Place Order"}
      </Button>
    </form>
  )
}
