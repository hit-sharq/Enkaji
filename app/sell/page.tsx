import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { SellerRegistrationForm } from "@/components/seller/seller-registration-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"

const subscriptionPlans = [
  {
    name: "Basic",
    price: "Free",
    description: "Perfect for starting out",
    features: [
      "Up to 10 product listings",
      "Basic analytics",
      "Standard support",
      "5% commission on sales",
    ],
    popular: false,
  },
  {
    name: "Premium",
    price: "KES 1,500",
    period: "/month",
    description: "For growing businesses",
    features: [
      "Unlimited product listings",
      "Advanced analytics",
      "Priority support",
      "Featured listings",
      "Lower 3% commission",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "KES 5,000",
    period: "/month",
    description: "For large operations",
    features: [
      "Everything in Premium",
      "API access",
      "Dedicated account manager",
      "Lowest 2% commission",
      "Custom integrations",
    ],
    popular: false,
  },
]

export default async function SellPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/sign-in")
  }

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Start Selling on Enkaji Trade Kenya</h1>
            <p className="text-gray-600">
              Join thousands of successful sellers across Kenya. Choose a plan that works for you and start listing your
              products today.
            </p>
          </div>

          {/* Subscription Plans Preview */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-center mb-6">Choose Your Plan</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {subscriptionPlans.map((plan) => (
                <Card key={plan.name} className={plan.popular ? "border-orange-500 border-2 relative" : ""}>
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-600">Most Popular</Badge>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle>{plan.name}</CardTitle>
                    <div className="text-2xl font-bold">
                      {plan.price}
                      {plan.period && <span className="text-sm font-normal text-gray-500">{plan.period}</span>}
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start text-sm">
                          <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="text-center text-sm text-gray-500 mt-4">
              All plans include access to our seller dashboard, order management, and customer support.
              You can upgrade or downgrade your plan at any time.
            </p>
          </div>

          <SellerRegistrationForm
            user={{
              id: user.id,
              email: user.email,
              firstName: user.firstName ?? null,
              lastName: user.lastName ?? null,
            }}
          />
        </div>
      </main>
    </div>
  )
}
