"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Star,
  Eye,
  CheckCircle,
  XCircle,
  Flag,
  MessageSquare,
  TrendingUp,
  AlertTriangle,
  Filter,
  Search,
  User,
  BarChart3,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

interface Review {
  id: string
  rating: number
  title: string | null
  comment: string | null
  images: string[]
  isVerified: boolean
  isFlagged: boolean
  createdAt: string
  updatedAt: string
  user: {
    firstName: string | null
    lastName: string | null
    email: string
    imageUrl: string | null
  }
  product: {
    id: string
    name: string
    images: string[]
  }
}

interface ReviewStats {
  totalReviews: number
  pendingReviews: number
  flaggedReviews: number
  averageRating: number
  ratingDistribution: Record<number, number>
  recentReviews: number
}

export function ReviewsManagement() {
  const { toast } = useToast()
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewStats>({
    totalReviews: 0,
    pendingReviews: 0,
    flaggedReviews: 0,
    averageRating: 0,
    ratingDistribution: {},
    recentReviews: 0,
  })
  const [loading, setLoading] = useState(true)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [moderationReason, setModerationReason] = useState("")
  const [filters, setFilters] = useState({
    status: "all",
    rating: "all",
    search: "",
    dateRange: "all",
  })

  useEffect(() => {
    fetchReviewsData()
  }, [filters])

  const fetchReviewsData = async () => {
    try {
      setLoading(true)

      // Build query parameters
      const params = new URLSearchParams()
      if (filters.status !== "all") params.append("status", filters.status)
      if (filters.rating !== "all") params.append("rating", filters.rating)
      if (filters.search) params.append("search", filters.search)
      if (filters.dateRange !== "all") params.append("dateRange", filters.dateRange)

      const response = await fetch(`/api/admin/reviews?${params.toString()}`)
      const data = await response.json()

      if (response.ok) {
        setReviews(data.reviews || [])
        setStats(data.stats || {})
      } else {
        throw new Error(data.error || "Failed to fetch reviews")
      }
    } catch (error) {
      console.error("Error fetching reviews:", error)
      toast({
        title: "Error",
        description: "Failed to load reviews data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReviewModeration = async (reviewId: string, action: "approve" | "reject" | "flag", reason?: string) => {
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}/moderate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Review ${action}d successfully`,
        })
        fetchReviewsData()
        setSelectedReview(null)
        setModerationReason("")
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to moderate review")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to moderate review",
        variant: "destructive",
      })
    }
  }

  const handleBulkAction = async (reviewIds: string[], action: "approve" | "reject" | "flag") => {
    try {
      const response = await fetch("/api/admin/reviews/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewIds, action, reason: moderationReason }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `${reviewIds.length} reviews ${action}d successfully`,
        })
        fetchReviewsData()
        setModerationReason("")
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to perform bulk action")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to perform bulk action",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (review: Review) => {
    if (review.isFlagged) {
      return <Badge variant="destructive">Flagged</Badge>
    }
    if (review.isVerified) {
      return <Badge variant="default">Approved</Badge>
    }
    return <Badge variant="secondary">Pending</Badge>
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReviews}</div>
            <p className="text-xs text-muted-foreground">All time reviews</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingReviews}</div>
            <p className="text-xs text-muted-foreground">Awaiting moderation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged Reviews</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.flaggedReviews}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Platform average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Reviews</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentReviews}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating Distribution</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-2 text-xs">
                  <span className="w-3">{rating}</span>
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <div className="flex-1 bg-gray-200 rounded-full h-1">
                    <div
                      className="bg-yellow-400 h-1 rounded-full"
                      style={{
                        width: `${((stats.ratingDistribution[rating] || 0) / stats.totalReviews) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="w-6 text-right">{stats.ratingDistribution[rating] || 0}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Search Reviews</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by product, user, or content..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reviews</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Rating</Label>
              <Select value={filters.rating} onValueChange={(value) => setFilters({ ...filters, rating: value })}>
                <SelectTrigger>
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
            </div>

            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select value={filters.dateRange} onValueChange={(value) => setFilters({ ...filters, dateRange: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews Management Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Reviews</TabsTrigger>
          <TabsTrigger value="pending">Pending ({stats.pendingReviews})</TabsTrigger>
          <TabsTrigger value="flagged">Flagged ({stats.flaggedReviews})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* All Reviews */}
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Reviews</CardTitle>
              <CardDescription>Manage all customer reviews and ratings</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Review</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell>
                        <div className="max-w-xs">
                          {review.title && <div className="font-medium text-sm mb-1">{review.title}</div>}
                          <div className="text-sm text-muted-foreground line-clamp-2">
                            {review.comment || "No comment provided"}
                          </div>
                          {review.images.length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {review.images.slice(0, 3).map((image, index) => (
                                <div key={index} className="w-8 h-8 rounded overflow-hidden bg-gray-100">
                                  <Image
                                    src={image || "/placeholder.svg"}
                                    alt="Review image"
                                    width={32}
                                    height={32}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                              {review.images.length > 3 && (
                                <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-xs">
                                  +{review.images.length - 3}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded overflow-hidden bg-gray-100">
                            <Image
                              src={review.product.images[0] || "/placeholder.svg"}
                              alt={review.product.name}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="max-w-xs">
                            <div className="font-medium text-sm line-clamp-1">{review.product.name}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100">
                            {review.user.imageUrl ? (
                              <Image
                                src={review.user.imageUrl || "/placeholder.svg"}
                                alt="User"
                                width={32}
                                height={32}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <User className="w-4 h-4 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-sm">
                              {review.user.firstName} {review.user.lastName}
                            </div>
                            <div className="text-xs text-muted-foreground">{review.user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{renderStarRating(review.rating)}</TableCell>
                      <TableCell>{getStatusBadge(review)}</TableCell>
                      <TableCell>{new Date(review.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSelectedReview(review)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Review Details</DialogTitle>
                                <DialogDescription>
                                  Review for {review.product.name} by {review.user.firstName} {review.user.lastName}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                  {renderStarRating(review.rating, "md")}
                                  <span className="text-sm text-muted-foreground">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                {review.title && (
                                  <div>
                                    <h4 className="font-medium">{review.title}</h4>
                                  </div>
                                )}
                                {review.comment && (
                                  <div>
                                    <p className="text-sm">{review.comment}</p>
                                  </div>
                                )}
                                {review.images.length > 0 && (
                                  <div>
                                    <h5 className="font-medium mb-2">Images</h5>
                                    <div className="grid grid-cols-3 gap-2">
                                      {review.images.map((image, index) => (
                                        <div key={index} className="aspect-square rounded overflow-hidden bg-gray-100">
                                          <Image
                                            src={image || "/placeholder.svg"}
                                            alt={`Review image ${index + 1}`}
                                            width={200}
                                            height={200}
                                            className="w-full h-full object-cover"
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                <div className="space-y-2">
                                  <Label htmlFor="moderation-reason">Moderation Reason (Optional)</Label>
                                  <Textarea
                                    id="moderation-reason"
                                    value={moderationReason}
                                    onChange={(e) => setModerationReason(e.target.value)}
                                    placeholder="Enter reason for moderation action..."
                                    rows={3}
                                  />
                                </div>
                              </div>
                              <DialogFooter className="gap-2">
                                {!review.isVerified && !review.isFlagged && (
                                  <Button
                                    onClick={() => handleReviewModeration(review.id, "approve", moderationReason)}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                )}
                                {!review.isFlagged && (
                                  <Button
                                    variant="destructive"
                                    onClick={() => handleReviewModeration(review.id, "flag", moderationReason)}
                                  >
                                    <Flag className="h-4 w-4 mr-1" />
                                    Flag
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  onClick={() => handleReviewModeration(review.id, "reject", moderationReason)}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          {!review.isVerified && !review.isFlagged && (
                            <Button
                              size="sm"
                              onClick={() => handleReviewModeration(review.id, "approve")}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}

                          {!review.isFlagged && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleReviewModeration(review.id, "flag")}
                            >
                              <Flag className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Reviews */}
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Reviews</CardTitle>
              <CardDescription>Reviews awaiting moderation approval</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reviews
                  .filter((review) => !review.isVerified && !review.isFlagged)
                  .map((review) => (
                    <Card key={review.id} className="border-l-4 border-l-yellow-400">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded overflow-hidden bg-gray-100">
                            <Image
                              src={review.product.images[0] || "/placeholder.svg"}
                              alt={review.product.name}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">{review.product.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  by {review.user.firstName} {review.user.lastName}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                {renderStarRating(review.rating)}
                                <span className="text-sm text-muted-foreground">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            {review.title && <h5 className="font-medium text-sm">{review.title}</h5>}
                            {review.comment && <p className="text-sm">{review.comment}</p>}
                            {review.images.length > 0 && (
                              <div className="flex gap-2">
                                {review.images.slice(0, 4).map((image, index) => (
                                  <div key={index} className="w-16 h-16 rounded overflow-hidden bg-gray-100">
                                    <Image
                                      src={image || "/placeholder.svg"}
                                      alt="Review image"
                                      width={64}
                                      height={64}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="flex items-center gap-2 pt-2">
                              <Button
                                size="sm"
                                onClick={() => handleReviewModeration(review.id, "approve")}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleReviewModeration(review.id, "flag")}
                              >
                                <Flag className="h-4 w-4 mr-1" />
                                Flag
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReviewModeration(review.id, "reject")}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Flagged Reviews */}
        <TabsContent value="flagged" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Flagged Reviews</CardTitle>
              <CardDescription>Reviews that have been flagged and require attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reviews
                  .filter((review) => review.isFlagged)
                  .map((review) => (
                    <Card key={review.id} className="border-l-4 border-l-red-500">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded overflow-hidden bg-gray-100">
                            <Image
                              src={review.product.images[0] || "/placeholder.svg"}
                              alt={review.product.name}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">{review.product.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  by {review.user.firstName} {review.user.lastName}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                {renderStarRating(review.rating)}
                                <Badge variant="destructive">Flagged</Badge>
                              </div>
                            </div>
                            {review.title && <h5 className="font-medium text-sm">{review.title}</h5>}
                            {review.comment && <p className="text-sm">{review.comment}</p>}
                            <div className="flex items-center gap-2 pt-2">
                              <Button
                                size="sm"
                                onClick={() => handleReviewModeration(review.id, "approve")}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReviewModeration(review.id, "reject")}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Review Trends</CardTitle>
                <CardDescription>Review submission and approval trends over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Review analytics coming soon</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rating Distribution</CardTitle>
                <CardDescription>Breakdown of ratings across all reviews</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 w-16">
                        <span className="text-sm">{rating}</span>
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${((stats.ratingDistribution[rating] || 0) / stats.totalReviews) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">
                        {stats.ratingDistribution[rating] || 0}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
