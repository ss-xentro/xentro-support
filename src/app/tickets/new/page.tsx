"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2, UploadCloud, X } from "lucide-react"

import { Navbar } from "@/components/navbar"

export default function NewTicket() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [profileUrl, setProfileUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [attachments, setAttachments] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  
  // Wait for loading to finish
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>
  }
  
  if (!isAuthenticated) return null;

  if (isAuthenticated && user && !user.name) {
    router.push("/settings")
    return null
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    setUploading(true)
    const files = Array.from(e.target.files)
    const newAttachments: string[] = []

    for (const file of files) {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", "tickets")

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })
        
        if (res.ok) {
          const data = await res.json()
          if (data.url) {
            newAttachments.push(data.url)
          }
        } else {
          alert(`Failed to upload ${file.name}`)
        }
      } catch (error) {
        console.error("Upload error:", error)
        alert(`Error uploading ${file.name}`)
      }
    }

    setAttachments(prev => [...prev, ...newAttachments])
    setUploading(false)
    // Clear input
    e.target.value = ""
  }

  const removeAttachment = (urlToRemove: string) => {
    setAttachments(prev => prev.filter(url => url !== urlToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, profileUrl, attachments }),
      })

      if (res.ok) {
        const ticket = await res.json()
        router.push(`/tickets/${ticket.id}`)
      } else {
        alert("Failed to create ticket")
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-2xl mx-auto px-4 py-10 w-full">
        <Link href="/dashboard" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="bg-card border border-border rounded-xl shadow-sm p-6 md:p-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Create a New Ticket</h1>
          <p className="text-muted-foreground mb-8">Please describe your issue in detail so we can help you better.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-2">Title</label>
              <input
                id="title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief summary of the issue"
                className="w-full bg-background border border-border rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
            
            <div>
              <label htmlFor="profileUrl" className="block text-sm font-medium mb-2">Xentro Profile URL</label>
              <input
                id="profileUrl"
                type="url"
                required
                value={profileUrl}
                onChange={(e) => setProfileUrl(e.target.value)}
                placeholder="https://xentro.in/profile/..."
                className="w-full bg-background border border-border rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-2">Description</label>
              <textarea
                id="description"
                required
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide as much detail as possible..."
                className="w-full bg-background border border-border rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-y"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Attachments (Optional)</label>
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors bg-muted/20 relative">
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploading}
                />
                <div className="flex flex-col items-center justify-center gap-2">
                  {uploading ? (
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  ) : (
                    <UploadCloud className="w-8 h-8 text-muted-foreground" />
                  )}
                  <p className="text-sm text-muted-foreground font-medium">
                    {uploading ? "Uploading..." : "Click or drag files to upload"}
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    Max size: 10MB per file
                  </p>
                </div>
              </div>

              {attachments.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {attachments.map((url, i) => (
                    <div key={i} className="relative group rounded-md border border-border overflow-hidden aspect-video bg-muted flex items-center justify-center">
                      {url.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                        <img src={url} alt="Attachment" className="object-cover w-full h-full" />
                      ) : (
                        <span className="text-xs font-medium truncate px-2">{url.split('/').pop()}</span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeAttachment(url)}
                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading || uploading}
                className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Submit Ticket
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
