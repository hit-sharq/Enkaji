# Shipping Fees Guide

## Overview

Enkaji provides comprehensive shipping services across Kenya, East Africa, and worldwide. This guide documents our shipping fee structure, calculation methods, and integration details.

---

## Shipping Zones

### 1. Nairobi Metropolitan (nairobi)
**Coverage:** Nairobi city and major towns
- Nairobi County
- Mombasa, Kisumu, Nakuru, Eldoret, Thika
- Ruiru, Kiambu, Ruaka, Kikuyu, Kilimani, Westlands, Karen, Langata, Embakasi, Kasarani, Dagoretti

**Transit Times:**
- Economy: 7-14 business days
- Standard: 5-7 business days
- Express: 2-3 business days
- Same-Day: Within 12 hours

**Free Shipping:** Available on orders ≥ KES 10,000 (max weight: 10kg)

### 2. Kenya - Other Cities (kenya-urban)
**Coverage:** Major Kenyan cities outside Nairobi
- All urban centers in Kenya

**Transit Times:**
- Economy: 7-14 business days
- Standard: 5-7 business days
- Express: 2-3 business days

**Free Shipping:** Available on orders ≥ KES 15,000 (max weight: 10kg)

### 3. Kenya - Rural Areas (kenya-rural)
**Coverage:** Rural and remote areas in Kenya

**Transit Times:**
- Standard: 7-14 business days

**Free Shipping:** Available on orders ≥ KES 20,000 (max weight: 5kg)

### 4. East Africa (east-africa)
**Coverage:**
- Uganda, Tanzania, Rwanda, Burundi, South Sudan
- Ethiopia, Somalia, DRC, Eritrea, Djibouti

**Transit Times:**
- Economy: 7-14 business days
- Express: 3-5 business days
- Freight: 10-21 business days (50kg+)

**Free Shipping:** Available on orders ≥ KES 100,000 (max weight: 20kg)

### 5. Worldwide (international)
**Coverage:** All other countries

**Transit Times:**
- Economy: 10-21 business days
- Express: 2-4 business days
- Priority: 1-2 business days

**Free Shipping:** Available on orders ≥ KES 500,000 (max weight: 10kg)

---

## Fee Structure

### Nairobi Metropolitan

| Service | Base Price | Per Kg | COD Fee | Max Weight | Transit Time |
|---------|-----------|---------|---------|------------|--------------|
| Economy | KES 150 | KES 30/kg | Not Available | 20kg | 7-14 days |
| Standard | KES 250 | KES 50/kg | KES 100-350 | 50kg | 5-7 days |
| Express | KES 450 | KES 80/kg | KES 100-350 | 50kg | 2-3 days |
| Same-Day | KES 600 | KES 100/kg | KES 100-350 | 25kg | Same day |

### Kenya - Other Cities

| Service | Base Price | Per Kg | COD Fee | Max Weight | Transit Time |
|---------|-----------|---------|---------|------------|--------------|
| Standard | KES 400 | KES 60/kg | KES 100-350 | 50kg | 5-7 days |
| Express | KES 700 | KES 100/kg | KES 100-350 | 50kg | 2-3 days |

### Kenya - Rural Areas

| Service | Base Price | Per Kg | COD Fee | Max Weight | Transit Time |
|---------|-----------|---------|---------|------------|--------------|
| Standard | KES 500 | KES 80/kg | Not Available | 20kg | 7-14 days |

### East Africa

| Service | Base Price | Per Kg | COD Fee | Max Weight | Transit Time |
|---------|-----------|---------|---------|------------|--------------|
| Economy | KES 1,500 | KES 300/kg | Not Available | 100kg | 7-14 days |
| Express | KES 2,500 | KES 500/kg | Not Available | 100kg | 3-5 days |
| Freight | KES 5,000 | KES 200/kg | Not Available | 500kg | 10-21 days |

### Worldwide

| Service | Base Price | Per Kg | COD Fee | Max Weight | Transit Time |
|---------|-----------|---------|---------|------------|--------------|
| Economy | KES 5,000 | KES 1,500/kg | Not Available | 100kg | 10-21 days |
| Express | KES 8,000 | KES 2,500/kg | Not Available | 100kg | 2-4 days |
| Priority | KES 12,000 | KES 3,500/kg | Not Available | 50kg | 1-2 days |

---

## Calculation Formula

### Shipping Cost
```
Total Shipping Cost = Base Price + (Weight × Price Per Kg) - Weight Discount + Insurance + COD Fee
```

### Weight Discount
Bulk weight discounts apply automatically:

| Weight Range | Discount |
|-------------|----------|
| 0-5 kg | 0% |
| 5-10 kg | 5% |
| 10-20 kg | 10% |
| 20-50 kg | 15% |
| 50+ kg | 20% |

### Volumetric Weight
For large but lightweight packages:
```
Volumetric Weight (kg) = (Length × Width × Height in cm) / 5000
```
**Actual weight is used if it's heavier than volumetric weight.**

### Insurance
- **Rate:** 2% of declared value
- **Minimum:** KES 50
- **Maximum Coverage:** KES 100,000

### COD Fees
| Order Value | COD Fee |
|-------------|---------|
| ≤ KES 5,000 | KES 100 |
| ≤ KES 10,000 | KES 150 |
| ≤ KES 25,000 | KES 250 |
| ≤ KES 50,000 | KES 350 |

**COD is only available for orders between KES 1,000 and KES 50,000 within Kenya.**

---

## Integration Guide

### API Endpoint

**Calculate Shipping Options**
```
POST /api/shipping/calculate
```

**Request Body:**
```json
{
  "items": [
    {
      "id": "product-123",
      "weight": 2.5,
      "quantity": 3,
      "value": 15000
    }
  ],
  "destination": {
    "country": "Kenya",
    "city": "Nairobi",
    "state": "Nairobi County"
  },
  "cod": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "zone": {
      "id": "nairobi",
      "name": "Nairobi Metropolitan",
      "region": "nairobi"
    },
    "totals": {
      "subtotal": 15000,
      "totalWeight": 7.5,
      "orderValue": 15000,
      "shipping": 500,
      "tax": 2400,
      "finalTotal": 17900,
      "currency": "KES"
    },
    "shipping": {
      "options": [
        {
          "id": "nairobi-standard",
          "provider": {
            "id": "g4s",
            "name": "G4S Kenya"
          },
          "service": {
            "id": "nairobi-standard",
            "name": "Standard Delivery",
            "transitDays": {"min": 5, "max": 7}
          },
          "price": 500,
          "formattedPrice": "KES 500",
          "formattedDelivery": "5-7 business days",
          "estimatedDelivery": {
            "min": "2024-01-15",
            "max": "2024-01-17"
          },
          "isRecommended": true,
          "codSupported": true
        }
      ],
      "recommendedId": "nairobi-standard",
      "codAvailable": true,
      "freeShippingAvailable": false
    }
  }
}
```

### Web Implementation

```tsx
import { useState, useEffect } from 'react'
import { ShippingOptions } from '@/components/checkout/shipping-options'

function CheckoutPage() {
  const [shippingDestination, setShippingDestination] = useState({
    country: '',
    city: '',
    state: ''
  })
  const [shippingCost, setShippingCost] = useState(0)
  const [selectedShippingId, setSelectedShippingId] = useState('')

  const handleShippingSelect = (optionId: string, price: number) => {
    setSelectedShippingId(optionId)
    setShippingCost(price)
  }

  const handleDestinationChange = (destination: {
    country: string
    city: string
    state?: string
  }) => {
    setShippingDestination(destination)
    setSelectedShippingId('')
    setShippingCost(0)
  }

  return (
    <ShippingOptions
      destination={shippingDestination}
      cartItems={cartItems}
      selectedShippingId={selectedShippingId}
      onShippingSelect={handleShippingSelect}
      onCodChange={setIsCodEnabled}
      isCodEnabled={isCodEnabled}
    />
  )
}
```

### Mobile Implementation (React Native)

```tsx
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

function CheckoutScreen() {
  const [shippingCost, setShippingCost] = useState(0)

  useEffect(() => {
    const fetchShipping = async () => {
      try {
        const response = await api.calculateShipping({
          items: items.map((item) => ({
            id: item.productId,
            weight: item.product?.weight || 0.5,
            quantity: item.quantity,
            value: (item.product?.price || 0) * item.quantity,
          })),
          destination: {
            country: shippingAddress.country,
            city: shippingAddress.city,
            state: shippingAddress.state,
          },
        })
        
        if (response?.success && response.data?.shipping?.options) {
          const recommended = response.data.shipping.options.find(
            (o: any) => o.isRecommended
          )
          setShippingCost(recommended?.price || 
            response.data.shipping.options[0].price)
        }
      } catch (error) {
        console.error('Shipping calculation error:', error)
      }
    }

    if (shippingAddress.city && shippingAddress.country) {
      fetchShipping()
    }
  }, [shippingAddress, items])

  return (
    // Your checkout UI
  )
}
```

---

## Example Calculations

### Example 1: Nairobi Standard Delivery
- **Items:** 3 items × 2kg each = 6kg total
- **Order Value:** KES 10,000
- **Service:** Standard Delivery
- **Calculation:**
  - Base Price: KES 250
  - Weight Charge: 6kg × KES 50 = KES 300
  - Total: KES 250 + KES 300 = **KES 550**

### Example 2: East Africa Express
- **Items:** 1 item × 15kg
- **Order Value:** KES 150,000
- **Service:** Express
- **Calculation:**
  - Base Price: KES 2,500
  - Weight Charge: 15kg × KES 500 = KES 7,500
  - Total: KES 2,500 + KES 7,500 = **KES 10,000**
  - **Free Shipping Applies!** (order ≥ KES 100,000) → **KES 0**

### Example 3: Nairobi Same-Day with COD
- **Items:** 5 items × 0.5kg each = 2.5kg
- **Order Value:** KES 8,000
- **Service:** Same-Day Delivery
- **COD:** Yes
- **Calculation:**
  - Base Price: KES 600
  - Weight Charge: 2.5kg × KES 100 = KES 250
  - COD Fee: KES 150 (order ≤ KES 10,000)
  - Total: KES 600 + KES 250 + KES 150 = **KES 1,000**

---

## Common Issues & Solutions

### Issue: Shipping Not Calculating
**Solution:**
- Verify destination city and country are provided
- Check that items array is not empty
- Ensure item weights are specified (defaults to 0.5kg)

### Issue: Wrong Shipping Zone Detected
**Solution:**
- Verify city name spelling
- Check that Nairobi metropolitan cities are correctly identified
- Use exact country names (e.g., "Kenya" not "Republic of Kenya")

### Issue: Free Shipping Not Applying
**Solution:**
- Verify order value meets threshold for the zone
- Check that total weight is within free shipping limit
- Ensure zone ID matches (e.g., "nairobi" not "Nairobi")

### Issue: COD Not Available
**Solution:**
- Verify order value is between KES 1,000 and KES 50,000
- Check that destination is within Kenya
- Confirm items in cart support COD

---

## Testing

### Test Scenarios

1. **Nairobi - Small Order**
   - Items: 2 items × 1kg = 2kg
   - Value: KES 5,000
   - Expected: Standard = KES 450 (250 + 2×100)

2. **Nairobi - Free Shipping Eligible**
   - Items: 5 items × 1kg = 5kg
   - Value: KES 15,000
   - Expected: **Free Shipping**

3. **Mombasa - Urban Zone**
   - Items: 1 item × 3kg
   - Value: KES 8,000
   - Expected: Standard = KES 580 (400 + 3×60)

4. **Kampala - East Africa**
   - Items: 2 items × 10kg = 20kg
   - Value: KES 200,000
   - Expected: **Free Shipping** (200k > 100k threshold)

5. **London - International**
   - Items: 1 item × 5kg
   - Value: KES 50,000
   - Expected: Economy = KES 12,500 (5k + 5×1.5k)

---

## Support

For shipping-related issues:

1. Check this guide for common solutions
2. Review API response for error messages
3. Verify zone detection is correct
4. Contact support@enkaji.co.ke

---

## Related Documentation

- [Shipping Types](./types/shipping.ts) - TypeScript definitions
- [Shipping Config](./lib/shipping-config.ts) - Zone and service configuration
- [Shipping Utilities](./lib/shipping-enhanced.ts) - Calculation functions
- [API Routes](./app/api/shipping/calculate/route.ts) - API implementation

---

**Last Updated:** May 2026  
**Version:** 2.0  
**Status:** ✅ **ACTIVE**