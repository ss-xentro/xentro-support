import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Search, ArrowLeft } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function FAQsList() {
  const faqs = await prisma.fAQ.findMany({
    where: { published: true },
    orderBy: { updatedAt: 'desc' },
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary text-primary-foreground py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Knowledge Base</h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-10">
            Find answers to common questions and guides on how to use Xentro.
          </p>
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-4 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-xl transition-all text-lg"
              placeholder="Search FAQs..."
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="grid gap-4">
          {faqs.map(faq => (
            <Link
              key={faq.id}
              href={`/faqs/${faq.slug}`}
              className="block bg-card border border-border rounded-xl p-6 hover:border-primary/50 hover:shadow-md transition-all group"
            >
              <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{faq.title}</h2>
              <p className="text-muted-foreground line-clamp-2">
                {faq.content.replace(/[#*`_]/g, '')}
              </p>
            </Link>
          ))}
          {faqs.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              No FAQs available yet.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
