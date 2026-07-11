import { WhatsAppButton } from "@/components/ui/whatsapp-button"
import { AddToCartButton } from "@/components/cart/add-to-cart-button"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, MapPin, Package, Globe, Mail } from "lucide-react"
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
            where: {
              isActive: true,
              // Show all active products on seller's page (not just shop-approved ones)
            },
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
  const isVerified = seller.sellerProfile?.isVerified

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

        {/* Dark hero band */}
        <section className="bg-enkaji-ink rounded-2xl p-8 md:p-12 mb-8">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden border border-enkaji-gold/30 flex-shrink-0">
              <Image
                src={seller.imageUrl || "/placeholder-user.jpg"}
                alt={businessName}
                fill
                className="object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <span className="enkaji-eyebrow">Seller</span>
                {isVerified && (
                  <Badge className="border border-enkaji-gold/30 bg-enkaji-gold/10 text-enkaji-gold text-xs">
                    Verified
                  </Badge>
                )}
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-semibold text-enkaji-ivory mb-3">
                {businessName}
              </h1>
              {seller.sellerProfile?.businessType && (
                <p className="text-enkaji-ivory/60 mb-4">{seller.sellerProfile.businessType}</p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-enkaji-ivory/70">
                {seller.sellerProfile?.location && (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-enkaji-gold" />
                    <span>{seller.sellerProfile.location}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Package className="w-4 h-4 mr-2 text-enkaji-gold" />
                  <span>{seller.products.length} products</span>
                </div>
                {seller.email && (
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-enkaji-gold" />
                    <a href={`mailto:${seller.email}`} className="text-enkaji-gold hover:underline">
                      {seller.email}
                    </a>
                  </div>
                )}
                {seller.sellerProfile?.website && (
                  <div className="flex items-center">
                    <Globe className="w-4 h-4 mr-2 text-enkaji-gold" />
                    <a
                      href={seller.sellerProfile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-enkaji-gold hover:underline"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </div>

              {seller.sellerProfile?.description && (
                <p className="text-enkaji-ivory/60 leading-relaxed mt-4 max-w-2xl">
                  {seller.sellerProfile.description}
                </p>
              )}
            </div>
          </div>
        </section>

        <div className="mb-8">
          <h2 className="font-display text-2xl font-semibold text-foreground mb-6">Products</h2>

          {seller.products.length === 0 ? (
            <div className="text-center py-12 bg-card border border-enkaji-gold/20 rounded-xl">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No products yet</h3>
              <p className="text-muted-foreground">This seller hasn't listed any products yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {seller.products.map((product) => (
                <Card key={product.id} className="overflow-hidden border border-enkaji-gold/20 bg-card rounded-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                  <div className="aspect-square relative overflow-hidden">
                    <Image
                      src={product.images[0] || "/placeholder.jpg"}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-display font-medium text-foreground mb-2 line-clamp-2">{product.name}</h3>
                    {product.category && (
                      <Badge variant="outline" className="mb-2 text-xs border-enkaji-gold/20">
                        {product.category.name}
                      </Badge>
                    )}
                    <p className="text-lg font-semibold text-enkaji-gold mb-3">KSh {Number(product.price).toLocaleString()}</p>
                    <div className="space-y-2">
                      <Link href={`/products/${product.id}`}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full border-enkaji-gold/30 text-enkaji-gold hover:bg-enkaji-gold/10 bg-transparent"
                        >
                          View Product
                        </Button>
                      </Link>
                      <AddToCartButton
                        productId={product.id}
                        productName={product.name}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Dark CTA band */}
        <section className="bg-enkaji-ink rounded-2xl p-8 text-center">
          <h3 className="font-display text-xl font-semibold text-enkaji-ivory mb-4">
            Interested in {businessName}?
          </h3>
          <p className="text-enkaji-ivory/60 mb-6">
            Get in touch with this seller to discuss your business needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {seller.email && (
              <Button asChild className="bg-enkaji-gold hover:bg-enkaji-gold/90 text-enkaji-ink font-semibold">
                <a href={`mailto:${seller.email}`}>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email
                </a>
              </Button>
            )}
            <Button
              variant="outline"
              asChild
              className="border-enkaji-gold/50 text-enkaji-gold hover:bg-enkaji-gold/10 bg-transparent"
            >
              <a href={`https://wa.me/254700000000?text=Hi, I'm interested in your products on Enkaji Trade Kenya`}>
                <Package className="w-4 h-4 mr-2" />
                WhatsApp
              </a>
            </Button>
          </div>
        </section>
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
