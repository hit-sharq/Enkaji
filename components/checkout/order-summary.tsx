
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { formatDualCurrency } from "@/lib/currency"
import { formatWeight } from "@/lib/shipping"
import { calculateOrderTotals } from "@/hooks/use-order-totals"
import { Weight, Package, Shield } from "lucide-react"

interface OrderSummaryProps {
  cartItems: Array<{
    id: string
    name: string
    price: number
    quantity: number
    image?: string
    weight?: number
  }>
  total: number
  shippingCost?: number
  discountAmount?: number
  couponCode?: string
  insurance?: number
  onInsuranceChange?: (enabled: boolean) => void
}

export function OrderSummary({ cartItems, total, shippingCost = 0, discountAmount = 0, couponCode, insurance = 0, onInsuranceChange }: OrderSummaryProps) {
  const totalWeight = cartItems.reduce((sum, item) => sum + (item.weight || 0) * item.quantity, 0)

  const { tax, insurance: insuranceFee, grandTotal } = calculateOrderTotals({
    items: cartItems,
    shippingCost,
    discountAmount,
    insuranceEnabled: onInsuranceChange ? insurance === 1 : insurance > 0,
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cart Items */}
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-200">
                <Image
                  src={item.image || "/placeholder.svg?height=64&width=64"}
                  alt={item.name}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Qty: {item.quantity}</span>
                  {item.weight && (
                    <div className="flex items-center gap-1">
                      <Weight className="h-3 w-3" />
                      <span>{formatWeight(item.weight * item.quantity)}</span>
                    </div>
                  )}
                </div>
              </div>
              <p className="font-medium">{formatDualCurrency(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>

        <Separator />

        {/* Pricing Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatDualCurrency(total)}</span>
          </div>

          <div className="flex justify-between text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Weight className="h-4 w-4" />
              <span>Total Weight</span>
            </div>
            <span>{formatWeight(totalWeight)}</span>
          </div>

          <div className="flex justify-between">
            <div className="flex items-center gap-1">
              <Package className="h-4 w-4" />
              <span>Shipping</span>
            </div>
            <span>{formatDualCurrency(shippingCost)}</span>
          </div>

          <div className="flex justify-between">
            <span>Tax (16%)</span>
            <span>{formatDualCurrency(tax)}</span>
          </div>

          {onInsuranceChange && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="insurance"
                  checked={insurance === 1}
                  onCheckedChange={(checked) => onInsuranceChange(checked === true)}
                />
                <Label htmlFor="insurance" className="flex items-center gap-1 cursor-pointer">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span>Shipping Protection</span>
                </Label>
              </div>
              <span className="font-medium text-blue-700">{formatDualCurrency(insuranceFee)}</span>
            </div>
          )}

          {discountAmount > 0 && couponCode && (
            <div className="flex justify-between text-green-600 font-medium">
              <span>Discount ({couponCode})</span>
              <span>− {formatDualCurrency(discountAmount)}</span>
            </div>
          )}

          <Separator />

          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>{formatDualCurrency(grandTotal)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

