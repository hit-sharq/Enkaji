"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2, Store, Check, Crown } from "lucide-react"
import { toast } from "sonner"

interface SellerRegistrationFormProps {
  user: {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
  }
}

const planOptions = [
  {
    value: "BASIC",
    name: "Basic",
    price: "Free",
    description: "Up to 10 products, 5% commission",
  },
  {
    value: "PREMIUM",
    name: "Premium", 
    price: "KES 1,500/month",
    description: "Unlimited products, 3% commission",
  },
  {
    value: "ENTERPRISE",
    name: "Enterprise",
    price: "KES 5,000/month",
    description: "Everything + API access, 2% commission",
  },
]

export function SellerRegistrationForm({ user }: SellerRegistrationFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    businessName: "",
    description: "",
    location: "",
    phoneNumber: "",
    website: "",
    businessType: "",
    plan: "BASIC",
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/seller/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to create seller profile")
      }

      toast.success("Seller profile created successfully!")
      router.push("/dashboard")
    } catch (error) {
      toast.error("Failed to create seller profile. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSelectChange = (value: string) => {
    setFormData({
      ...formData,
      businessType: value,
    })
  }

  const handlePlanChange = (value: string) => {
    setFormData({
      ...formData,
      plan: value,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Store className="w-5 h-5" />
          <span>Seller Profile Setup</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6">
          <AlertDescription>
            Complete your seller profile to start listing products. All fields are optional but recommended for better
            visibility.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" value={user.firstName ?? ""} disabled className="bg-gray-50" />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" value={user.lastName ?? ""} disabled className="bg-gray-50" />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user.email} disabled className="bg-gray-50" />
          </div>

          <div>
            <Label htmlFor="businessName">Business Name</Label>
            <Input
              id="businessName"
              name="businessName"
              value={formData.businessName}
              onChange={handleInputChange}
              placeholder="e.g., Nairobi Electronics Ltd"
            />
          </div>

          <div>
            <Label htmlFor="businessType">Business Type</Label>
            <Select onValueChange={handleSelectChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select your business type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manufacturer">Manufacturer</SelectItem>
                <SelectItem value="wholesaler">Wholesaler</SelectItem>
                <SelectItem value="retailer">Retailer</SelectItem>
                <SelectItem value="distributor">Distributor</SelectItem>
                <SelectItem value="individual">Individual Seller</SelectItem>
                <SelectItem value="service-provider">Service Provider</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="+254 700 000 000"
            />
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="e.g., Nairobi, Kenya"
            />
          </div>

          <div>
            <Label htmlFor="website">Website (Optional)</Label>
            <Input
              id="website"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              placeholder="https://your-website.com"
            />
          </div>

          <div>
            <Label htmlFor="description">Business Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Tell customers about your business, products, and what makes you unique..."
              rows={4}
            />
          </div>

          {/* Plan Selection */}
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-orange-600" />
              <Label className="text-lg font-semibold">Select Your Plan</Label>
            </div>
            <p className="text-sm text-gray-500">Choose the plan that best fits your business needs. You can upgrade anytime.</p>
            
            <RadioGroup 
              value={formData.plan} 
              onValueChange={handlePlanChange}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {planOptions.map((plan) => (
                <Label
                  key={plan.value}
                  className={`flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-orange-300 ${
                    formData.plan === plan.value 
                      ? "border-orange-500 bg-orange-50" 
                      : "border-gray-200"
                  }`}
                >
                  <RadioGroupItem value={plan.value} className="sr-only" />
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{plan.name}</span>
                    {formData.plan === plan.value && (
                      <Check className="w-5 h-5 text-orange-600" />
                    )}
                  </div>
                  <div className="text-lg font-bold text-orange-600">{plan.price}</div>
                  <div className="text-sm text-gray-500 mt-1">{plan.description}</div>
                </Label>
              ))}
            </RadioGroup>
          </div>

          <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Profile...
              </>
            ) : (
              "Create Seller Profile"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
