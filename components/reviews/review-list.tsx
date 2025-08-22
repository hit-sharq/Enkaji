"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { ReviewCard } from "./review-card"
import { ReviewSummary } from "./review-summary"
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react"

interface Review {
  id: string
  rating: number
  title: string | null
  comment: string | null
  images: string[]
  isVerified: boolean
  createdAt: string
  user: {
    firstName: string | null
    lastName: string | null
    imageUrl: string | null
  }
  product?: {
    name: string
    images: string[]
  }
  helpfulCount?: number
  isHelpful?: boolean
}

interface ReviewListProps {
  productId?: string
  sellerId?: string
  showSummary?: boolean
  showFilters?: boolean
  variant?: "default" | "compact" | "detailed"
  limit?: number
  className?: string
}

export function ReviewList({
  productId,
  sellerId,
  showSummary = true,
  showFilters = true,
  variant = "default",
  limit = 10,
  className,
}: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    rating: "all",
    sortBy: "newest",
    search: "",
  })
  const [summary, setSummary] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: {} as Record<number, number>,
  })

  useEffect(() => {
    fetchReviews()
  }, [productId, sellerId, currentPage, filters])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        ...(productId && { productId }),
        ...(sellerId && { sellerId }),
        ...(filters.rating !== "all" && { rating: filters.rating }),
        ...(filters.search && { search: filters.search }),
        sortBy: filters.sortBy,
      })

      const response = await fetch(`/api/reviews?${params.toString()}`)
      const data = await response.json()

      if (response.ok) {
        setReviews(data.reviews || [])
        setTotalPages(data.pagination?.pages || 1)
        if (data.stats) {
          setSummary({
            averageRating: data.stats.averageRating,
            totalReviews: data.stats.totalReviews,
            ratingDistribution: data.stats.ratingDistribution,
          })
        }
      }
    } catch (error) {
      console.error("Error fetching reviews:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleHelpful = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: "POST",
      })

      if (response.ok) {
        // Update the review in the list
        setReviews((prev) =>
          prev.map((review) =>
            review.id === reviewId
              ? {
                  ...review,
                  helpfulCount: (review.helpfulCount || 0) + (review.isHelpful ? -1 : 1),
                  isHelpful: !review.isHelpful,
                }
              : review,
          ),
        )
      }
    } catch (error) {
      throw error
    }
  }

  const handleReport = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}/report`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to report review")
      }
    } catch (error) {
      throw error
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  if (loading && reviews.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        {showSummary && (
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        )}
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary */}
      {showSummary && summary.totalReviews > 0 && (
        <ReviewSummary
          averageRating={summary.averageRating}
          totalReviews={summary.totalReviews}
          ratingDistribution={summary.ratingDistribution}
        />
      )}

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reviews..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={filters.rating} onValueChange={(value) => handleFilterChange("rating", value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              <SelectItem value="5">5 Stars</SelectItem>
              <SelectItem value="4">4 Stars</SelectItem>
              <SelectItem value="3">3 Stars</SelectItem>
              <SelectItem value="2">2 Stars</SelectItem>
              <SelectItem value="1">1 Star</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange("sortBy", value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="highest">Highest Rated</SelectItem>
              <SelectItem value="lowest">Lowest Rated</SelectItem>
              <SelectItem value="helpful">Most Helpful</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              variant={variant}
              showProduct={!!sellerId}
              onHelpful={handleHelpful}
              onReport={handleReport}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">No reviews found</h3>
            <p className="text-gray-500">
              {filters.rating !== "all" || filters.search
                ? "Try adjusting your filters to see more reviews."
                : "Be the first to leave a review!"}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1 || loading}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const pageNum = Math.max(1, currentPage - 2) + i
              if (pageNum > totalPages) return null

              return (
                <Button
                  key={pageNum}
                  variant={pageNum === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  disabled={loading}
                  className={pageNum === currentPage ? "enkaji-button-primary" : ""}
                >
                  {pageNum}
                </Button>
              )
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages || loading}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}

      {loading && reviews.length > 0 && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-enkaji-ochre mx-auto"></div>
        </div>
      )}
    </div>
  )
}
