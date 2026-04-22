"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Scissors, Car, Home, GraduationCap, Heart, 
  Wrench, Camera, Music, Dumbbell, ChefHat, Stethoscope,
  CheckCircle, ArrowRight, Loader2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const businessTypes = [
  { value: "barbershop", label: "Barbershop", icon: Scissors },
  { value: "salon", label: "Hair & Beauty Salon", icon: Heart },
  { value: "spa", label: "Spa & Wellness", icon: Dumbbell },
  { value: "mechanic", label: "Car Mechanic / Auto Repair", icon: Car },
  { value: "tutor", label: "Tutoring / Education", icon: GraduationCap },
  { value: "cleaning", label: "Cleaning Services", icon: Home },
  { value: "photographer", label: "Photography", icon: Camera },
  { value: "caterer", label: "Catering", icon: ChefHat },
  { value: "musician", label: "Entertainment / Music", icon: Music },
  { value: "handyman", label: "Repairs & Handyman", icon: Wrench },
  { value: "professional", label: "Professional Services", icon: Stethoscope },
  { value: "other", label: "Other", icon: Heart },
]

const counties = [
  "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika", "Malindi", 
  "Kitale", "Garissa", "Nyeri", "Meru", "Kakamega", "Kericho", "Migori",
  "Embu", "Kisii", "Limuru", "Ruiru", "Kiambu", "Machakos"
]

export default function ServiceProviderRegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    // Business Info
    businessName: "",
    businessType: "",
    description: "",
    yearsExperience: "",
    
    // Contact
    phone: "",
    email: "",
    whatsapp: "",
    
    // Location
    address: "",
    city: "",
    county: "",
    
    // Terms
    agreeTerms: false,
  })

  const handleSubmit = async () => {
    if (!formData.businessName || !formData.businessType || !formData.phone || !formData.city) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (!formData.agreeTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the terms and conditions",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    
    // In production, submit to API
    setTimeout(() => {
      setLoading(false)
      toast({
        title: "Application Submitted!",
        description: "We'll review your application and get back to you within 24 hours.",
      })
      router.push("/dashboard/services")
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Register as Service Provider</h1>
          <p className="text-gray-600">Join Enkaji and start getting bookings from customers across Kenya</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                step >= s ? "bg-[#8B2635] text-white" : "bg-gray-200 text-gray-500"
              }`}>
                {step > s ? <CheckCircle className="h-5 w-5" /> : s}
              </div>
              {s < 3 && (
                <div className={`w-16 h-1 ${step > s ? "bg-[#8B2635]" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && "Business Information"}
              {step === 2 && "Contact & Location"}
              {step === 3 && "Review & Submit"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Tell us about your business"}
              {step === 2 && "How can customers reach you?"}
              {step === 3 && "Review your information"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 1 && (
              <>
                <div>
                  <Label>Business Name *</Label>
                  <Input 
                    placeholder="Your business name"
                    value={formData.businessName}
                    onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label>Business Type *</Label>
                  <Select 
                    value={formData.businessType}
                    onValueChange={(value) => setFormData({...formData, businessType: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {businessTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="h-4 w-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Years of Experience</Label>
                  <Input 
                    type="number"
                    placeholder="e.g., 5"
                    value={formData.yearsExperience}
                    onChange={(e) => setFormData({...formData, yearsExperience: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea 
                    placeholder="Tell customers about your services..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Phone Number *</Label>
                    <Input 
                      placeholder="07XX XXX XXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>WhatsApp Number</Label>
                    <Input 
                      placeholder="07XX XXX XXX"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label>Email</Label>
                  <Input 
                    type="email"
                    placeholder="business@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Street Address</Label>
                  <Input 
                    placeholder="e.g., Westlands Business Center"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>City/Town *</Label>
                    <Input 
                      placeholder="e.g., Nairobi"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>County *</Label>
                    <Select 
                      value={formData.county}
                      onValueChange={(value) => setFormData({...formData, county: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select county" />
                      </SelectTrigger>
                      <SelectContent>
                        {counties.map((county) => (
                          <SelectItem key={county} value={county}>{county}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                  <h3 className="font-semibold">Business Details</h3>
                  <p><strong>Name:</strong> {formData.businessName}</p>
                  <p><strong>Type:</strong> {businessTypes.find(t => t.value === formData.businessType)?.label}</p>
                  <p><strong>Experience:</strong> {formData.yearsExperience || "Not specified"} years</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                  <h3 className="font-semibold">Contact</h3>
                  <p><strong>Phone:</strong> {formData.phone}</p>
                  <p><strong>WhatsApp:</strong> {formData.whatsapp || "Not specified"}</p>
                  <p><strong>Email:</strong> {formData.email || "Not specified"}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                  <h3 className="font-semibold">Location</h3>
                  <p><strong>Address:</strong> {formData.address || "Not specified"}</p>
                  <p><strong>City:</strong> {formData.city}</p>
                  <p><strong>County:</strong> {formData.county}</p>
                </div>

                <div className="flex items-start gap-2">
                  <Checkbox 
                    id="terms"
                    checked={formData.agreeTerms}
                    onCheckedChange={(checked) => setFormData({...formData, agreeTerms: checked as boolean})}
                  />
                  <Label htmlFor="terms" className="text-sm">
                    I agree to the <a href="/terms" className="text-[#8B2635] underline">Terms of Service</a> and 
                    <a href="/privacy" className="text-[#8B2635] underline"> Privacy Policy</a>
                  </Label>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              {step > 1 && (
                <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
                  Back
                </Button>
              )}
              {step < 3 ? (
                <Button 
                  className="flex-1 bg-[#8B2635] hover:bg-[#7a1f2e]"
                  onClick={() => setStep(step + 1)}
                >
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  className="flex-1 bg-[#8B2635] hover:bg-[#7a1f2e]"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                  Submit Application
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-semibold">Verified Badge</h3>
              <p className="text-sm text-gray-600">Get verified and build trust</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-semibold">Easy Bookings</h3>
              <p className="text-sm text-gray-600">Manage all bookings in one place</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-semibold">Get Paid Online</h3>
              <p className="text-sm text-gray-600">Accept M-Pesa & cards</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
