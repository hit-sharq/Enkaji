import { prisma } from "@/lib/db"

export const SUBSCRIPTION_PLANS = {
  BASIC: {
    name: "Basic Seller",
    price: 0,
    features: ["Up to 20 products", "Basic analytics", "Standard support"],
    maxProducts: 20,
  },
  PREMIUM: {
    name: "Premium Seller",
    price: 1500,
    features: [
      "Unlimited products",
      "Featured listings",
      "Advanced analytics",
      "Priority support",
      "Bulk upload tools",
      "Custom branding",
    ],
    maxProducts: -1,
  },
  ENTERPRISE: {
    name: "Enterprise Seller",
    price: 5000,
    features: [
      "Everything in Premium",
      "Dedicated account manager",
      "API access",
      "Custom integrations",
      "White-label options",
    ],
    maxProducts: -1,
  },
}

export async function getSellerSubscription(userId: string) {
  return await prisma.sellerSubscription.findUnique({
    where: { sellerId: userId },
  })
}

export function isSubscriptionActive(subscription: { status: string; currentPeriodEnd: Date } | null) {
  if (!subscription) return false
  if (subscription.status !== "ACTIVE") return false
  return new Date() < new Date(subscription.currentPeriodEnd)
}

export function getPlanPrice(plan: string): number {
  return SUBSCRIPTION_PLANS[plan as keyof typeof SUBSCRIPTION_PLANS]?.price ?? 0
}

export function isFreePlan(plan: string): boolean {
  return getPlanPrice(plan) === 0
}
