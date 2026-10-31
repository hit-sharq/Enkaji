"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { User, Bell, Shield, CreditCard, Globe, Trash2, Save, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { csrfFetch } from "@/lib/csrf-client"

interface UserProfile {
  firstName: string | null
  lastName: string | null
  email: string
}

export default function SettingsPage() {
  const { toast } = useToast()
  const [profile, setProfile] = useState<UserProfile>({ firstName: "", lastName: "", email: "" })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Notification prefs (persisted locally)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [orderUpdates, setOrderUpdates] = useState(true)
  const [marketingEmails, setMarketingEmails] = useState(false)
  const [smsAlerts, setSmsAlerts] = useState(true)

  // Privacy prefs
  const [profileVisibility, setProfileVisibility] = useState("public")
  const [showEmail, setShowEmail] = useState(false)
  const [showPhone, setShowPhone] = useState(false)

  // Billing
  const [currency, setCurrency] = useState("KES")

  useEffect(() => {
    // Load profile
    fetch("/api/user/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d && !d.error) {
          setProfile({
            firstName: d.firstName || "",
            lastName: d.lastName || "",
            email: d.email || "",
          })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))

    // Load local prefs
    try {
      const n = JSON.parse(localStorage.getItem("enkaji_notif_prefs") || "{}")
      if (n.emailNotifications !== undefined) setEmailNotifications(n.emailNotifications)
      if (n.orderUpdates !== undefined) setOrderUpdates(n.orderUpdates)
      if (n.marketingEmails !== undefined) setMarketingEmails(n.marketingEmails)
      if (n.smsAlerts !== undefined) setSmsAlerts(n.smsAlerts)
      const pr = JSON.parse(localStorage.getItem("enkaji_privacy_prefs") || "{}")
      if (pr.profileVisibility) setProfileVisibility(pr.profileVisibility)
      if (pr.showEmail !== undefined) setShowEmail(pr.showEmail)
      if (pr.showPhone !== undefined) setShowPhone(pr.showPhone)
      const c = localStorage.getItem("enkaji_currency")
      if (c) setCurrency(c)
    } catch {}
  }, [])

  const saveProfile = async () => {
    setSaving(true)
    try {
      const res = await csrfFetch("/api/user/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: profile.firstName, lastName: profile.lastName }),
      })
      const d = await res.json()
      if (res.ok) {
        toast({ title: "Profile saved", description: "Your profile has been updated." })
      } else {
        toast({ title: "Error", description: d.error || "Failed to save", variant: "destructive" })
      }
    } catch {
      toast({ title: "Error", description: "Network error", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const saveNotifPrefs = () => {
    localStorage.setItem("enkaji_notif_prefs", JSON.stringify({ emailNotifications, orderUpdates, marketingEmails, smsAlerts }))
    toast({ title: "Saved", description: "Notification preferences updated." })
  }

  const savePrivacyPrefs = () => {
    localStorage.setItem("enkaji_privacy_prefs", JSON.stringify({ profileVisibility, showEmail, showPhone }))
    toast({ title: "Saved", description: "Privacy preferences updated." })
  }

  const saveCurrency = () => {
    localStorage.setItem("enkaji_currency", currency)
    toast({ title: "Saved", description: "Currency preference updated." })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="h-8 bg-muted rounded-xl w-1/3 animate-pulse" />
            <div className="h-64 bg-muted rounded-xl animate-pulse" />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <p className="enkaji-eyebrow mb-2 block">Account</p>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">Account Settings</h1>
            <p className="text-muted-foreground mt-2">Manage your account preferences and settings</p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-display font-semibold">
                    <User className="w-5 h-5" />
                    Profile Information
                  </CardTitle>
                  <CardDescription>Update your personal information and profile details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" value={profile.firstName || ""} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} placeholder="Enter your first name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" value={profile.lastName || ""} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} placeholder="Enter your last name" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" value={profile.email} disabled placeholder="Your email" />
                    <p className="text-xs text-muted-foreground">Email is managed by your auth provider.</p>
                  </div>
                  <Button onClick={saveProfile} disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-display font-semibold">
                    <Bell className="w-5 h-5" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>Choose how you want to be notified</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Order Updates</Label>
                      <p className="text-sm text-muted-foreground">Get notified about order status changes</p>
                    </div>
                    <Switch checked={orderUpdates} onCheckedChange={setOrderUpdates} />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>SMS Alerts</Label>
                      <p className="text-sm text-muted-foreground">Receive SMS for important updates</p>
                    </div>
                    <Switch checked={smsAlerts} onCheckedChange={setSmsAlerts} />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Marketing Emails</Label>
                      <p className="text-sm text-muted-foreground">Receive promotional emails</p>
                    </div>
                    <Switch checked={marketingEmails} onCheckedChange={setMarketingEmails} />
                  </div>
                  <Button onClick={saveNotifPrefs} className="mt-4">Save Preferences</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-display font-semibold">
                    <Shield className="w-5 h-5" />
                    Privacy Settings
                  </CardTitle>
                  <CardDescription>Control your privacy and data sharing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Profile Visibility</Label>
                    <Select value={profileVisibility} onValueChange={setProfileVisibility}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="contacts">Contacts Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Show Email</Label>
                      <p className="text-sm text-muted-foreground">Display email on your public profile</p>
                    </div>
                    <Switch checked={showEmail} onCheckedChange={setShowEmail} />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Show Phone</Label>
                      <p className="text-sm text-muted-foreground">Display phone on your public profile</p>
                    </div>
                    <Switch checked={showPhone} onCheckedChange={setShowPhone} />
                  </div>
                  <Button onClick={savePrivacyPrefs} className="mt-4">Save Preferences</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-display font-semibold">
                    <CreditCard className="w-5 h-5" />
                    Billing & Currency
                  </CardTitle>
                  <CardDescription>Manage your billing preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Preferred Currency</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="KES">KES (Kenyan Shilling)</SelectItem>
                        <SelectItem value="USD">USD (US Dollar)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={saveCurrency} className="mt-4">Save Preference</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="account" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-display font-semibold">
                    <Trash2 className="w-5 h-5" />
                    Account Management
                  </CardTitle>
                  <CardDescription>Manage your account settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    To delete your account or change your email, please contact support.
                  </p>
                  <Button variant="destructive" onClick={() => window.confirm("Are you sure? Contact support to proceed.")}>
                    Request Account Deletion
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
