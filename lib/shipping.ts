// Weight-based shipping calculation utility

export interface ShippingTier {
  minWeight: number
  maxWeight: number
  cost: number
  name: string
}

export interface ShippingZone {
  name: string
  countries: string[]
  tiers: ShippingTier[]
}

export const SHIPPING_ZONES: ShippingZone[] = [
  {
    name: "Kenya",
    countries: ["Kenya", "KE"],
    tiers: [
      { minWeight: 0, maxWeight: 1, cost: 300, name: "Light Package" },
      { minWeight: 1, maxWeight: 5, cost: 500, name: "Standard Package" },
      { minWeight: 5, maxWeight: 10, cost: 800, name: "Heavy Package" },
      { minWeight: 10, maxWeight: Number.POSITIVE_INFINITY, cost: 1200, name: "Extra Heavy Package" },
    ],
  },
  {
    name: "East Africa",
    countries: [
      "Uganda",
      "Tanzania",
      "Rwanda",
      "Burundi",
      "South Sudan",
      "Ethiopia",
      "Somalia",
      "DRC",
      "UG",
      "TZ",
      "RW",
      "BI",
      "SS",
      "ET",
      "SO",
      "CD",
    ],
    tiers: [
      { minWeight: 0, maxWeight: 1, cost: 1500, name: "Light Package" },
      { minWeight: 1, maxWeight: 5, cost: 3000, name: "Standard Package" },
      { minWeight: 5, maxWeight: 10, cost: 5500, name: "Heavy Package" },
      { minWeight: 10, maxWeight: 20, cost: 8500, name: "Extra Heavy Package" },
      { minWeight: 20, maxWeight: Number.POSITIVE_INFINITY, cost: 12000, name: "Bulk Package" },
    ],
  },
  {
    name: "Worldwide",
    countries: [], // Default for all other countries
    tiers: [
      { minWeight: 0, maxWeight: 1, cost: 3500, name: "Light Package" },
      { minWeight: 1, maxWeight: 5, cost: 8000, name: "Standard Package" },
      { minWeight: 5, maxWeight: 10, cost: 15000, name: "Heavy Package" },
      { minWeight: 10, maxWeight: 20, cost: 25000, name: "Extra Heavy Package" },
      { minWeight: 20, maxWeight: Number.POSITIVE_INFINITY, cost: 35000, name: "Bulk Package" },
    ],
  },
]

// Legacy export for backward compatibility
export const SHIPPING_TIERS: ShippingTier[] = SHIPPING_ZONES[0].tiers

export function getShippingZone(country: string): ShippingZone {
  const normalizedCountry = country.trim()

  for (const zone of SHIPPING_ZONES) {
    if (
      zone.countries.some(
        (c) =>
          c.toLowerCase() === normalizedCountry.toLowerCase() ||
          c.toLowerCase().includes(normalizedCountry.toLowerCase()) ||
          normalizedCountry.toLowerCase().includes(c.toLowerCase()),
      )
    ) {
      return zone
    }
  }

  // Default to worldwide shipping
  return SHIPPING_ZONES[2] // Worldwide zone
}

export function calculateShippingCost(
  totalWeight: number,
  country = "Kenya",
): { cost: number; tier: ShippingTier; zone: ShippingZone } {
  console.log("[v0] Calculating shipping for weight:", totalWeight, "country:", country)
  const zone = getShippingZone(country)
  console.log("[v0] Selected zone:", zone.name)

  const tier =
    zone.tiers.find((tier) => totalWeight >= tier.minWeight && totalWeight <= tier.maxWeight) ||
    zone.tiers[zone.tiers.length - 1]

  console.log("[v0] Selected tier:", tier.name, "for weight:", totalWeight)
  return { cost: tier.cost, tier, zone }
}

export function formatWeight(weight: number): string {
  if (weight < 1) {
    return `${(weight * 1000).toFixed(0)}g`
  }
  return `${weight.toFixed(1)}kg`
}
