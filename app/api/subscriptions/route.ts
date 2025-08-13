import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { handleApiError, AuthenticationError, ValidationError } from "@/lib/errors"
import { prisma } from "@/lib/db"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
})

const SUBSCRIPTION_PLANS = {
  BASIC: {
    name: "Basic Seller",
    price: 0,
    features: ["Up to 20 products", "Basic analytics", "Standard support"],
  },
  PREMIUM: {
    name: "Premium Seller",
    price: 1500, // KES per month
    features: [
      "Unlimited products",
      "Featured listings",
      "Advanced analytics",
      "Priority support",
      "Bulk upload tools",
      "Custom branding",
    ],
  },
  ENTERPRISE: {
    name: "Enterprise Seller",
    price: 5000, // KES per month
    features: [
      "Everything in Premium",
      "Dedicated account manager",
      "API access",
      "Custom integrations",
      "White-label options",
    ],
  },
}

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new AuthenticationError()
    }

    const subscription = await prisma.sellerSubscription.findUnique({
      where: { sellerId: user.id },
    })

    return NextResponse.json({
      subscription,
      plans: SUBSCRIPTION_PLANS,
    })
  } catch (error) {
    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new AuthenticationError()
    }

    const { planType, paymentMethod } = await request.json()

    if (!SUBSCRIPTION_PLANS[planType as keyof typeof SUBSCRIPTION_PLANS]) {
      throw new ValidationError("Invalid subscription plan")
    }

    const plan = SUBSCRIPTION_PLANS[planType as keyof typeof SUBSCRIPTION_PLANS]

    if (plan.price === 0) {
      // Free plan
      await prisma.sellerSubscription.upsert({
        where: { sellerId: user.id },
        update: {
          plan: planType as any,
          status: "ACTIVE",
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        },
        create: {
          sellerId: user.id,
          plan: planType as any,
          status: "ACTIVE",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
      })

      return NextResponse.json({ message: "Subscription activated successfully" })
    }

    // Paid plan - create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: plan.price * 100, // Convert to cents
      currency: "kes",
      metadata: {
        userId: user.id,
        planType,
        subscriptionType: "monthly",
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error) {
    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}
