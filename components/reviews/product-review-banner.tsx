"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

interface ProductReviewFormBannerProps {
  productId: string
  onReviewSubmitted?: () => void
  className?: string
  userId?: string | null
}

export function ProductReviewFormBanner({ productId, onReviewSubmitted, className = "", userId }: ProductReviewFormBannerProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  if (!userId) {
    return (
      <Card className={`border-l-4 border-enkaji-ochre bg-gray-50 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-enkaji-ochre" />
            Write a Review
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">Please sign in to write a review.</p>
          <Button
            onClick={() => window.location.href = "/sign-in"}
            className="w-full bg-enkaji-ochre hover:bg-enkaji-ochre/90"
          >
            Sign In to Review
          </Button>
        </CardContent>
      </Card>
    )
  }

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a star rating before submitting.",
        variant: "destructive",
      })
      return
    }

    if (!comment.trim()) {
      toast({
        title: "Comment required",
        description: "Please write a review comment.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          rating,
          comment: comment.trim(),
        }),
      })

      if (response.ok) {
        toast({
          title: "Review submitted",
          description: "Thank you for your review!",
        })
        setRating(0)
        setComment("")
        onReviewSubmitted?.()
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to submit review.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while submitting your review.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className={`border-l-4 border-enkaji-ochre bg-gray-50 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5 text-enkaji-ochre" />
          Write a Review
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium mb-2">Your Rating</p>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="p-1"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                <Star
                  className={`w-7 h-7 transition-colors ${
                    star <= (hoverRating || rating)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Your Review</p>
          <Textarea
            placeholder="Share your experience with this product..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="resize-none"
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || rating === 0 || !comment.trim()}
          className="w-full bg-enkaji-ochre hover:bg-enkaji-ochre/90"
        >
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </Button>
      </CardContent>
    </Card>
  )
}

interface ProductReviewBannerProps {
  rating: number
  comment: string
  reviewerName?: string
  className?: string
}

export function ProductReviewBanner({ rating, comment, reviewerName, className = "" }: ProductReviewBannerProps) {
  return (
    <Card className={`border-l-4 border-enkaji-ochre bg-gray-50 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
            />
          ))}
        </div>
        <p className="text-gray-700 italic">"{comment}"</p>
        {reviewerName && (
          <p className="text-sm text-gray-500 mt-2">- {reviewerName}</p>
        )}
      </CardContent>
    </Card>
  )
}