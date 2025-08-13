"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Clock, XCircle, AlertTriangle, CreditCard, Smartphone, Building, Shield } from "lucide-react"

interface PaymentStatusProps {
  order: {
    id: string
    status: string
    paymentMethod: string
    paymentId?: string
    total: number
    escrowPayment?: {
      status: string
      heldAt?: string
      releasedAt?: string
      disputedAt?: string
    }
  }
  userRole: "buyer" | "seller"
  onEscrowAction?: (action: string) => void
}

export function PaymentStatus({ order, userRole, onEscrowAction }: PaymentStatusProps) {
  const getPaymentIcon = (method: string) => {
    switch (method) {
      case "STRIPE":
        return <CreditCard className="h-4 w-4" />
      case "MPESA":
        return <Smartphone className="h-4 w-4" />
      case "BANK_TRANSFER":
        return <Building className="h-4 w-4" />
      default:
        return <CreditCard className="h-4 w-4" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "CONFIRMED":
      case "COMPLETED":
      case "RELEASED":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "PENDING":
      case "PROCESSING":
      case "HELD":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "FAILED":
      case "CANCELLED":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "DISPUTED":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
      case "COMPLETED":
      case "RELEASED":
        return "default"
      case "PENDING":
      case "PROCESSING":
      case "HELD":
        return "secondary"
      case "FAILED":
      case "CANCELLED":
        return "destructive"
      case "DISPUTED":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-4">
      {/* Payment Method & Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Payment Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getPaymentIcon(order.paymentMethod)}
              <span className="font-medium">{order.paymentMethod.replace("_", " ")}</span>
            </div>
            <Badge variant={getStatusColor(order.status) as any}>
              {getStatusIcon(order.status)}
              <span className="ml-2">{order.status}</span>
            </Badge>
          </div>

          {order.paymentId && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Payment ID:</span> {order.paymentId}
            </div>
          )}

          <div className="text-lg font-semibold">Total: KES {order.total.toLocaleString()}</div>
        </CardContent>
      </Card>

      {/* Escrow Information */}
      {order.escrowPayment && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Escrow Protection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Escrow Status</span>
              <Badge variant={getStatusColor(order.escrowPayment.status) as any}>
                {getStatusIcon(order.escrowPayment.status)}
                <span className="ml-2">{order.escrowPayment.status.replace("_", " ")}</span>
              </Badge>
            </div>

            {order.escrowPayment.status === "HELD" && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Payment is held in escrow</strong> - The payment is securely held until the order is
                  completed.
                  {userRole === "buyer" && " You can release the payment once you receive and approve your order."}
                  {userRole === "seller" && " The payment will be released to you once the buyer confirms receipt."}
                </p>
              </div>
            )}

            {order.escrowPayment.status === "RELEASE_REQUESTED" && userRole === "buyer" && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-yellow-800 mb-3">
                  <strong>Payment release requested</strong> - The seller has requested payment release. Please confirm
                  you've received your order before releasing payment.
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => onEscrowAction?.("RELEASE")}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Release Payment
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onEscrowAction?.("DISPUTE")}>
                    Raise Dispute
                  </Button>
                </div>
              </div>
            )}

            {order.escrowPayment.status === "DISPUTED" && (
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Payment disputed</strong> - A dispute has been raised for this payment. Our support team will
                  review and resolve this issue.
                </p>
              </div>
            )}

            {/* Escrow Actions */}
            {order.escrowPayment.status === "HELD" && (
              <div className="flex gap-2">
                {userRole === "buyer" && order.status === "DELIVERED" && (
                  <Button
                    size="sm"
                    onClick={() => onEscrowAction?.("RELEASE")}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Release Payment
                  </Button>
                )}

                {userRole === "seller" && order.status === "DELIVERED" && (
                  <Button size="sm" variant="outline" onClick={() => onEscrowAction?.("REQUEST_RELEASE")}>
                    Request Payment Release
                  </Button>
                )}

                <Button size="sm" variant="outline" onClick={() => onEscrowAction?.("DISPUTE")}>
                  Raise Dispute
                </Button>
              </div>
            )}

            {/* Timestamps */}
            <div className="text-xs text-gray-500 space-y-1">
              {order.escrowPayment.heldAt && (
                <div>Payment held: {new Date(order.escrowPayment.heldAt).toLocaleString()}</div>
              )}
              {order.escrowPayment.releasedAt && (
                <div>Payment released: {new Date(order.escrowPayment.releasedAt).toLocaleString()}</div>
              )}
              {order.escrowPayment.disputedAt && (
                <div>Dispute raised: {new Date(order.escrowPayment.disputedAt).toLocaleString()}</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
