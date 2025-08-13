// Shared type definitions to resolve type conflicts

export interface ProductLite {
  id: string
  name: string
  price: number
  images: string[]
  category: { name: string }
  _count: { reviews: number }
}

export interface SellerProfileLite {
  id: string
  businessName: string | null
  description: string | null
  location: string | null
  isVerified: boolean
  website: string | null
  phoneNumber: string | null
}

export interface Artisan {
  id: string
  firstName: string | null
  lastName: string | null
  imageUrl: string | null
  sellerProfile: SellerProfileLite | null
  products: ProductLite[]
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  imageUrl: string | null
  createdAt: Date
}

export interface Product {
  id: string
  name: string
  price: number
  images: string[]
  category: {
    name: string
    slug: string
  }
  seller: {
    id: string
    firstName: string | null
    lastName: string | null
    sellerProfile: {
      businessName: string | null
    } | null
  }
  avgRating: number
  _count: {
    reviews: number
  }
}

export interface Seller {
  id: string
  firstName: string | null
  lastName: string | null
  email: string
  imageUrl: string | null
  sellerProfile: {
    id: string
    businessName: string
    description: string | null
    location: string
    isVerified: boolean
    website: string | null
    phoneNumber: string | null
    businessType: string | null
  } | null
  products: Array<{
    id: string
    price: number
  }>
}
