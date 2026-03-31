"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Smartphone, Building, Save, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PaymentSettingsFormProps {
  user: {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
  }
  sellerProfile?: {
    bankDetails?: string | null
  } | null
}

export function PaymentSettingsForm({ user, sellerProfile }: PaymentSettingsFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [payoutMethod, setPayoutMethod] = useState<string>("")
  const [mpesaDetails, setMpesaDetails] = useState({
    phoneNumber: "",
  })
  const [bankDetails, setBankDetails] = useState({
    bankName: "",
    accountNumber: "",
    accountName: "",
    swiftCode: "",
  })

  // Parse existing bank details if available
  useState(() => {
    if (sellerProfile?.bankDetails) {
      try {
        const parsed = JSON.parse(sellerProfile.bankDetails)
        if (parsed.method === "MPESA") {
          setPayoutMethod("MPESA")
          setMpesaDetails({ phoneNumber: parsed.phoneNumber || "" })
        } else if (parsed.method === "BANK_TRANSFER") {
          setPayoutMethod("BANK_TRANSFER")
          setBankDetails({
            bankName: parsed.bankName || "",
            accountNumber: parsed.accountNumber || "",
            accountName: parsed.accountName || "",
            swiftCode: parsed.swiftCode || "",
          })
        }
      } catch (e) {
        console.error("Error parsing bank details:", e)
      }
    }
  })

  const handleSave = async () => {
    if (!payoutMethod) {
      toast({
        title: "Error",
        description: "Please select a payout method",
        variant: "destructive",
      })
      return
    }

    if (payoutMethod === "MPESA" && !mpesaDetails.phoneNumber) {
      toast({
        title: "Error",
        description: "Please enter your M-Pesa phone number",
        variant: "destructive",
      })
      return
    }

    if (payoutMethod === "BANK_TRANSFER" && (!bankDetails.bankName || !bankDetails.accountNumber || !bankDetails.accountName)) {
      toast({
        title: "Error",
        description: "Please fill in all bank details",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const paymentData = payoutMethod === "MPESA"
        ? { method: "MPESA", ...mpesaDetails }
        : { method: "BANK_TRANSFER", ...bankDetails }

      const response = await fetch("/api/seller/payment-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bankDetails: JSON.stringify(paymentData) }),
      })

      if (response.ok) {
        setSaved(true)
        toast({
          title: "Success",
          description: "Payment settings saved successfully",
        })
        setTimeout(() => setSaved(false), 3000)
      } else {
        const data = await response.json()
        throw new Error(data.error || "Failed to save payment settings")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save payment settings",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payout Method</CardTitle>
          <CardDescription>
            Select your preferred payout method. This will be used when processing your payouts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="payout-method">Select Payout Method</Label>
            <Select value={payoutMethod} onValueChange={setPayoutMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Choose how you want to receive payouts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MPESA">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    M-Pesa
                  </div>
                </SelectItem>
                <SelectItem value="BANK_TRANSFER">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Bank Transfer
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {payoutMethod === "MPESA" && (
            <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-semibold flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                M-Pesa Details
              </h3>
              <div>
                <Label htmlFor="mpesa-phone">M-Pesa Phone Number</Label>
                <Input
                  id="mpesa-phone"
                  placeholder="0712345678"
                  value={mpesaDetails.phoneNumber}
                  onChange={(e) => setMpesaDetails({ phoneNumber: e.target.value })}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Enter the phone number registered with M-Pesa
                </p>
              </div>
            </div>
          )}

          {payoutMethod === "BANK_TRANSFER" && (
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold flex items-center gap-2">
                <Building className="h-4 w-4" />
                Bank Account Details
              </h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="bank-name">Bank Name</Label>
                  <Input
                    id="bank-name"
                    placeholder="e.g., KCB Bank, Equity Bank"
                    value={bankDetails.bankName}
                    onChange={(e) => setBankDetails((prev) => ({ ...prev, bankName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="account-number">Account Number</Label>
                  <Input
                    id="account-number"
                    placeholder="Your bank account number"
                    value={bankDetails.accountNumber}
                    onChange={(e) => setBankDetails((prev) => ({ ...prev, accountNumber: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="account-name">Account Name</Label>
                  <Input
                    id="account-name"
                    placeholder="Account holder name"
                    value={bankDetails.accountName}
                    onChange={(e) => setBankDetails((prev) => ({ ...prev, accountName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="swift-code">SWIFT Code (Optional)</Label>
                  <Input
                    id="swift-code"
                    placeholder="SWIFT/BIC code for international transfers"
                    value={bankDetails.swiftCode}
                    onChange={(e) => setBankDetails((prev) => ({ ...prev, swiftCode: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          )}

          <Button onClick={handleSave} disabled={isLoading || !payoutMethod} className="w-full">
            {isLoading ? (
              "Saving..."
            ) : saved ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Payment Settings
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Important Information</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
            <li>Your payment details are stored securely and encrypted</li>
            <li>Payouts are processed within 3-5 business days after approval</li>
            <li>Minimum payout amount is KES 1,000</li>
            <li>You can update your payment details anytime</li>
            <li>Make sure your details are correct to avoid payout delays</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
