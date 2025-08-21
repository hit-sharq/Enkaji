"use client"

import Image from "next/image"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Heart, ShoppingCart, Star, Minus, Plus, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ProductDetailsProps {
  product: {
    id: string
    name: string
    description: string
    price: number
    stock: number
    images: string[]
    category: {
      name: string
    }
    seller: {
      id: string
      firstName: string | null
      lastName: string | null
      imageUrl: string | null
      sellerProfile: {
        bio: string | null
        location: string | null
      } | null
    }
    reviews: Array<{
      id: string
      rating: number
      comment: string | null
      createdAt: Date
      user: {
        firstName: string | null
        lastName: string | null
        imageUrl: string | null
      }
    }>
    avgRating: number
    _count: {
      reviews: number
    }
  }
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleAddToCart = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          quantity,
        }),
      })

      if (response.ok) {
        toast({
          title: "Added to cart",
          description: `${quantity} ${product.name}(s) added to your cart.`,
        })
      } else {
        throw new Error("Failed to add to cart")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Please sign in to add items to cart.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const sellerName = `${product.seller.firstName || ""} ${product.seller.lastName || ""}`.trim()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-lg">
            <Image
              src={product.images[selectedImage] || "/placeholder.png"}
              alt={product.name}
              width={600}
              height={600}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.png"
              }}
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${
                    selectedImage === index ? "border-red-800" : "border-gray-200"
                  }`}
                >
                  <Image
                    src={image || "/placeholder.png"}
                    alt={`${product.name} ${index + 1}`}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.png"
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <Badge className="mb-2 bg-red-800 text-white">{product.category.name}</Badge>
            <h1 className="font-playfair text-3xl md:text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.avgRating) ? "text-yellow-400 fill-current" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {product.avgRating.toFixed(1)} ({product._count.reviews} reviews)
              </span>
            </div>
            <p className="text-3xl font-bold text-red-800">KES {product.price.toLocaleString()}</p>
            <p className="text-gray-600 leading-relaxed mt-4">{product.description}</p>
          </div>

          <Separator />

          {/* Quantity and Add to Cart */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <span className="font-medium">Quantity:</span>
              <div className="flex items-center border border-gray-300 rounded-md">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="px-4 py-2 min-w-[3rem] text-center">{quantity}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <span className="text-sm text-gray-600">{product.stock} in stock</span>
            </div>

            <div className="flex space-x-4">
              <Button
                onClick={handleAddToCart}
                disabled={isLoading || product.stock === 0}
                className="flex-1 bg-red-800 hover:bg-red-900 text-white"
                size="lg"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {isLoading ? "Adding..." : "Add to Cart"}
              </Button>
              <Button variant="outline" size="lg">
                <Heart className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <Separator />

          {/* Seller Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                  {product.seller.imageUrl ? (
                    <Image
                      src={product.seller.imageUrl || "/placeholder.png"}
                      alt={sellerName}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.png"
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">{sellerName || "Unknown Artisan"}</h3>
                  <p className="text-sm text-gray-600">{product.seller.sellerProfile?.location || "Kenya"}</p>
                </div>
              </CardTitle>
            </CardHeader>
            {product.seller.sellerProfile?.bio && (
              <CardContent>
                <p className="text-gray-600">{product.seller.sellerProfile.bio}</p>
              </CardContent>
            )}
          </Card>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="space-y-6">
        <h2 className="font-playfair text-2xl font-bold">Customer Reviews</h2>

        {product.reviews.length > 0 ? (
          <div className="space-y-4">
            {product.reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                      {review.user.imageUrl ? (
                        <Image
                          src={review.user.imageUrl || "/placeholder.png"}
                          alt="Reviewer"
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.png"
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">
                          {`${review.user.firstName || ""} ${review.user.lastName || ""}`.trim() || "Anonymous"}
                        </span>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                      {review.comment && <p className="text-gray-600">{review.comment}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
        )}
      </div>
    </div>
  )
}
