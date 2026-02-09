<!-- # Custom Shipping System Implementation Plan

## Overview
Build a robust shipping system for Enkaji that supports multiple providers, delivery options, and real-time calculations.

## Files to Create/Modify

### 1. New Files to Create:
- `lib/shipping-config.ts` - Shipping configuration with all providers and rates
- `types/shipping.ts` - TypeScript interfaces for shipping
- `app/api/shipping/calculate/route.ts` - API endpoint for real-time shipping quotes
- `components/checkout/shipping-options.tsx` - Shipping options selection component

### 2. Files to Modify:
- `lib/shipping.ts` - Enhance with new shipping system
- `components/checkout/checkout-form.tsx` - Add shipping options selection
- `components/cart/cart-summary.tsx` - Show shipping estimates
- `prisma/schema.prisma` - Add shipping fields to order

## Features to Implement

### 1. Shipping Zones
- Nairobi Metropolitan
- Kenya (Other Cities)
- East Africa (Uganda, Tanzania, Rwanda, Burundi, Ethiopia, South Sudan)
- International

### 2. Delivery Options
- Standard (5-7 days)
- Express (2-3 days)
- Same-Day (Nairobi only)
- Economy (Regional)

### 3. Providers
- G4S (Primary domestic)
- DHL (International)
- Sendy (Urban)
- Posta Kenya (Rural/economic)

### 4. Weight Calculation
- Actual weight vs volumetric weight
- Multi-tier pricing
- Bulk discounts

### 5. Additional Features
- Insurance calculation (1-3% of order value)
- COD support
- Tracking number generation
- Shipping notifications

## Implementation Steps

### Step 1: Create Shipping Types
```typescript
// types/shipping.ts
export interface ShippingZone {
  id: string
  name: string
  countries: string[]
  cities: string[]
}

export interface ShippingProvider {
  id: string
  name: string
  logo: string
  zones: string[]
  services: ShippingService[]
}

export interface ShippingService {
  id: string
  name: string
  description: string
  transitDays: { min: number; max: number }
  basePrice: number
  pricePerKg: number
  minWeight: number
  maxWeight: number
  codSupported: boolean
  insuranceRequired: boolean
}
```

### Step 2: Create Shipping Config
```typescript
// lib/shipping-config.ts
export const SHIPPING_ZONES = [...]
export const SHIPPING_PROVIDERS = [...]
export const SHIPPING_SERVICES = [...]
```

### Step 3: Create API Route
```typescript
// app/api/shipping/calculate/route.ts
POST - Calculate shipping options based on destination and cart
```

### Step 4: Update Components
- Add shipping options to checkout
- Show estimated delivery dates
- Calculate totals including shipping

## Estimated Shipping Costs

### Nairobi Metropolitan
| Weight | Standard | Express | Same-Day |
|--------|----------|---------|----------|
| 0-1kg | KES 250 | KES 450 | KES 600 |
| 1-5kg | KES 450 | KES 700 | KES 900 |
| 5-10kg | KES 700 | KES 1,100 | KES 1,400 |
| 10-20kg | KES 1,000 | KES 1,500 | - |

### Kenya Other Cities
| Weight | Standard | Express |
|--------|----------|---------|
| 0-1kg | KES 400 | KES 700 |
| 1-5kg | KES 650 | KES 1,000 |
| 5-10kg | KES 1,000 | KES 1,500 |

### East Africa Regional
| Weight | Economy | Express |
|--------|---------|---------|
| 0-1kg | KES 1,500 | KES 2,500 |
| 1-5kg | KES 2,500 | KES 4,000 |
| 5-10kg | KES 4,500 | KES 7,000 |

### International
| Weight | Economy | Express |
|--------|---------|---------|
| 0.5kg | $35 | $55 |
| 1kg | $50 | $75 |
| 2kg | $75 | $110 |
| 5kg | $150 | $220 |

---

## Ready to Implement
Once you confirm, I'll create:
1. `types/shipping.ts` - TypeScript interfaces
2. `lib/shipping-config.ts` - Complete shipping configuration
3. `lib/shipping.ts` - Enhanced shipping utility functions
4. `app/api/shipping/calculate/route.ts` - Real-time shipping API
5. `components/checkout/shipping-options.tsx` - Shipping options component
 -->
