"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Store, User, Phone, Mail, MapPin, FileText } from "lucide-react"

export function ClearanceBusinessForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      businessName: formData.get("businessName"),
      businessType: formData.get("businessType"),
      location: formData.get("location"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      description: formData.get("description"),
    }

    try {
      const response = await fetch("/api/clearance/business/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to submit application")
      }

      toast({
        title: "Application submitted",
        description: "Your business details have been submitted for review. We'll notify you once approved.",
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to submit application"
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="rounded-2xl border-0 bg-white/80 backdrop-blur-sm shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-100">
            <Store className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-lg">Apply for Clearance Deals</CardTitle>
            <CardDescription>Submit your business details for admin approval</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name *</Label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input id="businessName" name="businessName" required placeholder="Your business name" className="pl-10 rounded-xl" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessType">Business Type *</Label>
              <Select name="businessType" required>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="retail">Retail Store</SelectItem>
                  <SelectItem value="wholesale">Wholesale / Distributor</SelectItem>
                  <SelectItem value="manufacturer">Manufacturer</SelectItem>
                  <SelectItem value="ecommerce">E-commerce</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input id="location" name="location" required placeholder="City / Area" className="pl-10 rounded-xl" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input id="phone" name="phone" required placeholder="+254 7XX XXX XXX" className="pl-10 rounded-xl" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input id="email" name="email" type="email" required placeholder="business@example.com" className="pl-10 rounded-xl" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Business Description</Label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Textarea id="description" name="description" placeholder="Tell us about your business and what you plan to clear..." className="pl-10 rounded-xl min-h-[100px]" />
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700">
            {isSubmitting ? "Submitting..." : "Submit for Approval"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
