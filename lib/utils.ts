import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts Decimal objects to numbers for safe serialization
 * This is needed when passing data from Server Components to Client Components
 */
export function convertDecimalToNumber(value: any): number {
  if (value === null || value === undefined) return 0
  return Number(value)
}

/**
 * Converts Decimal objects in a product object to numbers
 */
export function convertProductDecimals(product: any): any {
  if (!product) return product
  
  return {
    ...product,
    price: convertDecimalToNumber(product.price),
    comparePrice: product.comparePrice ? convertDecimalToNumber(product.comparePrice) : null,
    weight: product.weight ? convertDecimalToNumber(product.weight) : null,
  }
}
