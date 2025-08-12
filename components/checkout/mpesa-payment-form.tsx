"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Smartphone } from "lucide-react"

interface MpesaPaymentFormProps {
  amount: number
  orderId: string
  onSuccess: (transactionId: string) => void
  onError: (error: string) => void
}

export function MpesaPaymentForm({ amount, orderId, onSuccess, onError }: MpesaPaymentFormProps) {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "")

    // Format as Kenyan phone number
    if (digits.startsWith("254")) {
      return digits.slice(0, 12)
    } else if (digits.startsWith("0")) {
      return digits.slice(0, 10)
    } else {
      return digits.slice(0, 9)
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setPhoneNumber(formatted)
  }

  const validatePhoneNumber = (phone: string) => {
    const kenyanPhoneRegex = /^(254|0)?[17]\d{8}$/
    return kenyanPhoneRegex.test(phone.replace(/\s/g, ""))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!validatePhoneNumber(phoneNumber)) {
      setError("Please enter a valid Kenyan phone number")
      return
    }

    setIsProcessing(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("/api/mpesa/stk-push", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber,
          amount,
          orderId,
          accountReference: `ENKAJI-${orderId}`,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess("Payment request sent! Please check your phone and enter your M-Pesa PIN.")
        // In a real app, you'd poll for payment status or handle via webhook
        setTimeout(() => {
          onSuccess(data.checkoutRequestId)
        }, 30000) // Wait 30 seconds for user to complete payment
      } else {
        throw new Error(data.error || "Payment request failed")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Payment failed"
      setError(errorMessage)
      onError(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="w-5 h-5" />
          Pay with M-Pesa
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="0712345678 or 254712345678"
              value={phoneNumber}
              onChange={handlePhoneChange}
              required
            />
            <p className="text-sm text-gray-500">Enter your Safaricom phone number</p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={isProcessing || !phoneNumber}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending request...
              </>
            ) : (
              `Pay KES ${amount.toLocaleString()}`
            )}
          </Button>

          <div className="text-xs text-gray-500 space-y-1">
            <p>• You will receive an M-Pesa prompt on your phone</p>
            <p>• Enter your M-Pesa PIN to complete the payment</p>
            <p>• Payment confirmation will be sent via SMS</p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
