import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { handleApiError } from "@/lib/errors"
import { generateUniqueSlug } from "@/lib/slug"
import { sendEmail, sellerRegistrationEmail } from "@/lib/email"
import { pesapalService } from "@/lib/pesapal"
import { appConfig } from "@/lib/app-config"
import { getSellerSubscription, isSubscriptionActive } from "@/lib/subscription"

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: {
        sellerProfile: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const body = await req.json()
    const { businessName, description, location, phoneNumber, website, businessType, plan = "BASIC" } = body

    if (!businessName || !location || !phoneNumber || !businessType) {
      return NextResponse.json(
        {
          error: "Missing required fields: businessName, location, phoneNumber, businessType",
        },
        { status: 400 },
      )
    }

    const existingSubscription = await getSellerSubscription(user.id)

    if (user.sellerProfile && existingSubscription?.plan) {
      if (existingSubscription.status === "ACTIVE" && isSubscriptionActive(existingSubscription)) {
        return NextResponse.json({
          success: true,
          message: "You already have a seller account",
          isExisting: true,
          sellerProfile: user.sellerProfile,
          redirectTo: "/dashboard",
        })
      }

      if (existingSubscription.status === "UNPAID") {
        const payment = await db.pesapalPayment.findFirst({
          where: { orderId: existingSubscription.id },
          orderBy: { createdAt: "desc" },
        })

        return NextResponse.json({
          success: false,
          message: "Payment pending. Please complete payment to activate your seller account.",
          requiresPayment: true,
          redirectUrl: `${appConfig.APP_URL}/seller/subscription?payment=pending`,
          trackingId: payment?.pesapalTrackingId,
        })
      }
    }

    const SUBSCRIPTION_PLANS: Record<string, { price: number }> = {
      BASIC: { price: 0 },
      PREMIUM: { price: 1500 },
      ENTERPRISE: { price: 5000 },
    }

    const selectedPlan = SUBSCRIPTION_PLANS[plan] || SUBSCRIPTION_PLANS.BASIC
    const isFreePlan = selectedPlan.price === 0

    const now = new Date()
    const periodEnd = new Date()
    periodEnd.setMonth(periodEnd.getMonth() + 1)

    const existingSlugs = await db.sellerProfile.findMany({
      select: { slug: true },
    })
    const slug = generateUniqueSlug(businessName, existingSlugs.map((s) => s.slug).filter((slug): slug is string => slug !== null))

    let sellerProfile
    if (user.sellerProfile) {
      sellerProfile = await db.sellerProfile.update({
        where: { userId: user.id },
        data: {
          businessName,
          slug,
          businessType,
          description,
          location,
          phone: phoneNumber,
          website,
        },
      })
    } else {
      sellerProfile = await db.sellerProfile.create({
        data: {
          userId: user.id,
          businessName,
          slug,
          businessType,
          description,
          location,
          phone: phoneNumber,
          website,
        },
      })
    }

    const subscription = await db.sellerSubscription.upsert({
      where: { sellerId: user.id },
      update: {
        plan: plan as any,
        status: isFreePlan ? "ACTIVE" : "UNPAID",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        pesapalSubscriptionId: null,
      },
      create: {
        sellerId: user.id,
        plan: plan as any,
        status: isFreePlan ? "ACTIVE" : "UNPAID",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
    })

    const sellerName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Seller"
    await sendEmail(
      user.email,
      `Welcome to ${appConfig.APP_NAME} — ${businessName}`,
      sellerRegistrationEmail(sellerName, businessName)
    )

    if (!isFreePlan) {
      const orderData = {
        id: `SUB-${subscription.id}-${Date.now()}`,
        currency: "KES",
        amount: selectedPlan.price,
        description: `${plan} Subscription — ${appConfig.APP_FULL_NAME}`,
        callback_url: `${appConfig.APP_URL}/api/pesapal/callback`,
        notification_id: subscription.id,
        billing_address: {
          email_address: user.email,
          phone_number: phoneNumber,
          country_code: "KE",
          first_name: user.firstName || "",
          last_name: user.lastName || "",
          line_1: "",
          city: "Nairobi",
          state: "Nairobi",
          postal_code: "",
          zip_code: "",
        },
      }

      const pesapalResponse = await pesapalService.submitOrder(orderData)

      await db.pesapalPayment.create({
        data: {
          orderId: subscription.id,
          userId: user.id,
          amount: selectedPlan.price,
          currency: "KES",
          pesapalTrackingId: pesapalResponse.order_tracking_id,
          pesapalMerchantRef: pesapalResponse.merchant_reference,
          paymentMethod: "CARD",
          status: "PENDING",
        },
      })

      await db.sellerSubscription.update({
        where: { id: subscription.id },
        data: {
          pesapalSubscriptionId: pesapalResponse.order_tracking_id,
        },
      })

      return NextResponse.json({
        success: true,
        message: "Payment required. Please complete payment to activate your subscription.",
        sellerProfile,
        isExisting: false,
        requiresPayment: true,
        redirectUrl: pesapalResponse.redirect_url || `${appConfig.APP_URL}/seller/subscription?payment=pending`,
        trackingId: pesapalResponse.order_tracking_id,
      })
    }

    await db.user.update({
      where: { id: user.id },
      data: { role: "SELLER" },
    })

    return NextResponse.json({
      success: true,
      message: "Seller account created successfully",
      sellerProfile,
      isExisting: false,
    })
  } catch (error) {
    console.error("Seller registration error:", error)
    return handleApiError(error)
  }
}
