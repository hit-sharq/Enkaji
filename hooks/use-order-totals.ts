"use client"

import { useMemo } from "react"

export interface OrderTotalsInput {
  items: Array<{
    price: number
    quantity: number
    weight?: number
  }>
  shippingCost?: number
  discountAmount?: number
  insuranceEnabled?: boolean
  taxRate?: number
}

export interface OrderTotals {
  subtotal: number
  totalWeight: number
  tax: number
  shipping: number
  insurance: number
  discount: number
  grandTotal: number
}

const INSURANCE_RATE = 0.02 // 2% of order value
const MIN_INSURANCE_FEE = 100
const DEFAULT_TAX_RATE = 0.16 // 16% VAT included in product prices

export function calculateOrderTotals({
  items,
  shippingCost = 0,
  discountAmount = 0,
  insuranceEnabled = false,
  taxRate = DEFAULT_TAX_RATE,
}: OrderTotalsInput): OrderTotals {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalWeight = items.reduce(
    (sum, item) => sum + (item.weight || 0) * item.quantity,
    0
  )

  // Tax is already included in the product price — extract the VAT component for display only
  const tax = taxRate > 0 ? subtotal - subtotal / (1 + taxRate) : 0
  const insurance = insuranceEnabled
    ? Math.max(MIN_INSURANCE_FEE, subtotal * INSURANCE_RATE)
    : 0

  const grandTotal = Math.max(0, subtotal + shippingCost + insurance - discountAmount)

  return {
    subtotal,
    totalWeight,
    tax,
    shipping: shippingCost,
    insurance,
    discount: discountAmount,
    grandTotal,
  }
}

export function useOrderTotals(input: OrderTotalsInput): OrderTotals {
  return useMemo(() => calculateOrderTotals(input), [
    input.items,
    input.shippingCost,
    input.discountAmount,
    input.insuranceEnabled,
    input.taxRate,
  ])
}

