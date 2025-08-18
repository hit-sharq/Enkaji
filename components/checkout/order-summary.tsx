import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatDualCurrency } from "@/lib/currency"

interface OrderSummaryProps {
  cartItems: Array<{
    id: string
    quantity: number
    product: {
      id: string
      name: string
      price: number
      images: string[]
    }
  }>
  total: number
}

export function OrderSummary({ cartItems, total }: OrderSummaryProps) {
  const shipping = 500
  const tax = total * 0.08
  const finalTotal = total + shipping + tax

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
                  src={item.product.images[0] || "/placeholder.svg?height=64&width=64"}
                  alt={item.product.name}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="font-medium">{item.product.name}</p>
                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
              </div>
              <p className="font-medium">{formatDualCurrency(item.product.price * item.quantity)}</p>
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

          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{formatDualCurrency(shipping)}</span>
          </div>

          <div className="flex justify-between">
            <span>Tax</span>
            <span>{formatDualCurrency(tax)}</span>
          </div>

          <Separator />

          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>{formatDualCurrency(finalTotal)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
