import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { pesapalService } from "@/lib/pesapal"
import { detectShippingZone, getShippingOptions } from "@/lib/shipping-enhanced"
import type { ShippingOption } from "@/types/shipping"

// This endpoint initiates payment WITHOUT creating an order
// Order will only be created after successful payment via IPN callback
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    console.log("User ID:", user?.id || "No user")

    if (!user) {
      return NextResponse.json({ error: "Please sign in to checkout" }, { status: 401 })
    }

    const requestData = await request.json()
    console.log("Checkout request:", requestData)

    const { items, shippingAddress, selectedShippingOption, paymentMethod } = requestData

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items in cart" }, { status: 400 })
    }

    // Calculate totals & shipping automatically
    let totalWeight = 0
    let lineSubtotal = 0

    // Get product weights for calculation
    for (const item of items) {
      const productId = item.productId || item.id
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { weight: true, inventory: true, price: true }
      })
      
      if (!product) {
        return NextResponse.json({ error: `Product ${productId} not found` }, { status: 400 })
      }
      
      if (product.inventory < item.quantity) {
        return NextResponse.json({ 
          error: `Insufficient inventory for product ${productId}` 
        }, { status: 400 })
      }
      
      const itemWeight = product?.weight ? Number(product.weight) : 1
      const itemQty = Number(item.quantity)
      totalWeight += itemWeight * itemQty
      lineSubtotal += Number(product.price) * itemQty
    }

    // Detect zone from address
    const country = shippingAddress?.country || 'Kenya'
    const city = shippingAddress?.city || ''
    const zone = detectShippingZone(country, city)
    console.log('Detected shipping zone:', zone.displayName)

    // Get shipping options & use selected or cheapest
    const shippingOptions = getShippingOptions(zone, totalWeight, lineSubtotal)
    const shippingOption = selectedShippingOption 
      ? (shippingOptions.find((opt: ShippingOption) => opt.id === selectedShippingOption) as ShippingOption)
      : shippingOptions[0] as ShippingOption // Default cheapest

    if (!shippingOption) {
      return NextResponse.json({ error: "No shipping available for this destination" }, { status: 400 })
    }

    const shippingCost = shippingOption.price
    const taxRate = 0.16 // 16% VAT
    const taxAmount = lineSubtotal * taxRate
    const grandTotal = lineSubtotal + taxAmount + shippingCost

    // Generate unique payment reference (will be used as merchant reference)
    const paymentReference = `PAY-${Date.now()}-${Math.floor(Math.random() * 10000)}`

    console.log(`Shipping calc: zone=${zone.id}, weight=${totalWeight.toFixed(1)}kg, cost=KES${shippingCost}, total=KES${grandTotal}`)

    // Store payment details temporarily (will be used to create order after payment)
    // We'll use a simple JSON structure stored in memory or cache
    // For now, we'll pass it through Pesapal's IPN callback
    
    // Create Pesapal order (without creating actual order in our system)
    const pesapalOrder = {
      id: paymentReference,
      currency: "KES",
      amount: grandTotal,
      description: `Order payment for ${items.length} item(s)`,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/pesapal/callback`,
      notification_id: process.env.PESAPAL_IPN_ID, // Your IPN ID
      billing_address: {
        email_address: user.email,
        phone_number: shippingAddress?.phone || '',
        country_code: "KE",
        first_name: user.firstName || '',
        last_name: user.lastName || '',
        line_1: shippingAddress?.address || '',
        city: shippingAddress?.city || '',
        state: shippingAddress?.state || '',
      }
    }

    // Submit to Pesapal
    const pesapalResponse = await pesapalService.submitOrder(pesapalOrder)

    if (!pesapalResponse.redirect_url) {
      throw new Error("Failed to get payment redirect URL from Pesapal")
    }

    // Store checkout data in session storage for later use
    // This will be retrieved after payment success to create the order
    const checkoutData = {
      userId: user.id,
      items,
      shippingAddress,
      subtotal: lineSubtotal,
      tax: taxAmount,
      shipping: shippingCost,
      total: grandTotal,
      shippingZone: zone.id,
      shippingOption: shippingOption.id,
      paymentReference,
      timestamp: Date.now()
    }

    console.log(`✅ Payment initiated: ${paymentReference} for user ${user.id}`)

    return NextResponse.json({
      success: true,
      paymentReference,
      redirectUrl: pesapalResponse.redirect_url,
      checkoutData, // Send back to client to store temporarily
      subtotal: lineSubtotal,
      tax: taxAmount,
      shipping: shippingCost,
      total: grandTotal,
      shippingDetails: {
        zone: zone.displayName,
        option: shippingOption.service.name,
        provider: shippingOption.provider.name,
        estimatedWeight: totalWeight.toFixed(1) + 'kg',
        estimatedDelivery: shippingOption.formattedDelivery
      }
    })
  } catch (error) {
    console.error("Payment initiation FULL ERROR:", {
      message: error instanceof Error ? error.message : 'Unknown',
      stack: error instanceof Error ? error.stack : 'No stack',
      name: error instanceof Error ? error.name : 'Unknown',
      cause: error instanceof Error ? (error as any).cause : 'No cause'
    });
    
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ 
      error: "Failed to initiate payment: " + errorMessage,
      details: process.env.NODE_ENV === 'development' ? {
        message: errorMessage,
        ...(error instanceof Error && error.stack ? { stack: error.stack } : {})
      } : undefined 
    }, { status: 500 });
  }
}
