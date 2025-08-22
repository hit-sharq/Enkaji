"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Star, MessageSquare, Edit, Trash2, Plus, CheckCircle, Award, TrendingUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

interface Testimonial {
  id: string
  name: string
  business: string | null
  content: string
  rating: number
  imageUrl: string | null
  location: string | null
  isVerified: boolean
  isFeatured: boolean
  createdAt: string
  source: "REVIEW" | "MANUAL" | "SUBMISSION"
  reviewId: string | null
}

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
  product: {
    name: string
  }
  isVerified: boolean
}

export function TestimonialsManagement() {
  const { toast } = useToast()
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    business: "",
    content: "",
    rating: 5,
    location: "",
    imageUrl: "",
    isVerified: true,
    isFeatured: false,
  })

  useEffect(() => {
    fetchTestimonials()
    fetchEligibleReviews()
  }, [])

  const fetchTestimonials = async () => {
    try {
      const response = await fetch("/api/admin/testimonials")
      const data = await response.json()

      if (response.ok) {
        setTestimonials(data.testimonials || [])
      }
    } catch (error) {
      console.error("Error fetching testimonials:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchEligibleReviews = async () => {
    try {
      const response = await fetch("/api/admin/reviews?status=approved&rating=4&limit=50")
      const data = await response.json()

      if (response.ok) {
        // Filter reviews that aren't already testimonials
        const eligibleReviews = data.reviews.filter(
          (review: Review) => review.rating >= 4 && review.comment && review.comment.length > 50,
        )
        setReviews(eligibleReviews || [])
      }
    } catch (error) {
      console.error("Error fetching reviews:", error)
    }
  }

  const handleCreateTestimonial = async () => {
    try {
      const response = await fetch("/api/admin/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Testimonial created successfully",
        })
        fetchTestimonials()
        setIsCreateDialogOpen(false)
        resetForm()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create testimonial")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create testimonial",
        variant: "destructive",
      })
    }
  }

  const handleUpdateTestimonial = async () => {
    if (!selectedTestimonial) return

    try {
      const response = await fetch(`/api/admin/testimonials/${selectedTestimonial.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Testimonial updated successfully",
        })
        fetchTestimonials()
        setIsEditDialogOpen(false)
        setSelectedTestimonial(null)
        resetForm()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update testimonial")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update testimonial",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTestimonial = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/testimonials/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Testimonial deleted successfully",
        })
        fetchTestimonials()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete testimonial")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete testimonial",
        variant: "destructive",
      })
    }
  }

  const handleToggleFeatured = async (id: string, featured: boolean) => {
    try {
      const response = await fetch(`/api/admin/testimonials/${id}/feature`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Testimonial ${featured ? "featured" : "unfeatured"} successfully`,
        })
        fetchTestimonials()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update testimonial")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update testimonial",
        variant: "destructive",
      })
    }
  }

  const handleConvertReviewToTestimonial = async (review: Review) => {
    try {
      const response = await fetch("/api/admin/testimonials/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId: review.id }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Review converted to testimonial successfully",
        })
        fetchTestimonials()
        fetchEligibleReviews()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to convert review")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to convert review",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      business: "",
      content: "",
      rating: 5,
      location: "",
      imageUrl: "",
      isVerified: true,
      isFeatured: false,
    })
  }

  const openEditDialog = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial)
    setFormData({
      name: testimonial.name,
      business: testimonial.business || "",
      content: testimonial.content,
      rating: testimonial.rating,
      location: testimonial.location || "",
      imageUrl: testimonial.imageUrl || "",
      isVerified: testimonial.isVerified,
      isFeatured: testimonial.isFeatured,
    })
    setIsEditDialogOpen(true)
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Testimonials</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{testimonials.length}</div>
            <p className="text-xs text-muted-foreground">All testimonials</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Featured</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{testimonials.filter((t) => t.isFeatured).length}</div>
            <p className="text-xs text-muted-foreground">Featured on homepage</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{testimonials.filter((t) => t.isVerified).length}</div>
            <p className="text-xs text-muted-foreground">Verified testimonials</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eligible Reviews</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviews.length}</div>
            <p className="text-xs text-muted-foreground">Can be converted</p>
          </CardContent>
        </Card>
      </div>

      {/* Testimonials Management Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Testimonials</TabsTrigger>
          <TabsTrigger value="convert">Convert Reviews</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
        </TabsList>

        {/* All Testimonials */}
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Testimonials Management</CardTitle>
                  <CardDescription>Manage all customer testimonials and their display settings</CardDescription>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="enkaji-button-primary">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Testimonial
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create New Testimonial</DialogTitle>
                      <DialogDescription>Add a new customer testimonial manually</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Customer Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="business">Business/Company</Label>
                        <Input
                          id="business"
                          value={formData.business}
                          onChange={(e) => setFormData({ ...formData, business: e.target.value })}
                          placeholder="ABC Company Ltd"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          placeholder="Nairobi, Kenya"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="rating">Rating</Label>
                        <Select
                          value={formData.rating.toString()}
                          onValueChange={(value) => setFormData({ ...formData, rating: Number.parseInt(value) })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5 Stars</SelectItem>
                            <SelectItem value="4">4 Stars</SelectItem>
                            <SelectItem value="3">3 Stars</SelectItem>
                            <SelectItem value="2">2 Stars</SelectItem>
                            <SelectItem value="1">1 Star</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Label htmlFor="content">Testimonial Content *</Label>
                        <Textarea
                          id="content"
                          value={formData.content}
                          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                          placeholder="Share your experience with Enkaji Trade Kenya..."
                          rows={4}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="imageUrl">Profile Image URL</Label>
                        <Input
                          id="imageUrl"
                          value={formData.imageUrl}
                          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="verified"
                            checked={formData.isVerified}
                            onCheckedChange={(checked) => setFormData({ ...formData, isVerified: checked })}
                          />
                          <Label htmlFor="verified">Verified Customer</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="featured"
                            checked={formData.isFeatured}
                            onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
                          />
                          <Label htmlFor="featured">Feature on Homepage</Label>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateTestimonial} className="enkaji-button-primary">
                        Create Testimonial
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testimonials.map((testimonial) => (
                    <TableRow key={testimonial.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                            {testimonial.imageUrl ? (
                              <Image
                                src={testimonial.imageUrl || "/placeholder.svg"}
                                alt={testimonial.name}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-enkaji-ochre text-white font-bold">
                                {testimonial.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{testimonial.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {testimonial.business}
                              {testimonial.location && ` • ${testimonial.location}`}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="text-sm line-clamp-2">{testimonial.content}</p>
                        </div>
                      </TableCell>
                      <TableCell>{renderStarRating(testimonial.rating)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {testimonial.isVerified && (
                            <Badge variant="default" className="w-fit">
                              Verified
                            </Badge>
                          )}
                          {testimonial.isFeatured && (
                            <Badge variant="secondary" className="w-fit">
                              Featured
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {testimonial.source === "REVIEW"
                            ? "Review"
                            : testimonial.source === "MANUAL"
                              ? "Manual"
                              : "Submission"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(testimonial)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleFeatured(testimonial.id, !testimonial.isFeatured)}
                          >
                            <Award className={`w-4 h-4 ${testimonial.isFeatured ? "text-yellow-500" : ""}`} />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Testimonial</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this testimonial? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteTestimonial(testimonial.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Convert Reviews */}
        <TabsContent value="convert" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Convert Reviews to Testimonials</CardTitle>
              <CardDescription>Convert high-quality reviews (4+ stars) into featured testimonials</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card key={review.id} className="border-l-4 border-l-green-400">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-4">
                            <div>
                              <h4 className="font-medium">
                                {review.user.firstName} {review.user.lastName}
                              </h4>
                              <p className="text-sm text-muted-foreground">Review for {review.product.name}</p>
                            </div>
                            {renderStarRating(review.rating)}
                          </div>
                          {review.title && <h5 className="font-medium text-sm">{review.title}</h5>}
                          <p className="text-sm">{review.comment}</p>
                        </div>
                        <Button
                          onClick={() => handleConvertReviewToTestimonial(review)}
                          className="ml-4 enkaji-button-secondary"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Convert to Testimonial
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {reviews.length === 0 && (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No eligible reviews found for conversion</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Submissions */}
        <TabsContent value="submissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Testimonial Submissions</CardTitle>
              <CardDescription>Customer-submitted testimonials awaiting review</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Testimonial submission system coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Testimonial</DialogTitle>
            <DialogDescription>Update testimonial information and settings</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Customer Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-business">Business/Company</Label>
              <Input
                id="edit-business"
                value={formData.business}
                onChange={(e) => setFormData({ ...formData, business: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-rating">Rating</Label>
              <Select
                value={formData.rating.toString()}
                onValueChange={(value) => setFormData({ ...formData, rating: Number.parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="edit-content">Testimonial Content *</Label>
              <Textarea
                id="edit-content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-imageUrl">Profile Image URL</Label>
              <Input
                id="edit-imageUrl"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              />
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-verified"
                  checked={formData.isVerified}
                  onCheckedChange={(checked) => setFormData({ ...formData, isVerified: checked })}
                />
                <Label htmlFor="edit-verified">Verified Customer</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-featured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
                />
                <Label htmlFor="edit-featured">Feature on Homepage</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTestimonial} className="enkaji-button-primary">
              Update Testimonial
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
