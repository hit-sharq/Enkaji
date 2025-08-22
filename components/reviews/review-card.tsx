"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, ThumbsUp, Flag, Calendar, CheckCircle } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"

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

interface ReviewCardProps {
  review: Review
  variant?: "default" | "compact" | "detailed"
  showProduct?: boolean
  showActions?: boolean
  onHelpful?: (reviewId: string) => void
  onReport?: (reviewId: string) => void
}

export function ReviewCard({
  review,
  variant = "default",
  showProduct = false,
  showActions = true,
  onHelpful,
  onReport,
}: ReviewCardProps) {
  const { toast } = useToast()
  const [isExpanded, setIsExpanded] = useState(false)
  const [helpfulLoading, setHelpfulLoading] = useState(false)

  const userName = `${review.user.firstName || ""} ${review.user.lastName || ""}`.trim() || "Anonymous"
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  const handleHelpful = async () => {
    if (!onHelpful) return

    setHelpfulLoading(true)
    try {
      await onHelpful(review.id)
      toast({
        title: "Thank you!",
        description: "Your feedback has been recorded.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record your feedback.",
        variant: "destructive",
      })
    } finally {
      setHelpfulLoading(false)
    }
  }

  const handleReport = async () => {
    if (!onReport) return

    try {
      await onReport(review.id)
      toast({
        title: "Reported",
        description: "Thank you for reporting this review. We'll investigate it.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to report this review.",
        variant: "destructive",
      })
    }
  }

  const renderStarRating = (rating: number, size: "sm" | "md" = "sm") => {
    const starSize = size === "sm" ? "w-4 h-4" : "w-5 h-5"
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    )
  }

  if (variant === "compact") {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-enkaji-ochre flex items-center justify-center text-white text-sm font-bold">
              {review.user.imageUrl ? (
                <Image
                  src={review.user.imageUrl || "/placeholder.svg"}
                  alt={userName}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              ) : (
                userInitials
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">{userName}</span>
                {review.isVerified && (
                  <Badge variant="secondary" className="text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mb-2">
                {renderStarRating(review.rating)}
                <span className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
              {review.title && <h4 className="font-medium text-sm mb-1">{review.title}</h4>}
              {review.comment && <p className="text-sm text-gray-600 line-clamp-2">{review.comment}</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (variant === "detailed") {
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-enkaji-ochre flex items-center justify-center text-white font-bold">
                {review.user.imageUrl ? (
                  <Image
                    src={review.user.imageUrl || "/placeholder.svg"}
                    alt={userName}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  userInitials
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">{userName}</h4>
                  {review.isVerified && (
                    <Badge variant="default" className="text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified Purchase
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {renderStarRating(review.rating, "md")}
                  <span className="text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Info */}
          {showProduct && review.product && (
            <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 rounded overflow-hidden bg-gray-200">
                <Image
                  src={review.product.images[0] || "/placeholder.svg"}
                  alt={review.product.name}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-medium text-sm">Review for:</p>
                <p className="text-sm text-muted-foreground">{review.product.name}</p>
              </div>
            </div>
          )}

          {/* Review Content */}
          <div className="space-y-3">
            {review.title && <h3 className="font-semibold text-lg">{review.title}</h3>}
            {review.comment && (
              <div>
                <p className={`text-gray-700 ${!isExpanded && review.comment.length > 300 ? "line-clamp-4" : ""}`}>
                  {review.comment}
                </p>
                {review.comment.length > 300 && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-0 h-auto text-enkaji-ochre"
                  >
                    {isExpanded ? "Show less" : "Read more"}
                  </Button>
                )}
              </div>
            )}

            {/* Review Images */}
            {review.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
                {review.images.slice(0, 4).map((image, index) => (
                  <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`Review image ${index + 1}`}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                    />
                  </div>
                ))}
                {review.images.length > 4 && (
                  <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center text-sm text-gray-500">
                    +{review.images.length - 4} more
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex items-center justify-between pt-4 border-t mt-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleHelpful}
                  disabled={helpfulLoading}
                  className={`${review.isHelpful ? "text-enkaji-ochre" : ""}`}
                >
                  <ThumbsUp className="w-4 h-4 mr-1" />
                  Helpful {review.helpfulCount ? `(${review.helpfulCount})` : ""}
                </Button>
                <Button variant="ghost" size="sm" onClick={handleReport}>
                  <Flag className="w-4 h-4 mr-1" />
                  Report
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Default variant
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-enkaji-ochre flex items-center justify-center text-white font-bold">
            {review.user.imageUrl ? (
              <Image
                src={review.user.imageUrl || "/placeholder.svg"}
                alt={userName}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            ) : (
              userInitials
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">{userName}</h4>
                {review.isVerified && (
                  <Badge variant="secondary" className="text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <span className="text-sm text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</span>
            </div>

            <div className="flex items-center gap-2 mb-3">{renderStarRating(review.rating)}</div>

            {review.title && <h3 className="font-medium mb-2">{review.title}</h3>}
            {review.comment && <p className="text-gray-700 mb-3 line-clamp-3">{review.comment}</p>}

            {review.images.length > 0 && (
              <div className="flex gap-2 mb-3">
                {review.images.slice(0, 3).map((image, index) => (
                  <div key={index} className="w-16 h-16 rounded overflow-hidden bg-gray-100">
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`Review image ${index + 1}`}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                {review.images.length > 3 && (
                  <div className="w-16 h-16 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                    +{review.images.length - 3}
                  </div>
                )}
              </div>
            )}

            {showActions && (
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={handleHelpful} disabled={helpfulLoading}>
                  <ThumbsUp className="w-4 h-4 mr-1" />
                  Helpful {review.helpfulCount ? `(${review.helpfulCount})` : ""}
                </Button>
                <Button variant="ghost" size="sm" onClick={handleReport}>
                  <Flag className="w-4 h-4 mr-1" />
                  Report
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
