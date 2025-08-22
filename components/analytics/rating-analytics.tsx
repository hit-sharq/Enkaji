"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Star, TrendingUp, TrendingDown, BarChart3, Users, Package, Award } from "lucide-react"

interface RatingAnalytics {
  overview: {
    totalReviews: number
    averageRating: number
    ratingDistribution: Record<number, number>
    recentTrend: "up" | "down" | "stable"
    trendPercentage: number
  }
  trends: {
    daily: Array<{ date: string; averageRating: number; reviewCount: number }>
    monthly: Array<{ month: string; averageRating: number; reviewCount: number }>
  }
  categories: Array<{
    categoryId: string
    categoryName: string
    averageRating: number
    reviewCount: number
    ratingDistribution: Record<number, number>
  }>
  topProducts: Array<{
    productId: string
    productName: string
    averageRating: number
    reviewCount: number
    images: string[]
  }>
  topSellers: Array<{
    sellerId: string
    sellerName: string
    averageRating: number
    reviewCount: number
    totalProducts: number
  }>
}

interface RatingAnalyticsProps {
  timeRange?: "7d" | "30d" | "90d" | "1y" | "all"
  showFilters?: boolean
}

export function RatingAnalytics({ timeRange = "30d", showFilters = true }: RatingAnalyticsProps) {
  const [analytics, setAnalytics] = useState<RatingAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  useEffect(() => {
    fetchAnalytics()
  }, [selectedTimeRange, selectedCategory])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        timeRange: selectedTimeRange,
        ...(selectedCategory !== "all" && { categoryId: selectedCategory }),
      })

      const response = await fetch(`/api/analytics/ratings?${params.toString()}`)
      const data = await response.json()

      if (response.ok) {
        setAnalytics(data)
      }
    } catch (error) {
      console.error("Error fetching rating analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const renderStarRating = (rating: number, size: "sm" | "md" = "sm") => {
    const starSize = size === "sm" ? "w-4 h-4" : "w-5 h-5"
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${star <= Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
          />
        ))}
        <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
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

  const getRatingBgColor = (rating: number) => {
    if (rating >= 4.5) return "bg-green-100"
    if (rating >= 4.0) return "bg-green-50"
    if (rating >= 3.5) return "bg-yellow-50"
    if (rating >= 3.0) return "bg-orange-50"
    return "bg-red-50"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No analytics data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Rating Analytics Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Time Range</label>
                <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                    <SelectItem value="1y">Last year</SelectItem>
                    <SelectItem value="all">All time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {analytics.categories.map((category) => (
                      <SelectItem key={category.categoryId} value={category.categoryId}>
                        {category.categoryName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalReviews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Customer reviews</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className={`text-2xl font-bold ${getRatingColor(analytics.overview.averageRating)}`}>
                {analytics.overview.averageRating.toFixed(1)}
              </div>
              <div className="flex items-center gap-1">
                {analytics.overview.recentTrend === "up" ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : analytics.overview.recentTrend === "down" ? (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                ) : null}
                <span className="text-xs text-muted-foreground">
                  {analytics.overview.trendPercentage > 0 ? "+" : ""}
                  {analytics.overview.trendPercentage.toFixed(1)}%
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Platform average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">5-Star Reviews</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{analytics.overview.ratingDistribution[5] || 0}</div>
            <p className="text-xs text-muted-foreground">
              {(((analytics.overview.ratingDistribution[5] || 0) / analytics.overview.totalReviews) * 100).toFixed(1)}%
              of all reviews
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.categories.length}</div>
            <p className="text-xs text-muted-foreground">With reviews</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="distribution" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="distribution">Rating Distribution</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="leaderboards">Top Performers</TabsTrigger>
        </TabsList>

        {/* Rating Distribution */}
        <TabsContent value="distribution" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Rating Distribution</CardTitle>
                <CardDescription>Breakdown of all ratings received</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = analytics.overview.ratingDistribution[rating] || 0
                  const percentage = (count / analytics.overview.totalReviews) * 100

                  return (
                    <div key={rating} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{rating}</span>
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{count}</span>
                          <span className="text-sm font-medium">{percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rating Quality Metrics</CardTitle>
                <CardDescription>Quality indicators for your ratings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Positive Reviews (4-5 stars)</span>
                    <span className="text-sm font-bold text-green-600">
                      {(
                        (((analytics.overview.ratingDistribution[4] || 0) +
                          (analytics.overview.ratingDistribution[5] || 0)) /
                          analytics.overview.totalReviews) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                  <Progress
                    value={
                      (((analytics.overview.ratingDistribution[4] || 0) +
                        (analytics.overview.ratingDistribution[5] || 0)) /
                        analytics.overview.totalReviews) *
                      100
                    }
                    className="h-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Neutral Reviews (3 stars)</span>
                    <span className="text-sm font-bold text-yellow-600">
                      {(
                        ((analytics.overview.ratingDistribution[3] || 0) / analytics.overview.totalReviews) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                  <Progress
                    value={((analytics.overview.ratingDistribution[3] || 0) / analytics.overview.totalReviews) * 100}
                    className="h-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Negative Reviews (1-2 stars)</span>
                    <span className="text-sm font-bold text-red-600">
                      {(
                        (((analytics.overview.ratingDistribution[1] || 0) +
                          (analytics.overview.ratingDistribution[2] || 0)) /
                          analytics.overview.totalReviews) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                  <Progress
                    value={
                      (((analytics.overview.ratingDistribution[1] || 0) +
                        (analytics.overview.ratingDistribution[2] || 0)) /
                        analytics.overview.totalReviews) *
                      100
                    }
                    className="h-2"
                  />
                </div>

                <div className="pt-4 border-t">
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${getRatingColor(analytics.overview.averageRating)}`}>
                      {analytics.overview.averageRating.toFixed(2)}
                    </div>
                    <p className="text-sm text-muted-foreground">Overall Rating Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends */}
        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Rating Trends</CardTitle>
                <CardDescription>Average ratings over the last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.trends.daily.slice(-7).map((day, index) => (
                    <div key={day.date} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div>
                        <div className="font-medium">{new Date(day.date).toLocaleDateString()}</div>
                        <div className="text-sm text-muted-foreground">{day.reviewCount} reviews</div>
                      </div>
                      <div className="flex items-center gap-2">{renderStarRating(day.averageRating)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Overview</CardTitle>
                <CardDescription>Monthly rating performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.trends.monthly.slice(-6).map((month) => (
                    <div key={month.month} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div>
                        <div className="font-medium">{month.month}</div>
                        <div className="text-sm text-muted-foreground">{month.reviewCount} reviews</div>
                      </div>
                      <div className="flex items-center gap-2">{renderStarRating(month.averageRating)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Categories */}
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Category Performance</CardTitle>
              <CardDescription>Rating breakdown by product categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.categories
                  .sort((a, b) => b.averageRating - a.averageRating)
                  .map((category) => (
                    <div
                      key={category.categoryId}
                      className={`p-4 rounded-lg border ${getRatingBgColor(category.averageRating)}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{category.categoryName}</h4>
                          <p className="text-sm text-muted-foreground">{category.reviewCount} reviews</p>
                        </div>
                        <div className="flex items-center gap-2">{renderStarRating(category.averageRating)}</div>
                      </div>

                      <div className="grid grid-cols-5 gap-2">
                        {[5, 4, 3, 2, 1].map((rating) => {
                          const count = category.ratingDistribution[rating] || 0
                          const percentage = category.reviewCount > 0 ? (count / category.reviewCount) * 100 : 0

                          return (
                            <div key={rating} className="text-center">
                              <div className="text-xs font-medium">{rating}★</div>
                              <div className="text-xs text-muted-foreground">{count}</div>
                              <Progress value={percentage} className="h-1 mt-1" />
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Performers */}
        <TabsContent value="leaderboards" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Rated Products</CardTitle>
                <CardDescription>Products with highest average ratings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topProducts.slice(0, 5).map((product, index) => (
                    <div key={product.productId} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-enkaji-ochre text-white text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium line-clamp-1">{product.productName}</h4>
                        <p className="text-sm text-muted-foreground">{product.reviewCount} reviews</p>
                      </div>
                      <div className="flex items-center gap-2">{renderStarRating(product.averageRating)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Rated Sellers</CardTitle>
                <CardDescription>Sellers with highest average ratings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topSellers.slice(0, 5).map((seller, index) => (
                    <div key={seller.sellerId} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-enkaji-red text-white text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{seller.sellerName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {seller.reviewCount} reviews • {seller.totalProducts} products
                        </p>
                      </div>
                      <div className="flex items-center gap-2">{renderStarRating(seller.averageRating)}</div>
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
