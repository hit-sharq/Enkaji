
"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useCart } from "@/components/providers/cart-provider"
import { calculateOrderTotals } from "@/hooks/use-order-totals"
import { ShieldCheck } from "lucide-react"

interface CheckoutFormProps {
  onDestinationChange?: (destination: { country: string; city: string; state: string }) => void
  shippingCost?: number
  discountAmount?: number
  insuranceEnabled?: boolean
}

export function CheckoutForm({ onDestinationChange, shippingCost = 0, discountAmount = 0, insuranceEnabled = false }: CheckoutFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [shippingCountry, setShippingCountry] = useState("Kenya")
  const [shippingCity, setShippingCity] = useState("")
  const [shippingState, setShippingState] = useState("")
  const [shippingAddressLine, setShippingAddressLine] = useState("")
  const [shippingZipCode, setShippingZipCode] = useState("")
  const { toast } = useToast()
  const router = useRouter()

  const { state } = useCart()
  const { items: cartItems } = state

  const { tax, grandTotal } = calculateOrderTotals({
    items: cartItems,
    shippingCost,
    discountAmount,
    insuranceEnabled,
  })

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

  const handleAddressChange = (value: string) => {
    setShippingAddressLine(value)
  }

  const handleZipChange = (value: string) => {
    setShippingZipCode(value)
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

    const checkoutData = {
      items: cartItems.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
      })),
      shippingAddress,
      selectedShippingOption: null, // Can be made selectable
      paymentMethod: "PESAPAL",
    }

    try {
      // Initiate payment WITHOUT creating order
      const response = await fetch("/api/checkout/initiate-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(checkoutData),
      })

      if (response.ok) {
        const data = await response.json()
        
        // Store checkout data in session storage for later use
        sessionStorage.setItem('checkoutData', JSON.stringify(data.checkoutData))
        
        // Redirect to Pesapal payment page
        window.location.href = data.redirectUrl
        return
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to initiate payment")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to initiate payment. Please try again."
      toast({
        title: "Payment Error",
        description: errorMessage,
        variant: "destructive",
      })
      console.error("Payment error:", error)
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
            <Input 
              id="address" 
              name="address" 
              required 
              value={shippingAddressLine}
              onChange={(e) => handleAddressChange(e.target.value)}
              placeholder="Street address"
            />
          </div>

          <div className="space-y-4">
            <Button 
              type="button" 
              variant="outline" 
              disabled={isLocating}
              onClick={() => {
                if (!navigator.geolocation) {
                  toast({
                    title: "Location Not Supported",
                    description: "Your browser does not support geolocation. Please enter your address manually.",
                    variant: "destructive",
                  })
                  return
                }

                setIsLocating(true)
                navigator.geolocation.getCurrentPosition(
                  async (position) => {
                    try {
                      const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&addressdetails=1`,
                        { headers: { 'Accept-Language': 'en' } }
                      )
                      if (!response.ok) {
                        throw new Error(`Geocoding failed: ${response.status}`)
                      }
                      const data: any = await response.json()

                      if (data.address) {
                        const address = data.address

                        // Extract street address
                        const street = address.road || address.pedestrian || address.footway || address.living_street || ''
                        const addressLine1 = street || data.display_name?.split(',')[0] || ''

                        // Extract city/town
                        const city = address.city || address.town || address.municipality || address.village || ''

                        // Extract state/county
                        const state = address.state || address.county || address.province || ''

                        // Extract postal code
                        const postcode = address.postcode || ''

                        // Extract country
                        const country = address.country || 'Kenya'

                        // Update all React state fields
                        setShippingAddressLine(addressLine1)
                        setShippingCity(city)
                        setShippingState(state)
                        setShippingZipCode(postcode)
                        if (country && country !== shippingCountry) {
                          setShippingCountry(country)
                        }

                        // Notify parent of destination change (use latest country)
                        notifyDestinationChange(country || shippingCountry, city, state)

                        toast({
                          title: "Location Set",
                          description: `Address: ${addressLine1}, ${city}`,
                        })
                      } else {
                        toast({
                          title: "Location Found",
                          description: data.display_name || "Location details not available",
                        })
                      }
                    } catch (err) {
                      console.error('Geocoding error:', err)
                      toast({
                        title: "Location Error",
                        description: "Could not reverse geocode location. Please enter manually.",
                        variant: "destructive",
                      })
                    } finally {
                      setIsLocating(false)
                    }
                  },
                  (err) => {
                    setIsLocating(false)
                    let message = "Please enable location access in your browser settings."
                    if (err.code === 1) message = "Location permission was denied. Please enable it in your browser settings."
                    if (err.code === 2) message = "Location unavailable. Please check your device settings."
                    if (err.code === 3) message = "Location request timed out. Please try again."
                    toast({
                      title: "Location Error",
                      description: message,
                      variant: "destructive",
                    })
                  },
                  { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
                )
              }}
              className="w-full"
            >
              {isLocating ? "📍 Getting Location..." : "📍 Use Current Location"}
            </Button>
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
              <Input 
                id="zipCode" 
                name="zipCode" 
                value={shippingZipCode}
                onChange={(e) => handleZipChange(e.target.value)}
                placeholder="00100"
              />
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
              <span>KSh {state.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tax (16%)</span>
              <span>KSh {tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Shipping</span>
              <span>KSh {shippingCost.toLocaleString()}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between items-center text-green-600">
                <span className="text-sm">Discount</span>
                <span>− KSh {discountAmount.toLocaleString()}</span>
              </div>
            )}
            {insuranceEnabled && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Shipping Protection</span>
                <span>KSh {Math.max(100, state.total * 0.02).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between items-center mt-2 pt-2 border-t">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-lg">KSh {grandTotal.toLocaleString()}</span>
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
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="h-5 w-5 text-green-600" />
              <span className="font-medium">Pesapal</span>
            </div>
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
        </CardContent>
      </Card>

      <Button 
        type="submit" 
        disabled={isLoading} 
        className="w-full bg-red-800 hover:bg-red-900 text-white" 
        size="lg"
      >
        {isLoading ? "Processing..." : `Pay KSh ${grandTotal.toLocaleString()}`}
      </Button>
    </form>
  )
}

