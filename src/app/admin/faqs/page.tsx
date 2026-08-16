import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { PlusCircle } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AdminFAQs() {
  const faqs = await prisma.fAQ.findMany({
    orderBy: { updatedAt: 'desc' },
    include: { author: { select: { name: true } } }
  })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Manage FAQs</h1>
        <Link
          href="/admin/faqs/new"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          New FAQ
        </Link>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-muted/50 uppercase text-muted-foreground text-xs">
            <tr>
              <th className="px-6 py-4 font-medium">Title</th>
              <th className="px-6 py-4 font-medium">Slug</th>
              <th className="px-6 py-4 font-medium">Author</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {faqs.map(faq => (
              <tr key={faq.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 font-medium text-foreground">{faq.title}</td>
                <td className="px-6 py-4 text-muted-foreground">{faq.slug}</td>
                <td className="px-6 py-4 text-foreground">{faq.author.name}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    faq.published ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                    {faq.published ? 'PUBLISHED' : 'DRAFT'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link href={`/faqs/${faq.slug}`} className="text-primary font-medium hover:underline text-sm mr-4">
                    View
                  </Link>
                  <Link href={`/admin/faqs/${faq.id}/edit`} className="text-blue-500 font-medium hover:underline text-sm">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {faqs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                  No FAQs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
