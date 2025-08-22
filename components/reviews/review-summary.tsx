"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Star, Users } from "lucide-react"

interface ReviewSummaryProps {
  averageRating: number
  totalReviews: number
  ratingDistribution: Record<number, number>
  className?: string
}

export function ReviewSummary({ averageRating, totalReviews, ratingDistribution, className }: ReviewSummaryProps) {
  const renderStarRating = (rating: number, size: "sm" | "md" | "lg" = "md") => {
    const starSize = size === "sm" ? "w-4 h-4" : size === "md" ? "w-5 h-5" : "w-6 h-6"
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${star <= Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    )
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "text-green-600"
    if (rating >= 4.0) return "text-green-500"
    if (rating >= 3.5) return "text-yellow-500"
    if (rating >= 3.0) return "text-orange-500"
    return "text-red-500"
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Customer Reviews
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Rating */}
        <div className="text-center space-y-2">
          <div className={`text-4xl font-bold ${getRatingColor(averageRating)}`}>{averageRating.toFixed(1)}</div>
          <div className="flex items-center justify-center">{renderStarRating(averageRating, "lg")}</div>
          <p className="text-sm text-muted-foreground">
            Based on {totalReviews.toLocaleString()} review{totalReviews !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Rating Breakdown</h4>
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = ratingDistribution[rating] || 0
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0

            return (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-12">
                  <span className="text-sm">{rating}</span>
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                </div>
                <div className="flex-1">
                  <Progress value={percentage} className="h-2" />
                </div>
                <div className="flex items-center gap-2 w-16 justify-end">
                  <span className="text-sm text-muted-foreground">{count}</span>
                  <span className="text-xs text-muted-foreground">({percentage.toFixed(0)}%)</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Quality Indicators */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {totalReviews > 0
                ? ((((ratingDistribution[4] || 0) + (ratingDistribution[5] || 0)) / totalReviews) * 100).toFixed(0)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">Positive Reviews</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-enkaji-ochre">
              {totalReviews > 0 ? (((ratingDistribution[5] || 0) / totalReviews) * 100).toFixed(0) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">5-Star Reviews</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
