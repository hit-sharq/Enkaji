// Types for Enkaji Mobile App - Mirrors the web app's types

// User Types
export interface User {
  id: string
  clerkId: string
  email: string
  firstName: string | null
  lastName: string | null
  imageUrl: string | null
  role: UserRole
  isActive: boolean
  createdAt: string
  updatedAt: string
  sellerProfile?: SellerProfile | null
  artisanProfile?: ArtisanProfile | null
}

export type UserRole = 
  | 'BUYER' 
  | 'SELLER' 
  | 'ARTISAN' 
  | 'ADMIN' 
  | 'MODERATOR' 
  | 'SUPPORT_AGENT' 
  | 'CONTENT_MANAGER' 
  | 'FINANCE_MANAGER' 
  | 'REGIONAL_MANAGER'

// Seller Profile
export interface SellerProfile {
  id: string
  userId: string
  businessName: string
  businessType: string
  description: string | null
  location: string
  phone: string
  website: string | null
  taxId: string | null
  isVerified: boolean
  createdAt: string
  updatedAt: string
}

// Artisan Profile
export interface ArtisanProfile {
  id: string
  userId: string
  bio: string | null
  skills: string[]
  experience: number | null
  location: string | null
  phone: string | null
  website: string | null
  socialMedia: Record<string, string> | null
  isApproved: boolean
  createdAt: string
  updatedAt: string
}

// Category
export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  parentId: string | null
  children?: Category[]
  createdAt: string
  updatedAt: string
}

// Product
export interface Product {
  id: string
  name: string
  description: string
  price: number
  comparePrice: number | null
  sku: string | null
  inventory: number
  images: string[]
  categoryId: string
  category: Category
  sellerId: string
  seller: User
  tags: string[]
  specifications: Record<string, string> | null
  isActive: boolean
  isFeatured: boolean
  weight: number | null
  dimensions: Dimensions | null
  shippingClass: string | null
  createdAt: string
  updatedAt: string
  avgRating?: number
  _count?: {
    reviews: number
  }
}

export interface Dimensions {
  length: number
  width: number
  height: number
}

// Product Lite (for listings)
export interface ProductLite {
  id: string
  name: string
  price: number
  images: string[]
  category: {
    name: string
  }
  _count: {
    reviews: number
  }
}

// Cart Item
export interface CartItem {
  id: string
  userId: string
  productId: string
  product: Product
  quantity: number
  createdAt: string
  updatedAt: string
}

// Order
export interface Order {
  id: string
  orderNumber: string
  userId: string
  user: User
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: string | null
  paymentIntentId: string | null
  subtotal: number
  tax: number
  shipping: number
  total: number
  currency: string
  shippingAddress: Address
  billingAddress: Address | null
  trackingNumber: string | null
  estimatedDelivery: string | null
  deliveredAt: string | null
  createdAt: string
  updatedAt: string
  items: OrderItem[]
}

export type OrderStatus = 
  | 'PENDING' 
  | 'CONFIRMED' 
  | 'PROCESSING' 
  | 'SHIPPED' 
  | 'DELIVERED' 
  | 'CANCELLED' 
  | 'REFUNDED'

export type PaymentStatus = 
  | 'PENDING' 
  | 'PAID' 
  | 'FAILED' 
  | 'REFUNDED' 
  | 'PARTIALLY_REFUNDED'

// Order Item
export interface OrderItem {
  id: string
  orderId: string
  productId: string
  product: Product
  quantity: number
  price: number
  total: number
}

// Address
export interface Address {
  firstName: string
  lastName: string
  address1: string
  address2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phone: string
}

// Favorite
export interface Favorite {
  id: string
  userId: string
  productId: string
  product: Product
  createdAt: string
}

// Review
export interface Review {
  id: string
  userId: string
  user: User
  productId: string
  product: Product
  rating: number
  title: string | null
  comment: string | null
  images: string[]
  isVerified: boolean
  isFlagged: boolean
  helpfulCount: number
  createdAt: string
  updatedAt: string
}

// Blog Post
export interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  featuredImage: string | null
  authorId: string
  author: User
  status: PostStatus
  tags: string[]
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export type PostStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

// RFQ (Request for Quote)
export interface RFQ {
  id: string
  title: string
  description: string
  category: string
  quantity: number
  budget: number | null
  deadline: string | null
  location: string | null
  userId: string
  user: User
  status: RFQStatus
  createdAt: string
  updatedAt: string
}

export type RFQStatus = 'OPEN' | 'CLOSED' | 'EXPIRED'

// Bulk Order
export interface BulkOrder {
  id: string
  title: string
  description: string | null
  userId: string
  user: User
  status: BulkOrderStatus
  totalAmount: number | null
  createdAt: string
  updatedAt: string
  items: BulkOrderItem[]
}

export type BulkOrderStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED'

// Bulk Order Item
export interface BulkOrderItem {
  id: string
  bulkOrderId: string
  productId: string
  product: Product
  quantity: number
  unitPrice: number
  totalPrice: number
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Form Types
export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface CreateProductData {
  name: string
  description: string
  price: number
  comparePrice?: number
  sku?: string
  inventory: number
  images: string[]
  categoryId: string
  tags?: string[]
  specifications?: Record<string, string>
  weight?: number
  dimensions?: Dimensions
  shippingClass?: string
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string
}

export interface CreateOrderData {
  items: Array<{
    productId: string
    quantity: number
  }>
  shippingAddress: Address
  paymentMethod: string
}

export interface CreateReviewData {
  productId: string
  rating: number
  title?: string
  comment?: string
  images?: string[]
}

// Filter Types
export interface ProductFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  search?: string
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular'
  sellerId?: string
}

// Stats Types
export interface DashboardStats {
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  totalFavorites: number
}

// Auth Context Type
export interface AuthUser {
  id: string
  clerkId: string
  email: string
  firstName: string | null
  lastName: string | null
  imageUrl: string | null
  role: UserRole
}

