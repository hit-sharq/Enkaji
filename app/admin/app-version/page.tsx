"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

export default function AppVersionAdminPage() {
  const [latestVersion, setLatestVersion] = useState("")
  const [forceUpdate, setForceUpdate] = useState(false)
  const [releaseNotes, setReleaseNotes] = useState("")
  const [downloadUrl, setDownloadUrl] = useState("")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetch("/api/app-version")
      .then((r) => r.json())
      .then((d) => {
        setLatestVersion(d.latestVersion || "")
        setForceUpdate(!!d.forceUpdate)
        setReleaseNotes(d.releaseNotes || "")
        setDownloadUrl(d.downloadUrl || "")
      })
  }, [])

  const save = async () => {
    setSaving(true)
    setMessage("")
    try {
      const res = await fetch("/api/app-version", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latestVersion, forceUpdate, releaseNotes, downloadUrl }),
      })
      const d = await res.json()
      setMessage(res.ok ? "Saved! Mobile users will see the update prompt." : d.error || "Failed")
    } catch {
      setMessage("Network error")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <span className="enkaji-eyebrow mb-2 block">Admin</span>
        <h1 className="font-display text-3xl font-bold tracking-tight mb-2">App Version Config</h1>
        <p className="text-muted-foreground">
          Update the mobile app version info at runtime. No Vercel redeploy needed.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Version Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="version">Latest Version</Label>
            <Input id="version" value={latestVersion} onChange={(e) => setLatestVersion(e.target.value)} placeholder="1.0.2" />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="force">Force Update</Label>
              <p className="text-sm text-muted-foreground">Blocks app usage until updated</p>
            </div>
            <Switch id="force" checked={forceUpdate} onCheckedChange={setForceUpdate} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Release Notes</Label>
            <Textarea id="notes" value={releaseNotes} onChange={(e) => setReleaseNotes(e.target.value)} placeholder="Bug fixes and improvements" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">APK / Store URL</Label>
            <Input id="url" value={downloadUrl} onChange={(e) => setDownloadUrl(e.target.value)} placeholder="https://..." />
          </div>

          <Button onClick={save} disabled={saving} className="w-full">
            {saving ? "Saving..." : "Save Changes"}
          </Button>

          {message && <p className="text-sm text-muted-foreground text-center">{message}</p>}
        </CardContent>
      </Card>
    </div>
  )
}
