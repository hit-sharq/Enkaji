import { prisma } from "@/lib/db"
import { SellerGrid } from "@/components/sellers/seller-grid"

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

export default async function SellersPage() {
  const sellers = await prisma.user.findMany({
    where: {
      role: "SELLER",
      sellerProfile: {
        isNot: null,
      },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      imageUrl: true,
      sellerProfile: {
        select: {
          id: true,
          businessName: true,
          description: true,
          location: true,
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
      },
      _count: {
        select: {
          products: true,
        },
      },
    },
  })

  // Convert Decimal to number for price and transform sellerProfile
  const sellersWithNumberPrice: Seller[] = sellers.map(seller => ({
    ...seller,
    products: seller.products.map(product => ({
      ...product,
      price: Number(product.price),
    })),
    sellerProfile: seller.sellerProfile ? {
      businessName: seller.sellerProfile.businessName,
      description: seller.sellerProfile.description,
      location: seller.sellerProfile.location,
      businessType: null,
      website: null,
    } : null,
  }))

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Our Sellers</h1>
      <SellerGrid sellers={sellersWithNumberPrice} />
    </div>
  )
}
