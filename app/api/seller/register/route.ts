import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { handleApiError } from "@/lib/errors"
import { generateUniqueSlug } from "@/lib/slug"
import { sendEmail, sellerRegistrationEmail } from "@/lib/email"
import { pesapalService } from "@/lib/pesapal"

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

    // Handle existing seller - return their profile instead of error
    if (user.role === "SELLER" && user.sellerProfile) {
      return NextResponse.json({
        success: true,
        message: "You already have a seller account",
        isExisting: true,
        sellerProfile: user.sellerProfile,
        redirectTo: "/dashboard",
      })
    }

    // Handle case where user role is SELLER but no profile exists (data inconsistency)
    if (user.role === "SELLER" && !user.sellerProfile) {
      // Allow them to create the missing profile
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

      // Get existing slugs to ensure uniqueness
      const existingSlugs = await db.sellerProfile.findMany({
        select: { slug: true },
      })
      const slug = generateUniqueSlug(businessName, existingSlugs.map((s) => s.slug).filter((slug): slug is string => slug !== null))

      const sellerProfile = await db.sellerProfile.create({
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

      // Create subscription based on plan
      const now = new Date()
      const periodEnd = new Date()
      periodEnd.setMonth(periodEnd.getMonth() + 1)

      const SUBSCRIPTION_PLANS: Record<string, { price: number }> = {
        BASIC: { price: 0 },
        PREMIUM: { price: 1500 },
        ENTERPRISE: { price: 5000 },
      }

      const selectedPlan = SUBSCRIPTION_PLANS[plan] || SUBSCRIPTION_PLANS.BASIC
      const isFreePlan = selectedPlan.price === 0

      const subscription = await db.sellerSubscription.create({
        data: {
          sellerId: user.id,
          plan: plan as any,
          status: isFreePlan ? "ACTIVE" : "UNPAID",
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        },
      })

      // Send confirmation email
      const sellerName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Seller'
      await sendEmail(
        user.email,
        `Welcome to Enkaji Trade — ${businessName}`,
        sellerRegistrationEmail(sellerName, businessName)
      )

      // For paid plans, initiate Pesapal payment
      if (!isFreePlan) {
        const orderData = {
          id: `SUB-${subscription.id}-${Date.now()}`,
          currency: "KES",
          amount: selectedPlan.price,
          description: `${plan} Subscription - Enkaji Trade Kenya`,
          callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/pesapal/callback`,
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
            zip_code: ""
          }
        }

        const pesapalResponse = await pesapalService.submitOrder(orderData)

        // Create Pesapal payment record
        await db.pesapalPayment.create({
          data: {
            orderId: subscription.id,
            userId: user.id,
            amount: selectedPlan.price,
            currency: "KES",
            pesapalTrackingId: pesapalResponse.order_tracking_id,
            pesapalMerchantRef: pesapalResponse.merchant_reference,
            paymentMethod: "CARD",
            status: "PENDING"
          }
        })

        // Update subscription with Pesapal tracking ID
        await db.sellerSubscription.update({
          where: { id: subscription.id },
          data: {
            pesapalSubscriptionId: pesapalResponse.order_tracking_id
          }
        })

        return NextResponse.json({
          success: true,
          message: "Payment required. Please complete payment to activate your subscription.",
          sellerProfile,
          isExisting: false,
          requiresPayment: true,
          redirectUrl: pesapalResponse.redirect_url || `${process.env.NEXT_PUBLIC_APP_URL}/seller/subscription?payment=pending`,
          trackingId: pesapalResponse.order_tracking_id
        })
      }

      return NextResponse.json({
        success: true,
        message: "Seller profile created successfully",
        sellerProfile,
        isExisting: false,
      })
    }

    // Create new seller profile for non-seller users
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

    // Update user role to SELLER
    await db.user.update({
      where: { id: user.id },
      data: { role: "SELLER" },
    })

    // Get existing slugs to ensure uniqueness
    const existingSlugs = await db.sellerProfile.findMany({
      select: { slug: true },
    })
    const slug = generateUniqueSlug(businessName, existingSlugs.map((s) => s.slug).filter((slug): slug is string => slug !== null))

    // Create seller profile
    const sellerProfile = await db.sellerProfile.create({
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

    // Create subscription based on plan
    const now = new Date()
    const periodEnd = new Date()
    periodEnd.setMonth(periodEnd.getMonth() + 1)

    const SUBSCRIPTION_PLANS: Record<string, { price: number }> = {
      BASIC: { price: 0 },
      PREMIUM: { price: 1500 },
      ENTERPRISE: { price: 5000 },
    }

    const selectedPlan = SUBSCRIPTION_PLANS[plan] || SUBSCRIPTION_PLANS.BASIC
    const isFreePlan = selectedPlan.price === 0

    const subscription = await db.sellerSubscription.create({
      data: {
        sellerId: user.id,
        plan: plan as any,
        status: isFreePlan ? "ACTIVE" : "UNPAID",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
    })

    // Send confirmation email
    const sellerName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Seller'
    await sendEmail(
      user.email,
      `Welcome to Enkaji Trade — ${businessName}`,
      sellerRegistrationEmail(sellerName, businessName)
    )

    // For paid plans, initiate Pesapal payment
    if (!isFreePlan) {
      const orderData = {
        id: `SUB-${subscription.id}-${Date.now()}`,
        currency: "KES",
        amount: selectedPlan.price,
        description: `${plan} Subscription - Enkaji Trade Kenya`,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/pesapal/callback`,
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
          zip_code: ""
        }
      }

      const pesapalResponse = await pesapalService.submitOrder(orderData)

      // Create Pesapal payment record
      await db.pesapalPayment.create({
        data: {
          orderId: subscription.id,
          userId: user.id,
          amount: selectedPlan.price,
          currency: "KES",
          pesapalTrackingId: pesapalResponse.order_tracking_id,
          pesapalMerchantRef: pesapalResponse.merchant_reference,
          paymentMethod: "CARD",
          status: "PENDING"
        }
      })

      // Update subscription with Pesapal tracking ID
      await db.sellerSubscription.update({
        where: { id: subscription.id },
        data: {
          pesapalSubscriptionId: pesapalResponse.order_tracking_id
        }
      })

      return NextResponse.json({
        success: true,
        message: "Payment required. Please complete payment to activate your subscription.",
        sellerProfile,
        isExisting: false,
        requiresPayment: true,
        redirectUrl: pesapalResponse.redirect_url || `${process.env.NEXT_PUBLIC_APP_URL}/seller/subscription?payment=pending`,
        trackingId: pesapalResponse.order_tracking_id
      })
    }

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
