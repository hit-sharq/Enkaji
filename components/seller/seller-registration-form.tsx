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
  const [isSuccess, setIsSuccess] = useState(false)
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

    // Validate required fields
    if (!formData.businessName || !formData.location || !formData.phoneNumber || !formData.businessType) {
      toast.error("Please fill in all required fields: Business Name, Business Type, Phone Number, and Location")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/seller/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

if (!response.ok) {
        let errorMessage = "Failed to create seller profile"
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch {
          errorMessage = `Server error: ${response.status}`
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      
      // Check if payment is required (for PREMIUM or ENTERPRISE plans)
      if (data.requiresPayment && data.redirectUrl) {
        toast.success("Redirecting to payment...")
        // Redirect to Pesapal payment page
        window.location.href = data.redirectUrl
        return
      }

      setIsSuccess(true)
      toast.success("Seller profile created successfully!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create seller profile. Please try again.")
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

  if (isSuccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Check className="w-5 h-5 text-green-600" />
            <span>Registration Successful!</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Your seller account has been created!</h3>
            <p className="text-gray-600 mb-4">
              We've sent a confirmation email to <strong>{user.email}</strong> with the list of required legal documents.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left mb-6">
              <h4 className="font-semibold mb-2">Next Step: Complete Verification</h4>
              <p className="text-sm text-gray-600 mb-2">
                To access your seller dashboard and start selling, please upload the required documents:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Business Registration Certificate</li>
                <li>KRA PIN Certificate</li>
                <li>CR12 Form</li>
                <li>Director's ID/Passport</li>
              </ul>
            </div>
            <div className="space-y-3">
              <Button 
                onClick={() => router.push("/dashboard")}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                Go to Dashboard
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push("/")}
                className="w-full"
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
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
            Complete your seller profile to start listing products. Fields marked with * are required.
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
            <Label htmlFor="businessName">Business Name *</Label>
            <Input
              id="businessName"
              name="businessName"
              value={formData.businessName}
              onChange={handleInputChange}
              placeholder="e.g., Nairobi Electronics Ltd"
              required
            />
          </div>

          <div>
            <Label htmlFor="businessType">Business Type *</Label>
            <Select onValueChange={handleSelectChange} required>
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
            <Label htmlFor="phoneNumber">Phone Number *</Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="+254 700 000 000"
              required
            />
          </div>

          <div>
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="e.g., Nairobi, Kenya"
              required
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
