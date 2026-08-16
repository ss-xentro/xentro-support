import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { MarkdownViewer } from "@/components/md-viewer"
import { Metadata } from "next"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = await params
  const faq = await prisma.fAQ.findUnique({ where: { slug } })
  if (!faq) return { title: "FAQ Not Found" }
  return { title: `${faq.title} | Xentro Support` }
}

export default async function FAQDetail({ params }: { params: { slug: string } }) {
  const { slug } = await params
  const faq = await prisma.fAQ.findUnique({
    where: { slug },
    include: { author: { select: { name: true } } }
  })

  if (!faq || !faq.published) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/faqs" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to FAQs
        </Link>
        
        <article className="bg-card border border-border rounded-2xl shadow-sm p-8 md:p-12">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">{faq.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-10 pb-10 border-b border-border">
            <span>By {faq.author.name}</span>
            <span>•</span>
            <span>Last updated on {new Date(faq.updatedAt).toLocaleDateString()}</span>
          </div>
          
          <div className="prose dark:prose-invert max-w-none">
            <MarkdownViewer source={faq.content} />
          </div>
        </article>
      </div>
    </div>
  )
}
