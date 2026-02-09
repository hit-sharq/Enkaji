// Enhanced Shipping Utility Functions for Enkaji
// Supports multiple zones, providers, and delivery options

import type {
  ShippingZone,
  ShippingProvider,
  ShippingService,
  ShippingOption,
  ShippingQuoteRequest,
  ShippingQuote,
  ShippingCalculation,
  ShippingRate,
} from "@/types/shipping"
import {
  SHIPPING_ZONES,
  SHIPPING_PROVIDERS,
  SHIPPING_SERVICES,
  INSURANCE_RATES,
  COD_FEES,
  VOLUMETRIC_FACTOR,
  WEIGHT_DISCOUNTS,
  FREE_SHIPPING_THRESHOLDS,
} from "@/lib/shipping-config"

// ============================================================================
// ZONE DETECTION
// ============================================================================

export function detectShippingZone(country: string, city: string): ShippingZone {
  const normalizedCountry = country.trim().toLowerCase()
  const normalizedCity = city.trim().toLowerCase()

  // Check Nairobi first
  const nairobiZone = SHIPPING_ZONES.find(z => z.id === "nairobi")
  if (nairobiZone) {
    const isNairobiCity = nairobiZone.cities.some(
      c => c.toLowerCase() === normalizedCity || normalizedCity.includes(c.toLowerCase())
    )
    if (isNairobiCity || normalizedCity.includes("nairobi")) {
      return nairobiZone
    }
  }

  // Check by country
  for (const zone of SHIPPING_ZONES) {
    if (zone.countries.length > 0 && zone.id !== "nairobi") {
      const isMatch = zone.countries.some(
        c => c.toLowerCase() === normalizedCountry || normalizedCountry.includes(c.toLowerCase())
      )
      if (isMatch) {
        // Check if it's Kenya but not Nairobi (urban or rural)
        if (zone.id === "east-africa" || zone.id === "international") {
          return zone
        }
        // For Kenya, return urban zone by default
        return SHIPPING_ZONES.find(z => z.id === "kenya-urban") || zone
      }
    }
  }

  // Default to international for unknown destinations
  return SHIPPING_ZONES.find(z => z.id === "international") || SHIPPING_ZONES[SHIPPING_ZONES.length - 1]
}

// ============================================================================
// WEIGHT CALCULATIONS
// ============================================================================

export function calculateVolumetricWeight(
  actualWeight: number,
  length: number = 30,
  width: number = 20,
  height: number = 10,
  factor: number = VOLUMETRIC_FACTOR.standard
): number {
  // Volumetric weight in kg = (L x W x H in cm) / factor
  const volume = length * width * height
  const volumetricWeight = volume / factor
  return Math.max(actualWeight, volumetricWeight)
}

export function calculateTotalWeight(items: Array<{ weight: number; quantity: number }>): number {
  return items.reduce((total, item) => total + item.weight * item.quantity, 0)
}

export function getWeightDiscount(weight: number): number {
  const tier = WEIGHT_DISCOUNTS.find(t => weight >= t.minWeight && weight < t.maxWeight)
  return tier?.discount || 0
}

// ============================================================================
// SHIPPING CALCULATION
// ============================================================================

export function calculateShippingCost(
  weight: number,
  zone: ShippingZone,
  service: ShippingService,
  options?: {
    orderValue?: number
    isCod?: boolean
    insuranceEnabled?: boolean
  }
): ShippingRate {
  const { orderValue = 0, isCod = false, insuranceEnabled = false } = options || {}

  // Base price
  let base = service.basePrice

  // Weight charge (with discount for bulk)
  const weightDiscount = getWeightDiscount(weight)
  const weightCharge = weight * service.pricePerKg * (1 - weightDiscount)

  // Subtotal
  let subtotal = base + weightCharge

  // Free shipping check
  const freeShipping = FREE_SHIPPING_THRESHOLDS[zone.id as keyof typeof FREE_SHIPPING_THRESHOLDS]
  if (freeShipping && orderValue >= freeShipping.threshold && weight <= freeShipping.maxWeight) {
    subtotal = 0
  }

  // Insurance
  let insurance = 0
  if (insuranceEnabled && orderValue > 0) {
    const rate = INSURANCE_RATES.standard.rate
    insurance = Math.max(orderValue * rate, INSURANCE_RATES.standard.minPremium)
  }

  // COD fee
  let codFee = 0
  if (isCod && service.codSupported) {
    const codTier = COD_FEES.rates.find(t => orderValue <= t.maxOrderValue)
    codFee = codTier?.fee || 100
  }

  // Total
  const total = subtotal + insurance + codFee

  return {
    serviceId: service.id,
    subtotal,
    insurance,
    codFee,
    total,
    breakdown: {
      base,
      weightCharge: Math.round(weightCharge * 100) / 100,
      insurance,
      cod: codFee,
    },
  }
}

// ============================================================================
// SHIPPING OPTIONS
// ============================================================================

export function getShippingOptions(
  zone: ShippingZone,
  weight: number,
  orderValue: number = 0,
  options?: {
    includeCod?: boolean
    maxTransitDays?: number
  }
): ShippingOption[] {
  const { includeCod = true, maxTransitDays } = options || {}

  // Filter services for this zone
  let services = SHIPPING_SERVICES.filter(s => s.zoneIds.includes(zone.id))

  // Filter by weight
  services = services.filter(s => weight >= s.minWeight && weight <= s.maxWeight)

  // Filter COD if not requested
  if (!includeCod) {
    services = services.filter(s => !s.codSupported)
  }

  // Filter by transit days
  if (maxTransitDays) {
    services = services.filter(s => s.transitDays.max <= maxTransitDays)
  }

  // Sort by price
  services.sort((a, b) => {
    const priceA = a.basePrice + weight * a.pricePerKg
    const priceB = b.basePrice + weight * b.pricePerKg
    return priceA - priceB
  })

  // Build options with provider info
  return services.map(service => {
    const provider = SHIPPING_PROVIDERS.find(p => p.id === service.providerId)
    const cost = calculateShippingCost(weight, zone, service, { orderValue })
    
    const now = new Date()
    const minDate = new Date(now)
    const maxDate = new Date(now)
    
    // Add transit days
    if (service.transitDays.min === 0) {
      // Same-day
      maxDate.setHours(maxDate.getHours() + 12)
    } else {
      minDate.setDate(minDate.getDate() + service.transitDays.min)
      maxDate.setDate(maxDate.getDate() + service.transitDays.max)
    }

    return {
      id: service.id,
      provider: provider!,
      service,
      price: cost.total,
      estimatedDelivery: {
        min: minDate,
        max: maxDate,
      },
      formattedDelivery: formatTransitDays(service.transitDays),
    }
  })
}

// ============================================================================
// QUOTE GENERATION
// ============================================================================

export function generateShippingQuote(request: ShippingQuoteRequest): ShippingQuote {
  const { items, destination, cod } = request

  // Calculate total weight
  const totalWeight = calculateTotalWeight(
    items.map(i => ({ weight: i.weight, quantity: 1 }))
  )

  // Calculate order value
  const orderValue = items.reduce((sum, i) => sum + i.value, 0)

  // Detect zone
  const zone = detectShippingZone(destination.country, destination.city)

  // Get shipping options
  const options = getShippingOptions(zone, totalWeight, orderValue, {
    includeCod: cod || false,
  })

  // Find recommended (cheapest non-express option)
  const recommended = options.length > 0 
    ? options.find(o => o.service.serviceCode === 'STANDARD' || o.service.serviceCode === 'ECONOMY')?.id 
      || options[0].id
    : ''

  return {
    options,
    recommended,
    zone,
  }
}

// ============================================================================
// FORMAT UTILITIES
// ============================================================================

export function formatTransitDays(transit: { min: number; max: number }): string {
  if (transit.min === 0 && transit.max === 1) {
    return "Same day"
  }
  if (transit.min === transit.max) {
    return `${transit.min} business day${transit.min > 1 ? 's' : ''}`
  }
  return `${transit.min}-${transit.max} business days`
}

export function formatShippingDate(date: Date): string {
  return date.toLocaleDateString('en-KE', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function formatShippingPrice(price: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

// ============================================================================
// VALIDATION
// ============================================================================

export function isCodAvailable(orderValue: number, zone: ShippingZone): boolean {
  if (orderValue < COD_FEES.threshold.minOrderValue) return false
  if (orderValue > COD_FEES.threshold.maxOrderValue) return false
  
  // COD only available in Kenya
  const kenyaZones = ['nairobi', 'kenya-urban', 'kenya-rural']
  return kenyaZones.includes(zone.id)
}

export function isFreeShippingAvailable(orderValue: number, weight: number, zone: ShippingZone): boolean {
  const thresholds = FREE_SHIPPING_THRESHOLDS[zone.id as keyof typeof FREE_SHIPPING_THRESHOLDS]
  if (!thresholds) return false
  
  return orderValue >= thresholds.threshold && weight <= thresholds.maxWeight
}

// ============================================================================
// TRACKING
// ============================================================================

export function generateTrackingNumber(providerId: string): string {
  const prefix = providerId.toUpperCase().slice(0, 3)
  const random = Math.random().toString(36).substring(2, 10).toUpperCase()
  const timestamp = Date.now().toString(36).toUpperCase()
  return `${prefix}${random}${timestamp}`.substring(0, 12)
}

export function getTrackingUrl(providerId: string, trackingNumber: string): string {
  const provider = SHIPPING_PROVIDERS.find(p => p.id === providerId)
  if (!provider) return ''
  return `${provider.trackingUrl}${trackingNumber}`
}

// ============================================================================
// LEGACY EXPORTS (for backward compatibility)
// ============================================================================

export interface LegacyShippingTier {
  minWeight: number
  maxWeight: number
  cost: number
  name: string
}

export interface LegacyShippingZone {
  name: string
  countries: string[]
  tiers: LegacyShippingTier[]
}

// Keep old format for backward compatibility
export const SHIPPING_TIERS: LegacyShippingTier[] = SHIPPING_SERVICES
  .filter(s => s.zoneIds.includes('nairobi'))
  .map(s => ({
    minWeight: s.minWeight,
    maxWeight: s.maxWeight,
    cost: s.basePrice,
    name: s.name,
  }))

export const LEGACY_SHIPPING_ZONES: LegacyShippingZone[] = [
  {
    name: "Kenya",
    countries: ["Kenya", "KE"],
    tiers: SHIPPING_SERVICES.filter(s => s.zoneIds.includes('nairobi') || s.zoneIds.includes('kenya-urban')).map(s => ({
      minWeight: s.minWeight,
      maxWeight: s.maxWeight,
      cost: s.basePrice,
      name: s.name,
    })),
  },
]

// Old function aliases for backward compatibility
// These use the legacy format from the original shipping.ts
import { formatWeight } from "@/lib/shipping"

// Re-export old format for backward compatibility
export function getShippingZone(country: string): LegacyShippingZone {

  const zone = detectShippingZone(country, '')
  return {
    name: zone.displayName,
    countries: zone.countries,
    tiers: SHIPPING_SERVICES
      .filter(s => s.zoneIds.includes(zone.id))
      .map(s => ({
        minWeight: s.minWeight,
        maxWeight: s.maxWeight,
        cost: s.basePrice,
        name: s.name,
      })),
  }
}

export function calculateShippingCostLegacy(
  totalWeight: number,
  country: string = "Kenya"
): { cost: number; tier: LegacyShippingTier; zone: LegacyShippingZone } {
  const zone = detectShippingZone(country, '')
  const services = SHIPPING_SERVICES.filter(s => s.zoneIds.includes(zone.id))
  
  // Find appropriate tier
  let tier: LegacyShippingTier | undefined
  for (const service of services) {
    if (totalWeight >= service.minWeight && totalWeight <= service.maxWeight) {
      tier = {
        minWeight: service.minWeight,
        maxWeight: service.maxWeight,
        cost: service.basePrice + totalWeight * service.pricePerKg,
        name: service.name,
      }
      break
    }
  }
  
  if (!tier) {
    tier = {
      minWeight: 0,
      maxWeight: Infinity,
      cost: services[services.length - 1]?.basePrice || 1000,
      name: services[services.length - 1]?.name || 'Custom',
    }
  }

  return {
    cost: tier.cost,
    tier,
    zone: {
      name: zone.displayName,
      countries: zone.countries,
      tiers: [],
    },
  }
}

