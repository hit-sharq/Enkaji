"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { FileText, Send, Plus, X } from "lucide-react"

interface RFQItem {
  productName: string
  quantity: number
  specifications: string
}

export function RFQForm() {
  const [items, setItems] = useState<RFQItem[]>([{ productName: "", quantity: 1, specifications: "" }])
  const [category, setCategory] = useState("")
  const [budget, setBudget] = useState("")
  const [deadline, setDeadline] = useState("")
  const [additionalInfo, setAdditionalInfo] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const addItem = () => {
    setItems([...items, { productName: "", quantity: 1, specifications: "" }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index: number, field: keyof RFQItem, value: string | number) => {
    const updatedItems = items.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    setItems(updatedItems)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/rfq", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items,
          category,
          budget,
          deadline,
          additionalInfo,
        }),
      })

      if (response.ok) {
        toast({
          title: "RFQ submitted successfully!",
          description: "Relevant artisans will receive your request and respond with quotes.",
        })
        // Reset form
        setItems([{ productName: "", quantity: 1, specifications: "" }])
        setCategory("")
        setBudget("")
        setDeadline("")
        setAdditionalInfo("")
      } else {
        throw new Error("Failed to submit RFQ")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit RFQ. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Request for Quotation (RFQ)
        </CardTitle>
        <p className="text-gray-600">Describe what you need and get quotes from multiple artisans across Kenya</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selection */}
          <div>
            <Label htmlFor="category">Product Category *</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="electronics">Electronics & Technology</SelectItem>
                <SelectItem value="fashion-apparel">Fashion & Apparel</SelectItem>
                <SelectItem value="home-garden">Home & Garden</SelectItem>
                <SelectItem value="agriculture">Agriculture & Food</SelectItem>
                <SelectItem value="construction">Construction Materials</SelectItem>
                <SelectItem value="automotive">Automotive</SelectItem>
                <SelectItem value="traditional-crafts">Traditional Crafts</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Product Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label>Product Requirements *</Label>
              <Button type="button" onClick={addItem} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Item {index + 1}</h4>
                    {items.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeItem(index)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Product Name *</Label>
                      <Input
                        value={item.productName}
                        onChange={(e) => updateItem(index, "productName", e.target.value)}
                        placeholder="e.g., Custom wooden furniture"
                        required
                      />
                    </div>
                    <div>
                      <Label>Quantity *</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label>Specifications & Requirements</Label>
                    <Textarea
                      value={item.specifications}
                      onChange={(e) => updateItem(index, "specifications", e.target.value)}
                      placeholder="Describe size, materials, colors, quality requirements, etc."
                      rows={3}
                    />
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Budget and Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="budget">Budget Range (KSh)</Label>
              <Select value={budget} onValueChange={setBudget}>
                <SelectTrigger>
                  <SelectValue placeholder="Select budget range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="under-10k">Under KSh 10,000</SelectItem>
                  <SelectItem value="10k-50k">KSh 10,000 - 50,000</SelectItem>
                  <SelectItem value="50k-100k">KSh 50,000 - 100,000</SelectItem>
                  <SelectItem value="100k-500k">KSh 100,000 - 500,000</SelectItem>
                  <SelectItem value="500k-1m">KSh 500,000 - 1,000,000</SelectItem>
                  <SelectItem value="over-1m">Over KSh 1,000,000</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="deadline">Required Delivery Date</Label>
              <Input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <Label htmlFor="additionalInfo">Additional Information</Label>
            <Textarea
              id="additionalInfo"
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="Any other requirements, preferred locations, certifications needed, etc."
              rows={4}
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full bg-orange-600 hover:bg-orange-700" size="lg">
            <Send className="w-4 h-4 mr-2" />
            {isSubmitting ? "Submitting RFQ..." : "Submit RFQ"}
          </Button>

          <p className="text-sm text-gray-500 text-center">
            Your RFQ will be sent to relevant artisans. You'll receive quotes within 24-48 hours.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
