"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CreditCard, Smartphone, Building, CheckCircle } from "lucide-react"

interface PesapalPaymentFormProps {
  orderId: string
  amount: number
  currency?: string
  onSuccess: (paymentData: any) => void
  onError: (error: string) => void
  onCancel?: () => void
}

type PaymentMethod = "card" | "mpesa" | "airtel" | "bank"

interface PaymentMethodOption {
  id: PaymentMethod
  name: string
  description: string
  icon: React.ReactNode
  processingTime: string
}

export function PesapalPaymentForm({
  orderId,
  amount,
  currency = "KES",
  onSuccess,
  onError,
  onCancel
}: PesapalPaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("card")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [step, setStep] = useState<"select" | "phone" | "processing" | "complete">("select")

  const { toast } = useToast()

  const paymentMethods: PaymentMethodOption[] = [
    {
      id: "card",
      name: "Credit/Debit Card",
      description: "Visa, Mastercard, UnionPay",
      icon: <CreditCard className="h-5 w-5" />,
      processingTime: "Instant"
    },
    {
      id: "mpesa",
      name: "M-Pesa",
      description: "Pay with M-Pesa mobile money",
      icon: <Smartphone className="h-5 w-5" />,
      processingTime: "Instant"
    },
    {
      id: "airtel",
      name: "Airtel Money",
      description: "Pay with Airtel Money",
      icon: <Smartphone className="h-5 w-5" />,
      processingTime: "Instant"
    },
    {
      id: "bank",
      name: "Bank Transfer",
      description: "Equity, KCB, Co-op Bank",
      icon: <Building className="h-5 w-5" />,
      processingTime: "1-2 business days"
    }
  ]

  const handleSubmit = async () => {
    setIsLoading(true)

    try {
      // If M-Pesa or Airtel, we need phone number
      if ((selectedMethod === "mpesa" || selectedMethod === "airtel") && !phoneNumber) {
        setStep("phone")
        setIsLoading(false)
        return
      }

      setStep("processing")

      // Submit order to Pesapal
      const response = await fetch("/api/pesapal/submit-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          orderId,
          currency,
          paymentMethod: selectedMethod.toUpperCase()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit order")
      }

      // If we have a redirect URL, redirect to Pesapal
      if (data.redirect_url) {
        // Store order info for callback handling
        sessionStorage.setItem(`pesapal_order_${orderId}`, JSON.stringify({
          orderId,
          amount,
          timestamp: Date.now()
        }))

        // Redirect to Pesapal payment page
        window.location.href = data.redirect_url
        return
      }

      // For M-Pesa, show pending status
      if (selectedMethod === "mpesa" || selectedMethod === "airtel") {
        setStep("complete")
        onSuccess({
          orderId,
          status: "PENDING",
          method: selectedMethod,
          message: "Please complete the payment on your phone"
        })
      }

    } catch (error) {
      console.error("[Pesapal] Payment error:", error)
      setStep("select")
      const errorMessage = error instanceof Error ? error.message : "Payment failed"
      onError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhoneSubmit = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)

    try {
      setStep("processing")

      // Submit order with phone number for M-Pesa/Airtel
      const response = await fetch("/api/pesapal/submit-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          orderId,
          currency,
          paymentMethod: selectedMethod.toUpperCase(),
          phoneNumber
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit order")
      }

      // For mobile money, redirect or show pending
      if (data.redirect_url) {
        window.location.href = data.redirect_url
        return
      }

      setStep("complete")
      onSuccess({
        orderId,
        status: "PENDING",
        method: selectedMethod,
        phoneNumber
      })

    } catch (error) {
      console.error("[Pesapal] Payment error:", error)
      setStep("phone")
      const errorMessage = error instanceof Error ? error.message : "Payment failed"
      onError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Render completion state
  if (step === "complete") {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Payment Initiated!</h3>
            <p className="text-gray-600 mb-4">
              {selectedMethod === "mpesa" || selectedMethod === "airtel"
                ? `Please check your phone for the payment prompt.`
                : "Your payment is being processed."}
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600">Order ID: {orderId}</p>
              <p className="text-lg font-semibold">{currency} {amount.toLocaleString()}</p>
            </div>
            <Button
              onClick={() => window.location.href = `/orders/${orderId}`}
              className="w-full"
            >
              View Order
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Render phone input for mobile money
  if (step === "phone") {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Enter Phone Number
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            We'll send a payment prompt to this number via {selectedMethod === "mpesa" ? "M-Pesa" : "Airtel Money"}.
          </p>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="07XX XXX XXX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Amount to pay</p>
            <p className="text-2xl font-bold">{currency} {amount.toLocaleString()}</p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setStep("select")
                onCancel?.()
              }}
              className="flex-1"
              disabled={isLoading}
            >
              Back
            </Button>
            <Button
              onClick={handlePhoneSubmit}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Send Payment Prompt"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Render processing state
  if (step === "processing") {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Processing Payment...</h3>
            <p className="text-gray-600">Please wait while we connect to Pesapal</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Render payment method selection
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Select Payment Method
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-600 mb-1">Order Total</p>
          <p className="text-2xl font-bold">{currency} {amount.toLocaleString()}</p>
        </div>

        <RadioGroup
          value={selectedMethod}
          onValueChange={(value) => setSelectedMethod(value as PaymentMethod)}
          className="space-y-3"
        >
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedMethod === method.id
                  ? "border-primary bg-primary/5"
                  : "hover:bg-gray-50"
              }`}
            >
              <RadioGroupItem value={method.id} id={method.id} />
              <div className="flex-1 flex items-center gap-3">
                <div className={`p-2 rounded-full ${
                  selectedMethod === method.id ? "bg-primary text-white" : "bg-gray-100"
                }`}>
                  {method.icon}
                </div>
                <div>
                  <Label htmlFor={method.id} className="font-medium cursor-pointer">
                    {method.name}
                  </Label>
                  <p className="text-sm text-gray-500">{method.description}</p>
                </div>
              </div>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {method.processingTime}
              </span>
            </div>
          ))}
        </RadioGroup>

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 bg-red-800 hover:bg-red-900"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay ${currency} ${amount.toLocaleString()}`
            )}
          </Button>
        </div>

        <p className="text-xs text-center text-gray-500">
          Secured by Pesapal. You will be redirected to complete payment.
        </p>
      </CardContent>
    </Card>
  )
}

