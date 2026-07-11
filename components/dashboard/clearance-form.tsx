"use client"

import * as React from "react"
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

interface ClearanceFormProps {
  categories: Category[]
}

const reasonOptions = [
  "Overstock",
  "End of Season",
  "Warehouse Clearance",
  "Product Upgrade",
  "Business Closure",
  "Other",
]

export function ClearanceListingForm({ categories }: ClearanceFormProps) {
  const [images, setImages] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categoryId, setCategoryId] = useState("")
  const [reason, setReason] = useState("")
  const [clearanceEndDate, setClearanceEndDate] = useState("")
  const [price, setPrice] = useState("")
  const [comparePrice, setComparePrice] = useState("")
  const [inventory, setInventory] = useState("")
  const [weight, setWeight] = useState("")
  const { toast } = useToast()
  const router = useRouter()

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
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
      toast({ title: "Images uploaded!", description: `${uploadedUrls.length} image(s) uploaded successfully.` })
    } catch (error) {
      toast({ title: "Upload failed", description: "Unable to upload images. Please try again.", variant: "destructive" })
    } finally {
      setIsUploading(false)
      if (event.target) event.target.value = ""
    }
  }

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const productData = {
      name: formData.get("name"),
      description: formData.get("description"),
      price: formData.get("price"),
      comparePrice: formData.get("comparePrice"),
      inventory: formData.get("inventory"),
      categoryId,
      weight: formData.get("weight"),
      images,
      isClearance: true,
      clearanceReason: reason,
      clearanceEndDate,
      isShopApproved: false,
    }

    try {
      const response = await fetch("/api/clearance/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const message = errorData.error || "Unable to save clearance listing"
        throw new Error(message)
      }

      toast({ 
        title: "Submitted for approval", 
        description: "Your clearance deal has been submitted and is pending admin approval." 
      })
      router.push("/dashboard/clearance")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create clearance deal"
      toast({ title: "Error", description: message, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const computedSavings = () => {
    const original = Number(comparePrice)
    const sale = Number(price)

    if (!original || !sale || original <= sale) return null
    const amount = original - sale
    const percentage = Math.round((amount / original) * 100)
    return { amount, percentage }
  }

  const savings = computedSavings()

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="name">Product Name *</Label>
            <Input id="name" name="name" required placeholder="Enter product name" />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea id="description" name="description" required placeholder="Describe the clearance stock" rows={5} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="comparePrice">Original Price (KES) *</Label>
              <Input
                id="comparePrice"
                name="comparePrice"
                type="number"
                min="0"
                step="0.01"
                value={comparePrice}
                onChange={(e) => setComparePrice(e.target.value)}
                required
                placeholder="Original price"
              />
            </div>
            <div>
              <Label htmlFor="price">Clearance Price (KES) *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                placeholder="Clearance price"
              />
            </div>
          </div>

          {savings && (
            <div className="rounded-3xl border border-enkaji-ochre bg-enkaji-brown p-4 text-sm text-enkaji-brown">
              Save KES {savings.amount.toLocaleString()} ({savings.percentage}% off)
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="inventory">Quantity Available *</Label>
              <Input
                id="inventory"
                name="inventory"
                type="number"
                min="0"
                value={inventory}
                onChange={(e) => setInventory(e.target.value)}
                required
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="weight">Weight (kg) *</Label>
              <Input
                id="weight"
                name="weight"
                type="number"
                min="0.01"
                step="0.01"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                required
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="categoryId">Category *</Label>
              <Select value={categoryId} onValueChange={setCategoryId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="clearanceReason">Reason for Clearance *</Label>
              <Select value={reason} onValueChange={setReason} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  {reasonOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="clearanceEndDate">Clearance End Date *</Label>
              <Input
                id="clearanceEndDate"
                name="clearanceEndDate"
                type="date"
                value={clearanceEndDate}
                onChange={(e) => setClearanceEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label>Product Images *</Label>
            <div className="space-y-4">
              <label className="flex flex-col items-center justify-center w-full h-32 rounded-3xl border border-dashed border-muted-foreground bg-muted text-center text-sm text-muted-foreground hover:border-muted-foreground hover:bg-muted transition">
                <div className="flex flex-col items-center gap-2">
                  <ImageIcon className="h-6 w-6" />
                  <span>Click to upload images</span>
                  <span className="text-xs text-muted-foreground">PNG, JPG, JPEG up to 5MB each</span>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </label>

              {isUploading && <p className="text-sm text-muted-foreground">Uploading images…</p>}

              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {images.map((src, index) => (
                    <div key={index} className="group relative overflow-hidden rounded-3xl border border-muted-foreground">
                      <img src={src} alt={`Clearance image ${index + 1}`} className="h-28 w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button type="submit" disabled={isSubmitting || images.length === 0 || isUploading} className="bg-enkaji-ink text-white">
              {isSubmitting ? "Creating..." : "Create Clearance Deal"}
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
