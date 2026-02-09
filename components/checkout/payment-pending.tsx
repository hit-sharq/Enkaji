"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Smartphone, RefreshCw, Clock, AlertCircle, CheckCircle } from "lucide-react"

interface PaymentPendingProps {
  orderId: string
  amount: number
  currency?: string
  paymentMethod?: string
  onRefresh?: () => void
  onCancel?: () => void
}

interface PaymentStatus {
  status: "checking" | "pending" | "completed" | "failed"
  message: string
}

export function PaymentPending({
  orderId,
  amount,
  currency = "KES",
  paymentMethod = "PESAPAL",
  onRefresh,
  onCancel
}: PaymentPendingProps) {
  const [status, setStatus] = useState<PaymentStatus>({
    status: "checking",
    message: "Checking payment status..."
  })
  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    // Start checking payment status
    checkPaymentStatus()

    // Set up polling interval
    const interval = setInterval(() => {
      checkPaymentStatus()
    }, 10000) // Check every 10 seconds

    return () => clearInterval(interval)
  }, [orderId])

  const checkPaymentStatus = async () => {
    try {
      const response = await fetch(`/api/pesapal/verify?orderId=${orderId}`)
      const data = await response.json()

      if (data.success) {
        const paymentStatus = data.payment.status

        if (paymentStatus === "COMPLETED" || paymentStatus === "PAID") {
          setStatus({
            status: "completed",
            message: "Payment confirmed successfully!"
          })
          // Redirect to order page after short delay
          setTimeout(() => {
            window.location.href = `/orders/${orderId}?payment=completed`
          }, 2000)
        } else if (paymentStatus === "FAILED") {
          setStatus({
            status: "failed",
            message: data.pesapalStatus?.statusDescription || "Payment failed. Please try again."
          })
        }
        // If still pending, continue checking
      }
    } catch (error) {
      console.error("[Pending] Status check error:", error)
    }
  }

  const handleRefresh = async () => {
    setIsChecking(true)
    await checkPaymentStatus()
    setIsChecking(false)
    onRefresh?.()
  }

  const getStatusIcon = () => {
    switch (status.status) {
      case "checking":
        return <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      case "pending":
        return <Clock className="h-12 w-12 text-yellow-600" />
      case "completed":
        return <CheckCircle className="h-12 w-12 text-green-600" />
      case "failed":
        return <AlertCircle className="h-12 w-12 text-red-600" />
    }
  }

  const getPaymentMethodIcon = () => {
    const method = paymentMethod.toLowerCase()
    if (method.includes("mpesa") || method.includes("airtel")) {
      return <Smartphone className="h-5 w-5" />
    }
    return <RefreshCw className="h-5 w-5" />
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          {getStatusIcon()}
        </div>
        <CardTitle>
          {status.status === "checking" && "Verifying Payment..."}
          {status.status === "pending" && "Payment Pending"}
          {status.status === "completed" && "Payment Successful!"}
          {status.status === "failed" && "Payment Failed"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <p className="text-gray-600 mb-2">{status.message}</p>
          
          {status.status === "pending" && (
            <p className="text-sm text-gray-500">
              This may take a few moments. Please don't close this page.
            </p>
          )}
        </div>

        {/* Payment Details */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Order ID</span>
            <span className="font-mono text-sm">{orderId}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Amount</span>
            <span className="font-semibold">{currency} {amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Payment Method</span>
            <div className="flex items-center gap-1">
              {getPaymentMethodIcon()}
              <span className="text-sm capitalize">
                {paymentMethod.replace("PESAPAL_", "")}
              </span>
            </div>
          </div>
        </div>

        {/* Instructions for Mobile Money */}
        {paymentMethod.toLowerCase().includes("mpesa") && status.status === "pending" && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              M-Pesa Instructions
            </h4>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Check your phone for an STK push notification</li>
              <li>Enter your M-Pesa PIN</li>
              <li>Confirm the payment</li>
              <li>Wait for confirmation SMS</li>
            </ol>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {status.status === "pending" && (
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isChecking}
              className="flex-1"
            >
              {isChecking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Status
                </>
              )}
            </Button>
          )}

          {status.status === "failed" && (
            <>
              <Button
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => window.location.href = `/checkout?orderId=${orderId}`}
                className="flex-1 bg-red-800 hover:bg-red-900"
              >
                Try Again
              </Button>
            </>
          )}

          {status.status === "completed" && (
            <Button
              onClick={() => window.location.href = `/orders/${orderId}`}
              className="w-full"
            >
              View Order
            </Button>
          )}
        </div>

        {/* Timer */}
        {status.status === "pending" && (
          <p className="text-xs text-center text-gray-500">
            Auto-refreshing every 10 seconds...
          </p>
        )}
      </CardContent>
    </Card>
  )
}

