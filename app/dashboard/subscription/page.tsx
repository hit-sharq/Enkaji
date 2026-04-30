"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, Loader2, Package, CreditCard, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface SubscriptionPlan {
  name: string
  price: number
  features: string[]
  maxProducts: number
}

interface Subscription {
  id: string
  plan: string
  status: string
  currentPeriodStart: string
  currentPeriodEnd: string
}

export default function SubscriptionPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState(false)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [plans, setPlans] = useState<{ [key: string]: SubscriptionPlan }>({})
  const [productCount, setProductCount] = useState(0)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [phoneNumber, setPhoneNumber] = useState("")

  useEffect(() => {
    fetchSubscription()
  }, [])

  const fetchSubscription = async () => {
    try {
      const response = await fetch("/api/seller/subscription")
      if (!response.ok) {
        throw new Error("Failed to fetch subscription")
      }
      const data = await response.json()
      setSubscription(data.subscription)
      setPlans(data.plans)
      setProductCount(data.productCount)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load subscription information",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

const handleSubscribe = async (planType: string) => {
    if (plans[planType].price === 0) {
      // Free plan - activate immediately
      setSubscribing(true)
      try {
        const response = await fetch("/api/seller/subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planType }),
        })

        if (!response.ok) {
          let errorMessage = "Failed to subscribe"
          try {
            const error = await response.json()
            errorMessage = error.error || errorMessage
          } catch {
            errorMessage = `Server error: ${response.status}`
          }
          throw new Error(errorMessage)
        }

        toast({
          title: "Success",
          description: "Subscription activated successfully!",
        })
        fetchSubscription()
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
      } finally {
        setSubscribing(false)
      }
    } else {
      // Paid plan - show payment form
      setSelectedPlan(planType)
    }
  }

const handlePayment = async () => {
    if (!selectedPlan || !phoneNumber) {
      toast({
        title: "Error",
        description: "Please enter your phone number",
        variant: "destructive",
      })
      return
    }

    setSubscribing(true)
    try {
      const response = await fetch("/api/seller/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType: selectedPlan, phoneNumber }),
      })

      if (!response.ok) {
        let errorMessage = "Failed to initiate payment"
        try {
          const error = await response.json()
          errorMessage = error.error || errorMessage
        } catch {
          errorMessage = `Server error: ${response.status}`
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      
      toast({
        title: "Payment Initiated",
        description: "Please complete payment on your phone to activate subscription.",
      })

      // Redirect to payment page or show success
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl
      } else {
        fetchSubscription()
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSubscribing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const currentPlan = subscription?.plan || "BASIC"
  const isActive = subscription?.status === "ACTIVE"

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Subscription Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage your seller subscription and billing
        </p>
      </div>

      {/* Current Subscription Status */}
      {subscription && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Current Subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold">{plans[currentPlan]?.name}</p>
                <p className="text-sm text-muted-foreground">
                  {isActive ? "Active" : subscription.status}
                </p>
                {subscription.currentPeriodEnd && (
                  <p className="text-sm text-muted-foreground">
                    Renews: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">
                  {plans[currentPlan]?.price === 0 ? "Free" : `KSh ${plans[currentPlan]?.price}/mo`}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Package className="h-4 w-4" />
                  <span className="text-sm">
                    {productCount} / {plans[currentPlan]?.maxProducts === -1 ? "∞" : plans[currentPlan]?.maxProducts} products
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscription Warning */}
      {(!subscription || !isActive) && (
        <Card className="mb-8 border-yellow-500 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-semibold text-yellow-800">No Active Subscription</p>
                <p className="text-sm text-yellow-700">
                  You need an active subscription to create products. Please subscribe to a plan below.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

{/* Available Plans - Horizontal Scroll on Mobile */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Available Plans</h2>
        {/* Horizontal scroll container for mobile */}
        <div className="flex overflow-x-auto md:grid md:grid-cols-3 md:overflow-visible gap-4 pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:gap-6 snap-x snap-mandatory">
          {Object.entries(plans).map(([planType, plan]) => (
            <Card 
              key={planType} 
              className={`relative min-w-[280px] md:min-w-0 snap-center ${
                currentPlan === planType && isActive ? 'border-primary shadow-md shadow-primary/20' : ''
              }`}
            >
              {currentPlan === planType && isActive && (
                <Badge className="absolute -top-2 right-4 bg-green-600">Current Plan</Badge>
              )}
              {planType === 'PREMIUM' && (
                <Badge className="absolute -top-2 left-4 bg-orange-500">Popular</Badge>
              )}
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  {planType === 'BASIC' && <Package className="h-5 w-5" />}
                  {planType === 'PREMIUM' && <CreditCard className="h-5 w-5 text-orange-500" />}
                  {planType === 'ENTERPRISE' && <AlertCircle className="h-5 w-5" />}
                  {plan.name}
                </CardTitle>
                <CardDescription className="mt-2">
                  <span className="text-3xl font-bold">
                    {plan.price === 0 ? "Free" : `KSh ${plan.price}`}
                  </span>
                  {plan.price > 0 && <span className="text-muted-foreground text-sm">/month</span>}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  onClick={() => handleSubscribe(planType)}
                  disabled={subscribing || (currentPlan === planType && isActive)}
                  variant={currentPlan === planType && isActive ? "outline" : planType === 'PREMIUM' ? "default" : "secondary"}
                >
                  {subscribing && selectedPlan === planType ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : currentPlan === planType && isActive ? (
                    "Current Plan"
                  ) : plan.price === 0 ? (
                    "Activate Free Plan"
                  ) : (
                    "Subscribe"
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Payment Form for Paid Plans */}
      {selectedPlan && plans[selectedPlan]?.price > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Complete Payment</CardTitle>
            <CardDescription>
              Enter your phone number to receive M-Pesa payment request
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="e.g., 0712345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  We'll send an M-Pesa payment request to this number
                </p>
              </div>
              <div className="flex gap-4">
                <Button onClick={handlePayment} disabled={subscribing}>
                  {subscribing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Pay KSh ${plans[selectedPlan]?.price}`
                  )}
                </Button>
                <Button variant="outline" onClick={() => setSelectedPlan(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
