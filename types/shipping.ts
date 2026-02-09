// Shipping Types for Enkaji E-commerce Platform

export interface ShippingZone {
  id: string
  name: string
  displayName: string
  countries: string[]
  cities: string[]
  region: 'nairobi' | 'kenya' | 'east-africa' | 'international'
}

export interface ShippingProvider {
  id: string
  name: string
  logo: string
  description: string
  trackingUrl: string
  contactPhone: string
}

export interface ShippingService {
  id: string
  providerId: string
  name: string
  description: string
  serviceCode: string // e.g., 'STANDARD', 'EXPRESS', 'SAME_DAY'
  transitDays: { min: number; max: number }
  basePrice: number
  pricePerKg: number
  codSupported: boolean
  minWeight: number
  maxWeight: number
  zoneIds: string[]
}

export interface ShippingOption {
  id: string
  provider: ShippingProvider
  service: ShippingService
  price: number
  estimatedDelivery: {
    min: Date
    max: Date
  }
  formattedDelivery: string // e.g., "2-3 business days"
}

export interface ShippingQuoteRequest {
  items: Array<{
    id: string
    weight: number
    value: number
  }>
  destination: {
    country: string
    city: string
    state?: string
    postalCode?: string
    isRural?: boolean
  }
  cod?: boolean // Cash on delivery
}

export interface ShippingQuote {
  options: ShippingOption[]
  recommended: string // id of recommended option
  zone: ShippingZone
}

export interface ShippingCalculation {
  weight: number
  volume?: number
  zone: ShippingZone
  service: ShippingService
  insurance?: {
    enabled: boolean
    rate: number
    value: number
  }
  cod?: {
    enabled: boolean
    fee: number
  }
}

export interface ShippingRate {
  serviceId: string
  subtotal: number
  insurance: number
  codFee: number
  total: number
  breakdown: {
    base: number
    weightCharge: number
    insurance: number
    cod: number
  }
}

export const SHIPPING_ZONE_IDS = {
  NAIROBI: 'nairobi',
  KENYA_URBAN: 'kenya-urban',
  KENYA_RURAL: 'kenya-rural',
  EAST_AFRICA: 'east-africa',
  INTERNATIONAL: 'international',
} as const

export const SHIPPING_SERVICE_CODES = {
  STANDARD: 'STANDARD',
  EXPRESS: 'EXPRESS',
  SAME_DAY: 'SAME_DAY',
  ECONOMY: 'ECONOMY',
  FREIGHT: 'FREIGHT',
} as const

