"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Loader2 } from "lucide-react"

export default function AdminSettingsPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [name, setName] = useState("")
  const [profileUrl, setProfileUrl] = useState("")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (user) {
      setName(user.name || "")
      setProfileUrl(user.profileUrl || "")
    }
  }, [user])

  if (isLoading) {
    return <div className="p-10 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  }

  if (!isAuthenticated || !user) {
    return null // Layout should redirect, but just in case
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage("")

    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, profileUrl })
      })

      if (res.ok) {
        setMessage("Settings saved successfully!")
        // Force reload to update user in auth context
        setTimeout(() => window.location.reload(), 1500)
      } else {
        setMessage("Failed to save settings")
      }
    } catch (error) {
      console.error("Save failed", error)
      setMessage("An error occurred")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Account Settings</h1>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden max-w-2xl">
        <form onSubmit={handleSave} className="p-8 space-y-6">
          {message && (
            <div className={`p-4 rounded-md text-sm font-medium ${message.includes('success') ? 'bg-green-500/10 text-green-600 border border-green-500/20' : 'bg-destructive/10 text-destructive border border-destructive/20'}`}>
              {message}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground/80">Xentro Public Profile URL</label>
            <input
              type="url"
              value={profileUrl}
              onChange={(e) => setProfileUrl(e.target.value)}
              placeholder="https://xentro.in/username"
              className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
            />
            <p className="text-xs text-muted-foreground mt-2">Must be a valid Xentro public profile URL (starts with https://xentro.in/).</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground/80">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Admin Name"
              className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground/80">Email Address</label>
            <input
              type="email"
              value={user.email || ""}
              disabled
              className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-muted-foreground opacity-70 cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground mt-2">Email address cannot be changed.</p>
          </div>

          <div className="pt-4 border-t border-border flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-all shadow-sm flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
