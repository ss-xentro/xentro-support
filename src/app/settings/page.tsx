"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Navbar } from "@/components/navbar"
import { Loader2, UploadCloud, User } from "lucide-react"

export default function SettingsPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [name, setName] = useState("")
  const [image, setImage] = useState("")
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (user) {
      setName(user.name || "")
      setImage(user.image || "")
    }
  }, [user])

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  }

  if (!isAuthenticated || !user) {
    return null // Next.js middleware should redirect if needed, but just in case
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    
    setUploading(true)
    const file = e.target.files[0]
    const formData = new FormData()
    formData.append("file", file)
    
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
      
      if (res.ok) {
        const data = await res.json()
        setImage(data.url)
      } else {
        setMessage("Upload failed")
      }
    } catch (error) {
      console.error("Upload failed", error)
      setMessage("An error occurred during upload")
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage("")

    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, image })
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
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-2xl mx-auto px-4 py-10 w-full">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Account Settings</h1>

        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <form onSubmit={handleSave} className="p-8 space-y-6">
            {message && (
              <div className={`p-4 rounded-md text-sm font-medium ${message.includes('success') ? 'bg-green-500/10 text-green-600 border border-green-500/20' : 'bg-destructive/10 text-destructive border border-destructive/20'}`}>
                {message}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-3 text-foreground/80">Profile Picture</label>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full border border-border overflow-hidden bg-muted flex items-center justify-center shrink-0">
                  {image ? (
                    <img src={image} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors text-sm border border-border">
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                    {uploading ? 'Uploading...' : 'Upload Image'}
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                  </label>
                  <p className="text-xs text-muted-foreground mt-2">Recommended size: 256x256px. Max size: 5MB.</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground/80">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
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
    </div>
  )
}
