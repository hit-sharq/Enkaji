import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { handleApiError, AuthenticationError, ValidationError } from "@/lib/errors"
import { prisma } from "@/lib/db"
import { pesapalService } from "@/lib/pesapal"

export const dynamic = 'force-dynamic'

const SUBSCRIPTION_PLANS = {
  BASIC: {
    name: "Basic Seller",
    price: 0,
    features: ["Up to 20 products", "Basic analytics", "Standard support"],
    maxProducts: 20,
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
    maxProducts: -1, // Unlimited
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
    maxProducts: -1, // Unlimited
  },
}

// GET - Get current subscription and available plans
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new AuthenticationError()
    }

    if (user.role !== "SELLER") {
      throw new ValidationError("Only sellers can access subscription information")
    }

    const subscription = await prisma.sellerSubscription.findUnique({
      where: { sellerId: user.id }
    })

    // Get current product count
    const productCount = await prisma.product.count({
      where: { sellerId: user.id }
    })

    // Get subscription history
    const subscriptionHistory = await prisma.pesapalPayment.findMany({
      where: { 
        userId: user.id,
        orderId: { startsWith: "SUB-" }
      },
      orderBy: { createdAt: "desc" },
      take: 10
    })

    return NextResponse.json({
      subscription,
      plans: SUBSCRIPTION_PLANS,
      productCount,
      subscriptionHistory
    })
  } catch (error) {
    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}

// POST - Change subscription plan
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new AuthenticationError()
    }

    if (user.role !== "SELLER") {
      throw new ValidationError("Only sellers can change subscriptions")
    }

    const { planType, phoneNumber } = await request.json()

    if (!SUBSCRIPTION_PLANS[planType as keyof typeof SUBSCRIPTION_PLANS]) {
      throw new ValidationError("Invalid subscription plan")
    }

    const plan = SUBSCRIPTION_PLANS[planType as keyof typeof SUBSCRIPTION_PLANS]

    // Check current subscription
    const currentSubscription = await prisma.sellerSubscription.findUnique({
      where: { sellerId: user.id }
    })

    if (currentSubscription?.plan === planType && currentSubscription?.status === "ACTIVE") {
      throw new ValidationError("You are already subscribed to this plan")
    }

    // Check product count against new plan limits
    const productCount = await prisma.product.count({
      where: { sellerId: user.id }
    })

    if (plan.maxProducts !== -1 && productCount > plan.maxProducts) {
      throw new ValidationError(`You have ${productCount} products, but the ${plan.name} plan only allows ${plan.maxProducts}. Please delete some products before downgrading.`)
    }

    if (plan.price === 0) {
      // Free plan - activate immediately
      await prisma.sellerSubscription.upsert({
        where: { sellerId: user.id },
        update: {
          plan: planType as any,
          status: "ACTIVE",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
          pesapalSubscriptionId: null
        },
        create: {
          sellerId: user.id,
          plan: planType as any,
          status: "ACTIVE",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
      })

      return NextResponse.json({ 
        message: "Subscription changed successfully",
        subscription: {
          plan: planType,
          status: "ACTIVE"
        }
      })
    }

    // Paid plan - require payment
    if (!phoneNumber) {
      throw new ValidationError("Phone number is required for paid plans")
    }

    // Normalize phone number
    const normalizedPhone = normalizePhoneNumber(phoneNumber)

    // Create subscription record with UNPAID status (pending payment)
    const subscription = await prisma.sellerSubscription.upsert({
      where: { sellerId: user.id },
      update: {
        plan: planType as any,
        status: "UNPAID",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
      create: {
        sellerId: user.id,
        plan: planType as any,
        status: "UNPAID",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    })

    // Submit order to Pesapal
    const orderData = {
      id: `SUB-${subscription.id}-${Date.now()}`,
      currency: "KES",
      amount: plan.price,
      description: `${plan.name} Subscription - Enkaji Trade Kenya`,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/pesapal/callback`,
      notification_id: subscription.id,
      billing_address: {
        email_address: user.email,
        phone_number: normalizedPhone,
        country_code: "KE",
        first_name: user.firstName || "",
        last_name: user.lastName || "",
        line_1: "",
        city: "Nairobi",
        state: "Nairobi",
        postal_code: "",
        zip_code: ""
      }
    }

    const pesapalResponse = await pesapalService.submitOrder(orderData)

    // Create Pesapal payment record
    await prisma.pesapalPayment.create({
      data: {
        orderId: subscription.id,
        userId: user.id,
        amount: plan.price,
        currency: "KES",
        pesapalTrackingId: pesapalResponse.order_tracking_id,
        pesapalMerchantRef: pesapalResponse.merchant_reference,
        paymentMethod: "CARD",
        status: "PENDING"
      }
    })

    // Update subscription with Pesapal tracking ID
    await prisma.sellerSubscription.update({
      where: { id: subscription.id },
      data: {
        pesapalSubscriptionId: pesapalResponse.order_tracking_id
      }
    })

    return NextResponse.json({
      message: "Payment initiated. Please complete payment to activate subscription.",
      subscription: {
        id: subscription.id,
        plan: planType,
        status: "PENDING"
      },
      redirectUrl: pesapalResponse.redirect_url || `${process.env.NEXT_PUBLIC_APP_URL}/seller/subscription?payment=pending`,
      trackingId: pesapalResponse.order_tracking_id
    })
  } catch (error) {
    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}

// Helper function to normalize phone number
function normalizePhoneNumber(phone: string): string {
  let cleaned = phone.replace(/[^\d+]/g, '')
  
  if (cleaned.startsWith('+254')) {
    return cleaned
  } else if (cleaned.startsWith('254')) {
    return '+' + cleaned
  } else if (cleaned.startsWith('0')) {
    return '+254' + cleaned.substring(1)
  } else if (cleaned.length === 10) {
    return '+254' + cleaned
  }
  
  return phone.startsWith('+') ? phone : '+' + cleaned
}
