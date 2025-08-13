import { prisma } from "@/lib/db"
import { SellerGrid } from "@/components/sellers/seller-grid"
import { SellerFilters } from "@/components/sellers/seller-filters"
import { Search, Users, MapPin, TrendingUp } from "lucide-react"
import { Suspense } from "react"
import type { Prisma } from "@prisma/client"

interface Seller {
  id: string
  firstName: string | null
  lastName: string | null
  imageUrl: string | null
  sellerProfile: {
    businessName: string | null
    description: string | null
    location: string | null
    businessType: string | null
    website: string | null
    isVerified: boolean
  } | null
  products: {
    id: string
    name: string
    price: number
    images: string[]
  }[]
  _count: {
    products: number
  }
}

async function getSellers(searchParams: any) {
  const { search, location, businessType, verified } = searchParams

  // Build the where clause properly with Prisma types
  const whereClause: Prisma.UserWhereInput = {
    role: "SELLER",
    sellerProfile: {
      isNot: null,
    },
  }

  // Build sellerProfile conditions
  const sellerProfileConditions: Prisma.SellerProfileWhereInput = {}

  // Add location filter if provided and not "All Locations"
  if (location && location !== "All Locations") {
    sellerProfileConditions.location = {
      contains: location,
      mode: "insensitive",
    }
  }

  // Add business type filter if provided and not "All Types"
  if (businessType && businessType !== "All Types") {
    sellerProfileConditions.businessType = businessType
  }

  // Add verification filter if true
  if (verified === "true") {
    sellerProfileConditions.isVerified = true
  }

  // Apply sellerProfile conditions if any exist
  if (Object.keys(sellerProfileConditions).length > 0) {
    whereClause.sellerProfile = {
      ...whereClause.sellerProfile as any,
      ...sellerProfileConditions,
    }
  }

  // Add search filter if provided
  if (search) {
    whereClause.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { sellerProfile: { businessName: { contains: search, mode: "insensitive" } } },
    ]
  }

  const sellers = await prisma.user.findMany({
    where: whereClause,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      imageUrl: true,
      sellerProfile: {
        select: {
          businessName: true,
          description: true,
          location: true,
          businessType: true,
          website: true,
          isVerified: true,
        },
      },
      products: {
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          price: true,
          images: true,
        },
        take: 6,
      },
      _count: {
        select: {
          products: true,
        },
      },
    },
    orderBy: [{ sellerProfile: { isVerified: "desc" } }, { createdAt: "desc" }],
  })

  // Convert Decimal to number for price
  const sellersWithNumberPrice: Seller[] = sellers.map((seller) => ({
    ...seller,
    products: seller.products.map((product) => ({
      ...product,
      price: Number(product.price),
    })),
    sellerProfile: seller.sellerProfile
      ? {
          businessName: seller.sellerProfile.businessName,
          description: seller.sellerProfile.description,
          location: seller.sellerProfile.location,
          businessType: seller.sellerProfile.businessType,
          website: seller.sellerProfile.website,
          isVerified: seller.sellerProfile.isVerified,
        }
      : null,
  }))

  return sellersWithNumberPrice
}

async function getSellerStats() {
  const [totalSellers, verifiedSellers, locations, businessTypes] = await Promise.all([
    // Count total sellers
    prisma.user.count({
      where: {
        role: "SELLER",
        sellerProfile: { isNot: null },
      },
    }),
    // Count verified sellers - need to use sellerProfile count instead
    prisma.sellerProfile.count({
      where: {
        isVerified: true,
      },
    }),
    // Get unique locations
    prisma.sellerProfile.groupBy({
      by: ["location"],
      where: {
        location: { not: "" },
      },
      _count: true,
    }),
    // Get unique business types
    prisma.sellerProfile.groupBy({
      by: ["businessType"],
      where: {
        businessType: { not: "" },
      },
      _count: true,
    }),
  ])

  return {
    totalSellers,
    verifiedSellers,
    locations: locations.length,
    businessTypes: businessTypes.length,
  }
}

export default async function SellersPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const sellers = await getSellers(searchParams)
  const stats = await getSellerStats()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <a 
            href="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 group"
          >
            <svg 
              className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 19l-7-7 7-7" 
              />
            </svg>
            Back to Home
          </a>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Discover Trusted Suppliers</h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              Connect with verified businesses across Kenya for all your procurement needs
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-6 h-6 text-blue-200 mr-2" />
                  <span className="text-3xl font-bold">{stats.totalSellers}</span>
                </div>
                <p className="text-blue-200">Total Suppliers</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="w-6 h-6 text-green-300 mr-2" />
                  <span className="text-3xl font-bold">{stats.verifiedSellers}</span>
                </div>
                <p className="text-blue-200">Verified</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <MapPin className="w-6 h-6 text-blue-200 mr-2" />
                  <span className="text-3xl font-bold">{stats.locations}</span>
                </div>
                <p className="text-blue-200">Locations</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Search className="w-6 h-6 text-blue-200 mr-2" />
                  <span className="text-3xl font-bold">{stats.businessTypes}</span>
                </div>
                <p className="text-blue-200">Categories</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <Suspense fallback={<div className="h-96 bg-white rounded-lg animate-pulse" />}>
              <SellerFilters />
            </Suspense>
          </div>

          {/* Sellers Grid */}
          <div className="lg:w-3/4">
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{sellers.length} Suppliers Found</h2>
                  {searchParams.search && <p className="text-gray-600 mt-1">Results for "{searchParams.search}"</p>}
                </div>
              </div>
            </div>

            <Suspense
              fallback={
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg h-96 animate-pulse" />
                  ))}
                </div>
              }
            >
              <SellerGrid sellers={sellers} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
