"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Package, Calculator, MessageSquare } from "lucide-react"

interface BulkOrderFormProps {
  product: {
    id: string
    name: string
    price: number
    stock: number
    artisan: {
      firstName: string | null
      lastName: string | null
    }
  }
}

export function BulkOrderForm({ product }: BulkOrderFormProps) {
  const [quantity, setQuantity] = useState(100)
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const calculateBulkPrice = (qty: number) => {
    let discount = 0
    if (qty >= 1000)
      discount = 0.15 // 15% discount for 1000+
    else if (qty >= 500)
      discount = 0.1 // 10% discount for 500+
    else if (qty >= 100) discount = 0.05 // 5% discount for 100+

    return product.price * (1 - discount)
  }

  const totalPrice = quantity * calculateBulkPrice(quantity)
  const savings = quantity * (product.price - calculateBulkPrice(quantity))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/bulk-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          quantity,
          message,
          unitPrice: calculateBulkPrice(quantity),
          totalPrice,
        }),
      })

      if (response.ok) {
        toast({
          title: "Bulk order request sent!",
          description: "The artisan will contact you within 24 hours with a detailed quote.",
        })
        setMessage("")
      } else {
        throw new Error("Failed to submit bulk order")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit bulk order request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Bulk Order Request
        </CardTitle>
        <p className="text-sm text-gray-600">Get better prices for larger quantities. Minimum order: 100 pieces</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="quantity">Quantity (minimum 100)</Label>
            <Input
              id="quantity"
              type="number"
              min="100"
              max={product.stock}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="mt-1"
            />
          </div>

          {/* Price Breakdown */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="w-4 h-4" />
              <span className="font-medium">Price Breakdown</span>
            </div>

            <div className="flex justify-between text-sm">
              <span>Regular price per unit:</span>
              <span>${product.price.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span>Bulk price per unit:</span>
              <span className="text-green-600 font-medium">${calculateBulkPrice(quantity).toFixed(2)}</span>
            </div>

            {savings > 0 && (
              <div className="flex justify-between text-sm">
                <span>Total savings:</span>
                <span className="text-green-600 font-medium">${savings.toFixed(2)}</span>
              </div>
            )}

            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-medium">
                <span>Total price:</span>
                <span className="text-lg">${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Volume Discounts Info */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>• 100-499 pieces: 5% discount</p>
            <p>• 500-999 pieces: 10% discount</p>
            <p>• 1000+ pieces: 15% discount</p>
          </div>

          <div>
            <Label htmlFor="message">Additional Requirements (Optional)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Specify any customization, packaging, or delivery requirements..."
              className="mt-1"
              rows={3}
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || quantity < 100}
            className="w-full bg-orange-600 hover:bg-orange-700"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            {isSubmitting ? "Sending Request..." : "Request Bulk Quote"}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            The artisan will contact you within 24 hours with a detailed quote and delivery timeline.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
