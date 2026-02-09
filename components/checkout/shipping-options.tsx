"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Truck, Clock, Shield, MapPin } from "lucide-react"

interface ShippingOption {
  id: string
  provider: {
    id: string
    name: string
    logo?: string
    description?: string
  }
  service: {
    id: string
    name: string
    description: string
    transitDays: { min: number; max: number }
  }
  price: number
  formattedPrice: string
  formattedDelivery: string
  estimatedDelivery: {
    min: string
    max: string
  }
  isRecommended: boolean
  codSupported: boolean
}

interface ShippingOptionsProps {
  destination: {
    country: string
    city: string
    state?: string
  }
  cartItems: Array<{
    id: string
    name: string
    price: number
    quantity: number
    image?: string
    weight?: number
  }>
  selectedShippingId?: string
  onShippingSelect: (optionId: string, price: number) => void
  onCodChange?: (isCod: boolean) => void
  isCodEnabled?: boolean
}

export function ShippingOptions({
  destination,
  cartItems,
  selectedShippingId,
  onShippingSelect,
  onCodChange,
  isCodEnabled = false,
}: ShippingOptionsProps) {
  const [options, setOptions] = useState<ShippingOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedOption, setSelectedOption] = useState<string>(selectedShippingId || "")
  const [showCod, setShowCod] = useState(isCodEnabled)
  const { toast } = useToast()

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalWeight = cartItems.reduce((sum, item) => sum + (item.weight || 0) * item.quantity, 0)

  // Fetch shipping options
  useEffect(() => {
    const fetchShippingOptions = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch("/api/shipping/calculate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items: cartItems.map(item => ({
              id: item.id,
              weight: item.weight || 0.5,
              value: item.price * item.quantity,
            })),
            destination: {
              country: destination.country,
              city: destination.city,
              state: destination.state,
            },
            cod: showCod,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to fetch shipping options")
        }

        const data = await response.json()
        
        if (data.success) {
          setOptions(data.data.shipping.options)
          
          // Auto-select recommended option
          if (data.data.shipping.recommendedId && !selectedOption) {
            const recommendedId = data.data.shipping.recommendedId
            setSelectedOption(recommendedId)
            const recommended = data.data.shipping.options.find((o: ShippingOption) => o.id === recommendedId)
            if (recommended) {
              onShippingSelect(recommendedId, recommended.price)
            }
          }
        } else {
          throw new Error(data.error || "Failed to calculate shipping")
        }
      } catch (err) {
        console.error("Shipping calculation error:", err)
        setError(err instanceof Error ? err.message : "Failed to load shipping options")
        
        // Show toast notification
        toast({
          title: "Shipping Error",
          description: "Unable to load shipping options. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (destination.country && destination.city) {
      fetchShippingOptions()
    }
  }, [destination, cartItems, showCod])

  // Handle option selection
  const handleSelect = (optionId: string) => {
    setSelectedOption(optionId)
    const option = options.find(o => o.id === optionId)
    if (option) {
      onShippingSelect(optionId, option.price)
    }
  }

  // Handle COD toggle
  const handleCodToggle = () => {
    const newCod = !showCod
    setShowCod(newCod)
    onCodChange?.(newCod)
  }

  if (!destination.country || !destination.city) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Shipping Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-gray-500">
            <p>Please enter your shipping address first</p>
            <p className="text-sm mt-1">Shipping options will appear after you provide your location</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Shipping Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-200 rounded-md"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Shipping Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-red-500">{error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Shipping Method
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* COD Toggle */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-green-600 text-sm font-bold">K</span>
            </div>
            <div>
              <p className="font-medium">Cash on Delivery</p>
              <p className="text-sm text-gray-500">Pay when you receive</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={showCod}
              onChange={handleCodToggle}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-800"></div>
          </label>
        </div>

        <Separator />

        {/* Shipping Options */}
        <RadioGroup value={selectedOption} onValueChange={handleSelect}>
          <div className="space-y-3">
            {options.map((option) => (
              <div
                key={option.id}
                className={`relative flex items-start p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedOption === option.id
                    ? "border-red-800 bg-red-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <RadioGroupItem
                  value={option.id}
                  id={option.id}
                  className="mt-1"
                />
                <Label htmlFor={option.id} className="ml-3 flex-1 cursor-pointer">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{option.service.name}</span>
                        {option.isRecommended && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{option.provider.name}</p>
                      <p className="text-xs text-gray-400 mt-1">{option.service.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{option.formattedPrice}</p>
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                        <Clock className="h-3 w-3" />
                        {option.formattedDelivery}
                      </div>
                      {option.estimatedDelivery.min !== option.estimatedDelivery.max && (
                        <p className="text-xs text-gray-400 mt-1">
                          Est: {option.estimatedDelivery.min} - {option.estimatedDelivery.max}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {option.codSupported && showCod && (
                    <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
                      <Shield className="h-3 w-3" />
                      <span>Cash on Delivery available</span>
                    </div>
                  )}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>

        {/* Summary */}
        <Separator />
        <div className="flex justify-between text-sm text-gray-600">
          <span>Total Weight</span>
          <span>{totalWeight < 1 ? `${(totalWeight * 1000).toFixed(0)}g` : `${totalWeight.toFixed(1)}kg`}</span>
        </div>
      </CardContent>
    </Card>
  )
}

