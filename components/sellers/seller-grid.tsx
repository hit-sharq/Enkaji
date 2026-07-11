"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Package, ExternalLink, Shield, Building, Globe } from "lucide-react"

interface Seller {
  id: string
  firstName: string | null
  lastName: string | null
  imageUrl: string | null
  sellerProfile: {
    businessName: string | null
    slug: string | null
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

interface SellerGridProps {
  sellers: Seller[]
}

export function SellerGrid({ sellers }: SellerGridProps) {
  if (sellers.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-medium text-foreground mb-2">No sellers found</h3>
          <p className="text-muted-foreground mb-6">Try adjusting your filters or search terms to find more sellers.</p>
          <Button variant="outline" onClick={() => window.location.reload()} className="border-enkaji-gold/50 text-enkaji-gold hover:bg-enkaji-gold/10">
            Reset Filters
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {sellers.map((seller) => {
        const displayName =
          seller.sellerProfile?.businessName ||
          `${seller.firstName || ""} ${seller.lastName || ""}`.trim() ||
          "Unnamed Seller"

        const featuredProducts = seller.products.slice(0, 3)

        return (
          <Card key={seller.id} className="border border-enkaji-gold/20 bg-card rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Image
                      src={seller.imageUrl || "/placeholder.svg?height=48&width=48&query=business"}
                      alt={displayName}
                      width={48}
                      height={48}
                      className="rounded-full object-cover"
                    />
                    {seller.sellerProfile?.isVerified && (
                      <div className="absolute -bottom-1 -right-1 bg-enkaji-gold rounded-full p-1">
                        <Shield className="w-3 h-3 text-enkaji-ink" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-lg text-foreground truncate">{displayName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {seller.sellerProfile?.isVerified && (
                        <Badge variant="secondary" className="text-xs bg-enkaji-gold/10 text-enkaji-gold border border-enkaji-gold/20">
                          <Shield className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      {seller.sellerProfile?.businessType && (
                        <Badge variant="outline" className="text-xs border-enkaji-gold/20">
                          <Building className="w-3 h-3 mr-1" />
                          {seller.sellerProfile.businessType}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Location */}
              {seller.sellerProfile?.location && (
                <div className="flex items-center text-sm text-muted-foreground mt-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  {seller.sellerProfile.location}
                </div>
              )}

              {/* Description */}
              {seller.sellerProfile?.description && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{seller.sellerProfile.description}</p>
              )}
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Products Count */}
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center text-muted-foreground">
                  <Package className="w-4 h-4 mr-1" />
                  {seller._count.products} Products
                </span>
                {seller.sellerProfile?.website ? (
                  <a
                    href={seller.sellerProfile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-enkaji-gold hover:text-enkaji-gold/80"
                  >
                    <Globe className="w-4 h-4 mr-1" />
                    Website
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                ) : (
                  <Link
                    href={`/sellers/${(seller.sellerProfile?.slug ?? seller.id)}`}
                    className="flex items-center text-enkaji-gold hover:text-enkaji-gold/80"
                  >
                    <Globe className="w-4 h-4 mr-1" />
                    View Profile
                  </Link>
                )}
              </div>

              {/* Featured Products */}
              {featuredProducts.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Featured Products</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {featuredProducts.map((product) => (
                      <div key={product.id} className="group/product">
                        <div className="aspect-square relative rounded-lg overflow-hidden bg-muted">
                          <Image
                            src={product.images[0] || "/placeholder.svg?height=80&width=80&query=product"}
                            alt={product.name}
                            fill
                            className="object-cover group-hover/product:scale-105 transition-transform duration-200"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 truncate" title={product.name}>
                          {product.name}
                        </p>
                        <p className="text-xs font-medium text-foreground">KSh {product.price.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button asChild className="flex-1 bg-enkaji-gold hover:bg-enkaji-gold/90 text-enkaji-ink font-semibold">
                  <Link href={`/sellers/${(seller.sellerProfile?.slug ?? seller.id)}`}>View Profile</Link>
                </Button>
                <Button variant="outline" asChild className="border-enkaji-gold/50 text-enkaji-gold hover:bg-enkaji-gold/10">
                  <Link href={`/sellers/${(seller.sellerProfile?.slug ?? seller.id)}#products`}>
                    <Package className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
