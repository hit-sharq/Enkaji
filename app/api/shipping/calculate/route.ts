import { type NextRequest, NextResponse } from "next/server"
import { generateShippingQuote, isCodAvailable, isFreeShippingAvailable, formatShippingDate } from "@/lib/shipping-enhanced"
import { detectShippingZone } from "@/lib/shipping-enhanced"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { 
      items, 
      destination,
      cod = false,
      calculateAll = false 
    } = body

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Items are required" },
        { status: 400 }
      )
    }

    if (!destination || !destination.country) {
      return NextResponse.json(
        { error: "Destination is required" },
        { status: 400 }
      )
    }

    // Calculate total weight and value
    const totalWeight = items.reduce(
      (sum: number, item: any) => sum + (item.weight || 0) * (item.quantity || 1),
      0
    )
    const orderValue = items.reduce(
      (sum: number, item: any) => sum + (item.price || 0) * (item.quantity || 1),
      0
    )

    // Detect shipping zone
    const zone = detectShippingZone(
      destination.country,
      destination.city || ""
    )

    // Generate quote
    const quote = generateShippingQuote({
      items,
      destination,
      cod,
    })

    // Check COD availability
    const codAvailable = isCodAvailable(orderValue, zone)
    
    // Check free shipping
    const freeShippingAvailable = isFreeShippingAvailable(orderValue, totalWeight, zone)

    // Calculate totals
    const subtotal = orderValue
    const recommendedOption = quote.options.find(o => o.id === quote.recommended)
    const shippingCost = recommendedOption?.price || 0
    const tax = Math.round(subtotal * 0.16) // 16% VAT
    const finalTotal = subtotal + shippingCost + tax

    return NextResponse.json({
      success: true,
      data: {
        zone: {
          id: zone.id,
          name: zone.displayName,
          region: zone.region,
        },
        totals: {
          subtotal,
          totalWeight: Math.round(totalWeight * 100) / 100,
          orderValue,
          shipping: shippingCost,
          tax,
          finalTotal,
          currency: "KES",
        },
        shipping: {
          options: quote.options.map(opt => ({
            id: opt.id,
            provider: {
              id: opt.provider.id,
              name: opt.provider.name,
              logo: opt.provider.logo,
              description: opt.provider.description,
            },
            service: {
              id: opt.service.id,
              name: opt.service.name,
              description: opt.service.description,
              transitDays: opt.service.transitDays,
            },
            price: opt.price,
            formattedPrice: `KES ${opt.price.toLocaleString()}`,
            formattedDelivery: opt.formattedDelivery,
            estimatedDelivery: {
              min: formatShippingDate(opt.estimatedDelivery.min),
              max: formatShippingDate(opt.estimatedDelivery.max),
            },
            isRecommended: opt.id === quote.recommended,
            codSupported: opt.service.codSupported,
          })),
          recommendedId: quote.recommended,
          codAvailable,
          freeShippingAvailable,
        },
        meta: {
          calculatedAt: new Date().toISOString(),
          currency: "KES",
        },
      },
    })
  } catch (error) {
    console.error("Shipping calculation error:", error)
    return NextResponse.json(
      { 
        error: "Failed to calculate shipping",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

// GET endpoint for pre-cached shipping rates
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const country = searchParams.get("country") || "Kenya"
  const city = searchParams.get("city") || ""
  const weight = parseFloat(searchParams.get("weight") || "1")
  const orderValue = parseFloat(searchParams.get("value") || "0")

  try {
    const zone = detectShippingZone(country, city)
    
    // Import dynamically to use new function
    const { getShippingOptions } = await import("@/lib/shipping-enhanced")
    
    const options = getShippingOptions(zone, weight, orderValue)

    return NextResponse.json({
      success: true,
      data: {
        zone: {
          id: zone.id,
          name: zone.displayName,
        },
        weight,
        orderValue,
        options: options.map(opt => ({
          id: opt.id,
          name: opt.service.name,
          description: opt.service.description,
          price: opt.price,
          formattedPrice: `KES ${opt.price.toLocaleString()}`,
          formattedDelivery: opt.formattedDelivery,
          provider: opt.provider.name,
        })),
      },
    })
  } catch (error) {
    console.error("Shipping lookup error:", error)
    return NextResponse.json(
      { error: "Failed to get shipping options" },
      { status: 500 }
    )
  }
}

