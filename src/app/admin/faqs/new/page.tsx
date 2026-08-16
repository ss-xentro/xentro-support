"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2 } from "lucide-react"
import { MarkdownEditor } from "@/components/md-editor"

export default function NewFAQ() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [content, setContent] = useState("")
  const [published, setPublished] = useState(true)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, slug, content, published }),
      })

      if (res.ok) {
        router.push("/admin/faqs")
        router.refresh()
      } else {
        alert("Failed to create FAQ")
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <Link href="/admin/faqs" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to FAQs
      </Link>

      <div className="bg-card border border-border rounded-xl shadow-sm p-8">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Create New FAQ</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="FAQ Title"
                className="w-full bg-background border border-border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Slug</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. how-to-reset-password"
                className="w-full bg-background border border-border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Content (Markdown)</label>
            <div className="border border-border rounded-md overflow-hidden">
              <MarkdownEditor value={content} onChange={setContent} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="published"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="w-4 h-4 text-primary focus:ring-primary border-border rounded"
            />
            <label htmlFor="published" className="text-sm font-medium">Publish immediately</label>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Save FAQ
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
