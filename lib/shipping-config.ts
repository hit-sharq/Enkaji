// Shipping Configuration for Enkaji
// Based on research of Kenyan and East African shipping providers

import type { ShippingZone, ShippingProvider, ShippingService } from "@/types/shipping"

// ============================================================================
// SHIPPING ZONES
// ============================================================================

export const SHIPPING_ZONES: ShippingZone[] = [
  {
    id: "nairobi",
    name: "nairobi",
    displayName: "Nairobi Metropolitan",
    countries: ["Kenya"],
    cities: [
      "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika",
      "Ruiru", "Kiambu", "Ruaka", "Kikuyu", "Kilimani", "Westlands",
      "Karen", "Langata", "Embakasi", "Kasarani", "Dagoretti",
      "Nairobi County", "Greater Nairobi"
    ],
    region: "nairobi",
  },
  {
    id: "kenya-urban",
    name: "kenya-urban",
    displayName: "Kenya - Other Cities",
    countries: ["Kenya"],
    cities: [],
    region: "kenya",
  },
  {
    id: "kenya-rural",
    name: "kenya-rural",
    displayName: "Kenya - Rural Areas",
    countries: ["Kenya"],
    cities: [],
    region: "kenya",
  },
  {
    id: "east-africa",
    name: "east-africa",
    displayName: "East Africa",
    countries: [
      "Uganda", "Tanzania", "Rwanda", "Burundi", "South Sudan", 
      "Ethiopia", "Somalia", "DRC", "Eritrea", "Djibouti"
    ],
    cities: [],
    region: "east-africa",
  },
  {
    id: "international",
    name: "international",
    displayName: "Worldwide",
    countries: [], // All other countries
    cities: [],
    region: "international",
  },
]

// ============================================================================
// SHIPPING PROVIDERS
// ============================================================================

export const SHIPPING_PROVIDERS: ShippingProvider[] = [
  {
    id: "g4s",
    name: "G4S Kenya",
    logo: "/providers/g4s.png",
    description: "Leading security and logistics company in Kenya",
    trackingUrl: "https://track.g4s.co.ke/track/",
    contactPhone: "+254 733 600 600",
  },
  {
    id: "dhl",
    name: "DHL Express",
    logo: "/providers/dhl.png",
    description: "Global express shipping leader",
    trackingUrl: "https://www.dhl.com/track",
    contactPhone: "+254 733 100 100",
  },
  {
    id: "posta",
    name: "Posta Kenya",
    logo: "/providers/posta.png",
    description: "Kenya Postal Corporation - Widest rural coverage",
    trackingUrl: "https://www.posta.co.ke/track",
    contactPhone: "+254 20 324 4000",
  },
  {
    id: "sendy",
    name: "Sendy",
    logo: "/providers/sendy.png",
    description: "East African logistics platform",
    trackingUrl: "https://www.sendy.co.ke/track",
    contactPhone: "+254 700 739 000",
  },
  {
    id: "fedex",
    name: "FedEx",
    logo: "/providers/fedex.png",
    description: "International express delivery",
    trackingUrl: "https://www.fedex.com/tracking",
    contactPhone: "+254 20 375 0000",
  },
]

// ============================================================================
// SHIPPING SERVICES
// ============================================================================

export const SHIPPING_SERVICES: ShippingService[] = [
  // ---------------- NAIROBI SERVICES ----------------
  {
    id: "nairobi-standard",
    providerId: "g4s",
    name: "Standard Delivery",
    description: "Reliable delivery within 5-7 business days",
    serviceCode: "STANDARD",
    transitDays: { min: 5, max: 7 },
    basePrice: 250,
    pricePerKg: 50,
    codSupported: true,
    minWeight: 0,
    maxWeight: 50,
    zoneIds: ["nairobi"],
  },
  {
    id: "nairobi-express",
    providerId: "g4s",
    name: "Express Delivery",
    description: "Fast delivery within 2-3 business days",
    serviceCode: "EXPRESS",
    transitDays: { min: 2, max: 3 },
    basePrice: 450,
    pricePerKg: 80,
    codSupported: true,
    minWeight: 0,
    maxWeight: 50,
    zoneIds: ["nairobi"],
  },
  {
    id: "nairobi-same-day",
    providerId: "sendy",
    name: "Same-Day Delivery",
    description: "Delivery within Nairobi today",
    serviceCode: "SAME_DAY",
    transitDays: { min: 0, max: 1 },
    basePrice: 600,
    pricePerKg: 100,
    codSupported: true,
    minWeight: 0,
    maxWeight: 25,
    zoneIds: ["nairobi"],
  },
  {
    id: "nairobi-economy",
    providerId: "posta",
    name: "Economy",
    description: "Budget-friendly delivery",
    serviceCode: "ECONOMY",
    transitDays: { min: 7, max: 14 },
    basePrice: 150,
    pricePerKg: 30,
    codSupported: false,
    minWeight: 0,
    maxWeight: 20,
    zoneIds: ["nairobi", "kenya-urban", "kenya-rural"],
  },

  // ---------------- KENYA URBAN SERVICES ----------------
  {
    id: "kenya-standard",
    providerId: "g4s",
    name: "Standard Delivery",
    description: "Reliable delivery within 5-7 business days",
    serviceCode: "STANDARD",
    transitDays: { min: 5, max: 7 },
    basePrice: 400,
    pricePerKg: 60,
    codSupported: true,
    minWeight: 0,
    maxWeight: 50,
    zoneIds: ["kenya-urban"],
  },
  {
    id: "kenya-express",
    providerId: "g4s",
    name: "Express Delivery",
    description: "Fast delivery within 2-3 business days",
    serviceCode: "EXPRESS",
    transitDays: { min: 2, max: 3 },
    basePrice: 700,
    pricePerKg: 100,
    codSupported: true,
    minWeight: 0,
    maxWeight: 50,
    zoneIds: ["kenya-urban"],
  },

  // ---------------- KENYA RURAL SERVICES ----------------
  {
    id: "kenya-rural-standard",
    providerId: "posta",
    name: "Standard Delivery",
    description: "Delivery to rural areas within 7-14 business days",
    serviceCode: "STANDARD",
    transitDays: { min: 7, max: 14 },
    basePrice: 500,
    pricePerKg: 80,
    codSupported: false,
    minWeight: 0,
    maxWeight: 20,
    zoneIds: ["kenya-rural"],
  },

  // ---------------- EAST AFRICA SERVICES ----------------
  {
    id: "east-africa-economy",
    providerId: "dhl",
    name: "Economy",
    description: "Cost-effective regional shipping",
    serviceCode: "ECONOMY",
    transitDays: { min: 7, max: 14 },
    basePrice: 1500,
    pricePerKg: 300,
    codSupported: false,
    minWeight: 0,
    maxWeight: 100,
    zoneIds: ["east-africa"],
  },
  {
    id: "east-africa-express",
    providerId: "dhl",
    name: "Express",
    description: "Fast regional delivery",
    serviceCode: "EXPRESS",
    transitDays: { min: 3, max: 5 },
    basePrice: 2500,
    pricePerKg: 500,
    codSupported: false,
    minWeight: 0,
    maxWeight: 100,
    zoneIds: ["east-africa"],
  },
  {
    id: "east-africa-freight",
    providerId: "g4s",
    name: "Freight",
    description: "For large shipments",
    serviceCode: "FREIGHT",
    transitDays: { min: 10, max: 21 },
    basePrice: 5000,
    pricePerKg: 200,
    codSupported: false,
    minWeight: 50,
    maxWeight: 500,
    zoneIds: ["east-africa"],
  },

  // ---------------- INTERNATIONAL SERVICES ----------------
  {
    id: "intl-economy",
    providerId: "dhl",
    name: "Economy",
    description: "Affordable international shipping",
    serviceCode: "ECONOMY",
    transitDays: { min: 10, max: 21 },
    basePrice: 5000, // KES equivalent
    pricePerKg: 1500,
    codSupported: false,
    minWeight: 0,
    maxWeight: 100,
    zoneIds: ["international"],
  },
  {
    id: "intl-express",
    providerId: "dhl",
    name: "Express Worldwide",
    description: "Fast international delivery",
    serviceCode: "EXPRESS",
    transitDays: { min: 2, max: 4 },
    basePrice: 8000, // KES equivalent
    pricePerKg: 2500,
    codSupported: false,
    minWeight: 0,
    maxWeight: 100,
    zoneIds: ["international"],
  },
  {
    id: "intl-priority",
    providerId: "fedex",
    name: "Priority Overnight",
    description: "Next business day delivery",
    serviceCode: "EXPRESS",
    transitDays: { min: 1, max: 2 },
    basePrice: 12000, // KES equivalent
    pricePerKg: 3500,
    codSupported: false,
    minWeight: 0,
    maxWeight: 50,
    zoneIds: ["international"],
  },
]

// ============================================================================
// INSURANCE RATES
// ============================================================================

export const INSURANCE_RATES = {
  standard: {
    rate: 0.02, // 2% of declared value
    minPremium: 50, // KES
    maxValue: 100000, // KES - coverage limit
  },
  premium: {
    rate: 0.03, // 3% of declared value
    minPremium: 100,
    maxValue: 500000,
  },
}

// ============================================================================
// COD FEES
// ============================================================================

export const COD_FEES = {
  threshold: {
    minOrderValue: 1000, // Orders below this don't support COD
    maxOrderValue: 50000, // COD not available above this
  },
  rates: [
    { maxOrderValue: 5000, fee: 100 },
    { maxOrderValue: 10000, fee: 150 },
    { maxOrderValue: 25000, fee: 250 },
    { maxOrderValue: 50000, fee: 350 },
  ],
}

// ============================================================================
// VOLUMETRIC WEIGHT CALCULATION
// ============================================================================

export const VOLUMETRIC_FACTOR = {
  standard: 5000, // kg to volumetric kg conversion
  express: 6000,
}

// ============================================================================
// WEIGHT TIERS (DISCOUNTS)
// ============================================================================

export const WEIGHT_DISCOUNTS = [
  { minWeight: 0, maxWeight: 5, discount: 0 },
  { minWeight: 5, maxWeight: 10, discount: 0.05 }, // 5% off
  { minWeight: 10, maxWeight: 20, discount: 0.1 }, // 10% off
  { minWeight: 20, maxWeight: 50, discount: 0.15 }, // 15% off
  { minWeight: 50, maxWeight: Infinity, discount: 0.2 }, // 20% off
]

// ============================================================================
// FREE SHIPPING THRESHOLDS
// ============================================================================

export const FREE_SHIPPING_THRESHOLDS = {
  nairobi: {
    threshold: 10000, // KES
    minWeight: 0,
    maxWeight: 10,
  },
  "kenya-urban": {
    threshold: 15000,
    minWeight: 0,
    maxWeight: 10,
  },
  "kenya-rural": {
    threshold: 20000,
    minWeight: 0,
    maxWeight: 5,
  },
  "east-africa": {
    threshold: 100000,
    minWeight: 0,
    maxWeight: 20,
  },
  international: {
    threshold: 500000,
    minWeight: 0,
    maxWeight: 10,
  },
}

