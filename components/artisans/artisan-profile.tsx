import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, MapPin } from "lucide-react"
import type { Artisan } from "@/lib/types"

export function ArtisanProfile({
  artisan,
}: {
  artisan: Artisan
}) {
  const fullName = `${artisan.firstName ?? ""} ${artisan.lastName ?? ""}`.trim()
  const avatar = artisan.imageUrl || "/placeholder.svg?height=96&width=96"

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Image
                  src={avatar || "/placeholder.svg"}
                  alt={fullName || "Seller"}
                  width={96}
                  height={96}
                  className="rounded-full object-cover"
                />
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">{fullName || "Verified Seller"}</h1>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{artisan.sellerProfile?.location || "Kenya"}</span>
                  </div>
                  {artisan.sellerProfile?.isVerified && (
                    <div className="flex items-center gap-1 text-green-600 mt-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-sm">Verified Seller</span>
                    </div>
                  )}
                </div>
              </div>

              {artisan.sellerProfile?.businessName && (
                <p className="mt-4 text-sm text-gray-700">
                  <span className="font-medium">Business:</span> {artisan.sellerProfile.businessName}
                </p>
              )}

              {artisan.sellerProfile?.description && (
                <p className="mt-3 text-gray-700">{artisan.sellerProfile.description}</p>
              )}

              <div className="mt-4 space-y-1 text-sm text-gray-700">
                {artisan.sellerProfile?.website && (
                  <p>
                    <span className="font-medium">Website:</span>{" "}
                    <a
                      className="text-blue-600 hover:underline"
                      href={artisan.sellerProfile.website}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {artisan.sellerProfile.website}
                    </a>
                  </p>
                )}
                {artisan.sellerProfile?.phoneNumber && (
                  <p>
                    <span className="font-medium">Phone:</span> {artisan.sellerProfile.phoneNumber}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="w-full md:w-2/3">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Products</h2>
          {artisan.products.length === 0 ? (
            <p className="text-gray-600">No products yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {artisan.products.map((p) => (
                <Card key={p.id} className="overflow-hidden">
                  <div className="aspect-square bg-gray-100">
                    <Image
                      src={p.images[0] || "/placeholder.svg?height=400&width=400&query=product-image"}
                      alt={p.name}
                      width={400}
                      height={400}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-gray-900">{p.name}</h3>
                    <p className="text-sm text-gray-600">{p.category.name}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-semibold text-gray-900">${p.price.toFixed(2)}</span>
                      <Badge variant="secondary">{p._count.reviews} reviews</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
