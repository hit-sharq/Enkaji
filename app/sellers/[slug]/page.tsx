import { WhatsAppButton } from "@/components/ui/whatsapp-button"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, MapPin, Package, Globe, Mail, Phone } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { db } from "@/lib/db"

async function getSellerBySlug(slug: string) {
  // First find the sellerProfile by slug, then get the user
  const sellerProfile = await db.sellerProfile.findUnique({
    where: { slug },
    include: {
      user: {
        include: {
          products: {
            where: { isActive: true },
            include: {
              category: true,
            },
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  })

  if (!sellerProfile || sellerProfile.user.role !== "SELLER") {
    return null
  }

  const { user, ...profile } = sellerProfile

  return {
    ...user,
    sellerProfile: profile,
  }
}

export default async function SellerStorePage({ params }: { params: { slug: string } }) {
  const seller = await getSellerBySlug(params.slug)

  if (!seller) {
    notFound()
  }

  const businessName = seller.sellerProfile?.businessName || `${seller.firstName} ${seller.lastName}`
  const sellerSlug = seller.sellerProfile?.slug || seller.id

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/sellers">
            <Button variant="outline" className="mb-4 bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sellers
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-shrink-0">
              <div className="w-32 h-32 relative overflow-hidden rounded-lg">
                <Image
                  src={seller.imageUrl || "/placeholder-user.jpg"}
                  alt={businessName}
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            <div className="flex-1">
              <h1 className="font-playfair text-3xl font-bold text-gray-900 mb-2">{businessName}</h1>

              {seller.sellerProfile?.businessType && (
                <Badge variant="secondary" className="mb-4">
                  {seller.sellerProfile.businessType}
                </Badge>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {seller.sellerProfile?.location && (
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{seller.sellerProfile.location}</span>
                  </div>
                )}


                <div className="flex items-center text-gray-600">
                  <Package className="w-4 h-4 mr-2" />
                  <span>{seller.products.length} products</span>
                </div>

                {seller.email && (
                  <div className="flex items-center text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    <a href={`mailto:${seller.email}`} className="text-blue-600 hover:underline">
                      {seller.email}
                    </a>
                  </div>
                )}

                {seller.sellerProfile?.website ? (
                  <div className="flex items-center text-gray-600">
                    <Globe className="w-4 h-4 mr-2" />
                    <a
                      href={seller.sellerProfile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Visit Website
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center text-gray-600">
                    <Globe className="w-4 h-4 mr-2" />
                    <Link
                      href={`/sellers/${sellerSlug}`}
                      className="text-blue-600 hover:underline"
                    >
                      View Store on Enkaji
                    </Link>
                  </div>
                )}
              </div>

              {seller.sellerProfile?.description && (
                <p className="text-gray-600 leading-relaxed">{seller.sellerProfile.description}</p>
              )}
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="font-playfair text-2xl font-bold text-gray-900 mb-6">Products</h2>

          {seller.products.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No products yet</h3>
              <p className="text-gray-600">This seller hasn't listed any products yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {seller.products.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square relative overflow-hidden">
                    <Image
                      src={product.images[0] || "/placeholder.jpg"}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                    {product.category && (
                      <Badge variant="outline" className="mb-2 text-xs">
                        {product.category.name}
                      </Badge>
                    )}
                    <p className="text-lg font-bold text-orange-600 mb-3">KSh {product.price.toLocaleString()}</p>
                    <Link href={`/products/${product.id}`}>
                      <Button size="sm" className="w-full">
                        View Product
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="bg-orange-50 rounded-lg p-8 text-center">
          <h3 className="font-playfair text-xl font-bold text-gray-900 mb-4">Interested in {businessName}?</h3>
          <p className="text-gray-600 mb-6">Get in touch with this seller to discuss your business needs.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {seller.email && (
              <Button asChild>
                <a href={`mailto:${seller.email}`}>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email
                </a>
              </Button>
            )}
            <Button variant="outline" asChild>
              <a href={`https://wa.me/254700000000?text=Hi, I'm interested in your products on Enkaji Trade Kenya`}>
                <Phone className="w-4 h-4 mr-2" />
                WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </main>
      <WhatsAppButton />
    </div>
  )
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const seller = await getSellerBySlug(params.slug)

  if (!seller) {
    return {
      title: "Seller Not Found",
    }
  }

  const businessName = seller.sellerProfile?.businessName || `${seller.firstName} ${seller.lastName}`

  return {
    title: `${businessName} - Enkaji Trade Kenya`,
    description: seller.sellerProfile?.description || `Shop products from ${businessName} on Enkaji Trade Kenya`,
  }
}
