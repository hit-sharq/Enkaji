import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { Search, MapPin, Star, Verified, Users, Package } from "lucide-react"
import { db } from "@/lib/db"
import Image from "next/image"

export default async function SuppliersPage() {
  const suppliers = await db.user.findMany({
    where: {
      role: "SELLER",
      sellerProfile: {
        isVerified: true,
      },
    },
    include: {
      sellerProfile: true,
      products: {
        where: {
          isActive: true,
        },
        take: 3,
      },
      _count: {
        select: {
          products: {
            where: {
              isActive: true,
            },
          },
        },
      },
    },
    take: 12,
  })

  return (
    <div className="min-h-screen">
      <Header />

      <main>
        <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Verified Suppliers</h1>
              <p className="text-xl mb-8 opacity-90">
                Connect with thousands of trusted suppliers across Kenya. All suppliers are verified for quality and
                reliability.
              </p>

              <div className="bg-white rounded-lg p-6 shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input placeholder="Search suppliers..." className="pl-10 h-12 text-gray-900" />
                    </div>
                  </div>
                  <Select>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nairobi">Nairobi</SelectItem>
                      <SelectItem value="mombasa">Mombasa</SelectItem>
                      <SelectItem value="kisumu">Kisumu</SelectItem>
                      <SelectItem value="nakuru">Nakuru</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button className="h-12 bg-blue-600 hover:bg-blue-700">Search</Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">All Suppliers</h2>
                <p className="text-gray-600">{suppliers.length} verified suppliers found</p>
              </div>
              <Select>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="products">Most Products</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suppliers.map((supplier) => (
                <Link key={supplier.id} href={`/suppliers/${supplier.id}`}>
                  <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4 mb-4">
                        <div className="relative">
                          <Image
                            src={supplier.imageUrl || "/placeholder.svg?height=60&width=60&query=supplier-profile"}
                            alt={`${supplier.firstName ?? ""} ${supplier.lastName ?? ""}`}
                            width={60}
                            height={60}
                            className="rounded-full"
                          />
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <Verified className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {(supplier.firstName ?? "") + " " + (supplier.lastName ?? "")}
                          </h3>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <MapPin className="w-4 h-4 mr-1" />
                            {supplier.sellerProfile?.location || "Kenya"}
                          </div>
                          <div className="flex items-center mt-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                              ))}
                            </div>
                            <span className="text-sm text-gray-500 ml-2">5.0 (24 reviews)</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center justify-center mb-1">
                            <Package className="w-4 h-4 text-blue-600 mr-1" />
                            <span className="text-sm font-medium text-blue-600">Products</span>
                          </div>
                          <div className="text-lg font-bold text-gray-900">{supplier._count.products}</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center justify-center mb-1">
                            <Users className="w-4 h-4 text-green-600 mr-1" />
                            <span className="text-sm font-medium text-green-600">Orders</span>
                          </div>
                          <div className="text-lg font-bold text-gray-900">150+</div>
                        </div>
                      </div>

                      {supplier.sellerProfile?.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{supplier.sellerProfile.description}</p>
                      )}

                      {supplier.products.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Sample Products:</h4>
                          <div className="flex flex-wrap gap-1">
                            {supplier.products.slice(0, 3).map((product) => (
                              <Badge key={product.id} variant="secondary" className="text-xs">
                                {product.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          <Verified className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                        <Badge variant="outline">Fast Response</Badge>
                        <Badge variant="outline">Quality Assured</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {suppliers.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Suppliers Found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your search criteria or check back later.</p>
                <Button>Clear Filters</Button>
              </div>
            )}
          </div>
        </section>

        <section className="py-16 bg-blue-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Want to Become a Supplier?</h2>
              <p className="text-xl text-gray-600 mb-8">
                Join thousands of successful suppliers and grow your business with KenyaTrade
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/sign-up?type=supplier">
                  <Button className="bg-blue-600 hover:bg-blue-700 px-8 py-3">Register as Supplier</Button>
                </Link>
                <Button variant="outline" className="px-8 py-3 bg-transparent">
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
