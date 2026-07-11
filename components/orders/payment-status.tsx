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
        return <CheckCircle className="h-4 w-4 text-enkaji-green" />
      case "PENDING":
      case "PROCESSING":
      case "HELD":
        return <Clock className="h-4 w-4 text-enkaji-gold" />
      case "FAILED":
      case "CANCELLED":
        return <XCircle className="h-4 w-4 text-enkaji-red" />
      case "DISPUTED":
        return <AlertTriangle className="h-4 w-4 text-enkaji-ochre" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
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
            <div className="text-sm text-muted-foreground">
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
              <div className="bg-chart-4 p-4 rounded-lg">
                <p className="text-sm text-chart-4">
                  <strong>Payment is held in escrow</strong> - The payment is securely held until the order is
                  completed.
                  {userRole === "buyer" && " You can release the payment once you receive and approve your order."}
                  {userRole === "seller" && " The payment will be released to you once the buyer confirms receipt."}
                </p>
              </div>
            )}

            {order.escrowPayment.status === "RELEASE_REQUESTED" && userRole === "buyer" && (
              <div className="bg-enkaji-gold p-4 rounded-lg">
                <p className="text-sm text-enkaji-gold mb-3">
                  <strong>Payment release requested</strong> - The seller has requested payment release. Please confirm
                  you've received your order before releasing payment.
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => onEscrowAction?.("RELEASE")}
                    className="bg-enkaji-green hover:bg-enkaji-green"
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
              <div className="bg-enkaji-red p-4 rounded-lg">
                <p className="text-sm text-enkaji-red">
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
                    className="bg-enkaji-green hover:bg-enkaji-green"
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
            <div className="text-xs text-muted-foreground space-y-1">
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
