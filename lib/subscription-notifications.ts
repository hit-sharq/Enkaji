import { sendEmail } from "./email"
import { appConfig } from "./app-config"

const EXPIRE_WARNING_DAYS = 7

const notificationSentCache = new Map<string, number>()
const CACHE_TTL = 1000 * 60 * 60 * 24

function getCacheKey(userId: string, type: string) {
  return `${userId}:${type}`
}

function canSendNotification(userId: string, type: string) {
  const key = getCacheKey(userId, type)
  const now = Date.now()
  const lastSent = notificationSentCache.get(key)
  if (lastSent && now - lastSent < CACHE_TTL) {
    return false
  }
  notificationSentCache.set(key, now)
  return true
}

export function getDaysUntilExpiry(subscription: { currentPeriodEnd: Date | string }) {
  const end = new Date(subscription.currentPeriodEnd).getTime()
  const now = Date.now()
  return Math.ceil((end - now) / (1000 * 60 * 60 * 24))
}

export function isExpired(subscription: { status: string; currentPeriodEnd: Date | string }) {
  if (subscription.status !== "ACTIVE") {
    return false
  }
  return new Date(subscription.currentPeriodEnd) < new Date()
}

export async function sendSubscriptionExpiringEmail(
  user: { email: string; firstName?: string | null; lastName?: string | null },
  subscription: { id: string; plan: string; currentPeriodEnd: Date | string },
) {
  const sellerName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Seller"
  const daysLeft = getDaysUntilExpiry(subscription)
  if (!canSendNotification(user.email, "expiring")) {
    return
  }

  const endDate = new Date(subscription.currentPeriodEnd).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  await sendEmail(
    user.email,
    `Your ${subscription.plan} subscription expires in ${daysLeft} days`,
    `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#8B2635">Subscription Renewal Reminder</h2>
      <p>Hi ${sellerName},</p>
      <p>Your <strong>${subscription.plan}</strong> subscription on ${appConfig.APP_NAME} will expire on <strong>${endDate}</strong> (in ${daysLeft} days).</p>
      <p>To avoid interruption to your listings and seller features, please renew your subscription before it ends.</p>
      <p><a href="${appConfig.SELLER_DASHBOARD_URL}/subscription" style="display:inline-block;background:#8B2635;color:white;padding:12px 24px;text-decoration:none;border-radius:4px;margin:16px 0">Renew Subscription</a></p>
      <p style="color:#666;font-size:12px">${appConfig.APP_FULL_NAME}</p>
    </div>`
  )
}

export async function sendSubscriptionExpiredEmail(
  user: { email: string; firstName?: string | null; lastName?: string | null },
  subscription: { id: string; plan: string },
) {
  const sellerName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Seller"
  if (!canSendNotification(user.email, "expired")) {
    return
  }

  await sendEmail(
    user.email,
    `Your ${subscription.plan} subscription has expired`,
    `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#dc3545">Subscription Expired</h2>
      <p>Hi ${sellerName},</p>
      <p>Your <strong>${subscription.plan}</strong> subscription has expired. You may no longer be able to create or manage products until you renew.</p>
      <p><a href="${appConfig.SELLER_DASHBOARD_URL}/subscription" style="display:inline-block;background:#8B2635;color:white;padding:12px 24px;text-decoration:none;border-radius:4px;margin:16px 0">Reactivate Subscription</a></p>
      <p style="color:#666;font-size:12px">${appConfig.APP_FULL_NAME}</p>
    </div>`
  )
}

export async function checkSubscriptionNotifications(subscription: {
  id: string
  sellerId: string
  plan: string
  status: string
  currentPeriodEnd: Date | string
}, user: { email: string; firstName?: string | null; lastName?: string | null }) {
  if (!subscription || !user) return

  const daysLeft = getDaysUntilExpiry(subscription)

  if (subscription.status === "ACTIVE" && daysLeft > 0 && daysLeft <= EXPIRE_WARNING_DAYS) {
    await sendSubscriptionExpiringEmail(user, subscription)
    return
  }

  if (isExpired(subscription)) {
    await sendSubscriptionExpiredEmail(user, subscription)
  }
}
