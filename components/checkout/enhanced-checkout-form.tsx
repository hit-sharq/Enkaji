"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StripePaymentForm } from "./stripe-payment-form"
import { MpesaPaymentForm } from "./mpesa-payment-form"
import { CreditCard, Smartphone } from "lucide-react"

interface EnhancedCheckoutFormProps {
  orderId: string
  amount: number
  onPaymentSuccess: (paymentId: string, method: string) => void
  onPaymentError: (error: string) => void
}

export function EnhancedCheckoutForm({ orderId, amount, onPaymentSuccess, onPaymentError }: EnhancedCheckoutFormProps) {
  const [selectedMethod, setSelectedMethod] = useState("stripe")

  const handleStripeSuccess = (paymentIntentId: string) => {
    onPaymentSuccess(paymentIntentId, "stripe")
  }

  const handleMpesaSuccess = (transactionId: string) => {
    onPaymentSuccess(transactionId, "mpesa")
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Choose Payment Method</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedMethod} onValueChange={setSelectedMethod}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stripe" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Card
            </TabsTrigger>
            <TabsTrigger value="mpesa" className="flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              M-Pesa
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stripe" className="mt-4">
            <StripePaymentForm
              amount={amount}
              orderId={orderId}
              onSuccess={handleStripeSuccess}
              onError={onPaymentError}
            />
          </TabsContent>

          <TabsContent value="mpesa" className="mt-4">
            <MpesaPaymentForm
              amount={amount}
              orderId={orderId}
              onSuccess={handleMpesaSuccess}
              onError={onPaymentError}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
