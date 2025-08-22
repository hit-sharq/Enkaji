"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react"
import Image from "next/image"

interface Review {
  id: string
  rating: number
  title: string | null
  comment: string | null
  user: {
    firstName: string | null
    lastName: string | null
    imageUrl: string | null
  }
  product?: {
    name: string
  }
}

interface ReviewCarouselProps {
  productId?: string
  sellerId?: string
  limit?: number
  autoPlay?: boolean
  autoPlayInterval?: number
  className?: string
}

export function ReviewCarousel({
  productId,
  sellerId,
  limit = 6,
  autoPlay = true,
  autoPlayInterval = 5000,
  className,
}: ReviewCarouselProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReviews()
  }, [productId, sellerId, limit])

  useEffect(() => {
    if (!autoPlay || reviews.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length)
    }, autoPlayInterval)

    return () => clearInterval(interval)
  }, [autoPlay, autoPlayInterval, reviews.length])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        limit: limit.toString(),
        rating: "4", // Only show 4+ star reviews
        sortBy: "newest",
        ...(productId && { productId }),
        ...(sellerId && { sellerId }),
      })

      const response = await fetch(`/api/reviews?${params.toString()}`)
      const data = await response.json()

      if (response.ok) {
        setReviews(data.reviews || [])
      }
    } catch (error) {
      console.error("Error fetching reviews:", error)
    } finally {
      setLoading(false)
    }
  }

  const nextReview = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length)
  }

  const prevReview = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length)
  }

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-64 bg-gray-200 rounded-lg"></div>
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <Quote className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No reviews available</p>
        </CardContent>
      </Card>
    )
  }

  const currentReview = reviews[currentIndex]
  const userName = `${currentReview.user.firstName || ""} ${currentReview.user.lastName || ""}`.trim() || "Anonymous"

  return (
    <div className={`relative ${className}`}>
      <Card className="overflow-hidden">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            {/* Quote Icon */}
            <Quote className="w-12 h-12 text-enkaji-ochre mx-auto" />

            {/* Review Content */}
            <div className="space-y-4">
              {currentReview.title && <h3 className="text-xl font-semibold text-gray-900">{currentReview.title}</h3>}
              {currentReview.comment && (
                <blockquote className="text-lg text-gray-700 italic max-w-2xl mx-auto leading-relaxed">
                  "{currentReview.comment}"
                </blockquote>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center justify-center">{renderStarRating(currentReview.rating)}</div>

            {/* User Info */}
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-enkaji-ochre flex items-center justify-center text-white font-bold">
                {currentReview.user.imageUrl ? (
                  <Image
                    src={currentReview.user.imageUrl || "/placeholder.svg"}
                    alt={userName}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  userName.charAt(0)
                )}
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900">{userName}</div>
                {currentReview.product && <div className="text-sm text-muted-foreground">Verified Purchase</div>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      {reviews.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            onClick={prevReview}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white shadow-lg hover:shadow-xl"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={nextReview}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white shadow-lg hover:shadow-xl"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? "bg-enkaji-ochre" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
