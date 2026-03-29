export interface RFQItem {
  productName: string
  quantity: number
  specifications: string
}

export interface Quote {
  id: string
  sellerName: string
  businessName: string
  quoteAmount: number
  deliveryDays: number
  notes: string
}

// Add other types as needed
export type UserRole = 'BUYER' | 'SELLER' | 'ARTISAN' | 'ADMIN'
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED'

