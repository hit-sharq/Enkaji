import { notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import { ArtisanProfile } from "@/components/artisans/artisan-profile"

interface ProductLite {
  id: string
  name: string
  price: number
  images: string[]
  category: { name: string }
  _count: { reviews: number }
}

interface SellerProfileLite {
  id: string
  businessName: string
  description: string | null
  location: string
  phone: string
  isVerified: boolean
}

interface Artisan {
  id: string
  firstName: string | null
  lastName: string | null
  imageUrl: string | null
  sellerProfile: SellerProfileLite | null
  products: ProductLite[]
}

export default async function ArtisanPage({ params }: { params: { id: string } }) {
  const artisan = await prisma.user.findUnique({
    where: { id: params.id },
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
          phone: true,
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
          category: {
            select: {
              name: true,
            },
          },
          _count: {
            select: {
              reviews: true,
            },
          },
        },
      },
    },
  })

  if (!artisan) {
    notFound()
  }

  // Convert Decimal to number for price and ensure type compatibility
  const productsWithNumberPrice = artisan.products.map(product => ({
    id: product.id,
    name: product.name,
    price: Number(product.price),
    images: product.images,
    category: { name: product.category.name },
    _count: { reviews: product._count.reviews },
  }))

  const artisanData = {
    id: artisan.id,
    firstName: artisan.firstName,
    lastName: artisan.lastName,
    imageUrl: artisan.imageUrl,
    sellerProfile: artisan.sellerProfile ? {
      id: artisan.sellerProfile.id,
      businessName: artisan.sellerProfile.businessName,
      description: artisan.sellerProfile.description,
      location: artisan.sellerProfile.location,
      isVerified: artisan.sellerProfile.isVerified,
      website: null,
      phoneNumber: artisan.sellerProfile.phone,
    } : null,
    products: productsWithNumberPrice,
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ArtisanProfile artisan={artisanData} />
    </div>
  )
}
