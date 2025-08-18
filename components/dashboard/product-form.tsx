"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { X, ImageIcon } from "lucide-react"

interface Category {
  id: string
  name: string
}

interface ProductFormProps {
  categories: Category[]
  product?: {
    id: string
    name: string
    description: string
    price: number
    inventory: number
    images: string[]
    categoryId: string
    weight: number
  }
}

export function ProductForm({ categories, product }: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [images, setImages] = useState<string[]>(product?.images || [])
  const [isUploading, setIsUploading] = useState(false)
  const [categoryId, setCategoryId] = useState(product?.categoryId || "")
  const [weight, setWeight] = useState(product?.weight || "")
  const { toast } = useToast()
  const router = useRouter()

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error("Upload failed")
        }

        const data = await response.json()
        return data.url
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      setImages((prev) => [...prev, ...uploadedUrls])

      toast({
        title: "Images uploaded!",
        description: `${uploadedUrls.length} image(s) uploaded successfully.`,
      })
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload images. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      // Reset file input
      e.target.value = ""
    }
  }

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const productData = {
      name: formData.get("name"),
      description: formData.get("description"),
      price: formData.get("price"),
      inventory: formData.get("inventory"),
      categoryId: formData.get("categoryId"),
      weight: formData.get("weight"),
      images,
    }

    console.log("Form data being sent:", productData)
    console.log("Category ID from form:", formData.get("categoryId"))

    try {
      const url = product ? `/api/products/${product.id}` : "/api/products"
      const method = product ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      })

      if (response.ok) {
        toast({
          title: product ? "Product updated!" : "Product created!",
          description: "Your product has been saved successfully.",
        })
        router.push("/dashboard")
      } else {
        throw new Error("Failed to save product")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="name">Product Name *</Label>
            <Input id="name" name="name" required defaultValue={product?.name || ""} placeholder="Enter product name" />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              required
              defaultValue={product?.description || ""}
              placeholder="Describe your product..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price (KES) *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                required
                defaultValue={product?.price || ""}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="inventory">Inventory Quantity *</Label>
              <Input
                id="inventory"
                name="inventory"
                type="number"
                min="0"
                required
                defaultValue={product?.inventory || ""}
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="weight">Product Weight (kg) *</Label>
            <Input
              id="weight"
              name="weight"
              type="number"
              step="0.01"
              min="0.01"
              required
              defaultValue={product?.weight || ""}
              placeholder="e.g., 0.5 for 500g items"
            />
            <p className="text-sm text-gray-500 mt-1">
              Weight is used to calculate accurate shipping costs for customers
            </p>
          </div>

          <div>
            <Label htmlFor="categoryId">Category *</Label>
            <Select name="categoryId" defaultValue={product?.categoryId || ""} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Product Images *</Label>
            <div className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <ImageIcon className="w-8 h-8 mb-4 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> product images
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, JPEG up to 5MB each</p>
                  </div>
                  <input
                    id="image-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
              </div>

              {isUploading && (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-800"></div>
                  <span className="ml-2 text-sm text-gray-600">Uploading images...</span>
                </div>
              )}

              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`Product image ${index + 1}`}
                        className="w-full h-32 object-cover rounded border"
                      />
                      <Button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 w-6 h-6 p-0 bg-red-600 hover:bg-red-700"
                        variant="destructive"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-4">
            <Button
              type="submit"
              disabled={isSubmitting || images.length === 0 || isUploading}
              className="bg-red-800 hover:bg-red-900"
            >
              {isSubmitting ? "Saving..." : product ? "Update Product" : "Create Product"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
