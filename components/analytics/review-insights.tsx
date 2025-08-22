"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, TrendingUp, CheckCircle, Clock, Flag } from "lucide-react"

interface ReviewInsights {
  summary: {
    totalReviews: number
    pendingReviews: number
    flaggedReviews: number
    averageResponseTime: number
    reviewsThisMonth: number
    reviewGrowth: number
  }
  sentimentAnalysis: {
    positive: number
    neutral: number
    negative: number
  }
  commonKeywords: Array<{
    word: string
    count: number
    sentiment: "positive" | "negative" | "neutral"
  }>
  reviewLengthDistribution: {
    short: number // < 50 chars
    medium: number // 50-200 chars
    long: number // > 200 chars
  }
  verificationStats: {
    verified: number
    unverified: number
  }
}

interface ReviewInsightsProps {
  timeRange?: "7d" | "30d" | "90d" | "1y"
  productId?: string
  sellerId?: string
}

export function ReviewInsights({ timeRange = "30d", productId, sellerId }: ReviewInsightsProps) {
  const [insights, setInsights] = useState<ReviewInsights | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange)

  useEffect(() => {
    fetchInsights()
  }, [selectedTimeRange, productId, sellerId])

  const fetchInsights = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        timeRange: selectedTimeRange,
        ...(productId && { productId }),
        ...(sellerId && { sellerId }),
      })

      const response = await fetch(`/api/analytics/review-insights?${params.toString()}`)
      const data = await response.json()

      if (response.ok) {
        setInsights(data)
      }
    } catch (error) {
      console.error("Error fetching review insights:", error)
    } finally {
      setLoading(false)
    }
  }

  const getSentimentColor = (sentiment: "positive" | "negative" | "neutral") => {
    switch (sentiment) {
      case "positive":
        return "text-green-600 bg-green-100"
      case "negative":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!insights) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No review insights available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Time Range Filter */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Review Insights</CardTitle>
              <CardDescription>Detailed analysis of customer reviews and feedback</CardDescription>
            </div>
            <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.summary.totalReviews}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.summary.reviewsThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              {insights.summary.reviewGrowth > 0 ? "+" : ""}
              {insights.summary.reviewGrowth.toFixed(1)}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.summary.pendingReviews}</div>
            <p className="text-xs text-muted-foreground">Awaiting moderation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.summary.flaggedReviews}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.summary.averageResponseTime}h</div>
            <p className="text-xs text-muted-foreground">Average moderation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((insights.verificationStats.verified / insights.summary.totalReviews) * 100).toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground">Verified purchases</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Sentiment Analysis</CardTitle>
            <CardDescription>Overall sentiment of customer reviews</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Positive</span>
                </div>
                <span className="text-sm font-bold text-green-600">
                  {((insights.sentimentAnalysis.positive / insights.summary.totalReviews) * 100).toFixed(1)}%
                </span>
              </div>
              <Progress
                value={(insights.sentimentAnalysis.positive / insights.summary.totalReviews) * 100}
                className="h-2"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <span className="text-sm font-medium">Neutral</span>
                </div>
                <span className="text-sm font-bold text-gray-600">
                  {((insights.sentimentAnalysis.neutral / insights.summary.totalReviews) * 100).toFixed(1)}%
                </span>
              </div>
              <Progress
                value={(insights.sentimentAnalysis.neutral / insights.summary.totalReviews) * 100}
                className="h-2"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium">Negative</span>
                </div>
                <span className="text-sm font-bold text-red-600">
                  {((insights.sentimentAnalysis.negative / insights.summary.totalReviews) * 100).toFixed(1)}%
                </span>
              </div>
              <Progress
                value={(insights.sentimentAnalysis.negative / insights.summary.totalReviews) * 100}
                className="h-2"
              />
            </div>

            <div className="pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {(
                    (insights.sentimentAnalysis.positive /
                      (insights.sentimentAnalysis.positive + insights.sentimentAnalysis.negative)) *
                    100
                  ).toFixed(1)}
                  %
                </div>
                <p className="text-sm text-muted-foreground">Positive Sentiment Score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Review Length Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Review Quality Metrics</CardTitle>
            <CardDescription>Analysis of review length and verification status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium">Review Length Distribution</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Short (&lt; 50 chars)</span>
                  <span className="text-sm font-medium">{insights.reviewLengthDistribution.short}</span>
                </div>
                <Progress
                  value={
                    (insights.reviewLengthDistribution.short /
                      (insights.reviewLengthDistribution.short +
                        insights.reviewLengthDistribution.medium +
                        insights.reviewLengthDistribution.long)) *
                    100
                  }
                  className="h-2"
                />

                <div className="flex items-center justify-between">
                  <span className="text-sm">Medium (50-200 chars)</span>
                  <span className="text-sm font-medium">{insights.reviewLengthDistribution.medium}</span>
                </div>
                <Progress
                  value={
                    (insights.reviewLengthDistribution.medium /
                      (insights.reviewLengthDistribution.short +
                        insights.reviewLengthDistribution.medium +
                        insights.reviewLengthDistribution.long)) *
                    100
                  }
                  className="h-2"
                />

                <div className="flex items-center justify-between">
                  <span className="text-sm">Long (&gt; 200 chars)</span>
                  <span className="text-sm font-medium">{insights.reviewLengthDistribution.long}</span>
                </div>
                <Progress
                  value={
                    (insights.reviewLengthDistribution.long /
                      (insights.reviewLengthDistribution.short +
                        insights.reviewLengthDistribution.medium +
                        insights.reviewLengthDistribution.long)) *
                    100
                  }
                  className="h-2"
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-medium">Verification Status</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{insights.verificationStats.verified}</div>
                  <p className="text-sm text-green-700">Verified</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">{insights.verificationStats.unverified}</div>
                  <p className="text-sm text-gray-700">Unverified</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Common Keywords */}
      <Card>
        <CardHeader>
          <CardTitle>Common Keywords</CardTitle>
          <CardDescription>Most frequently mentioned words in reviews</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {insights.commonKeywords.slice(0, 20).map((keyword) => (
              <Badge key={keyword.word} variant="outline" className={getSentimentColor(keyword.sentiment)}>
                {keyword.word} ({keyword.count})
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
