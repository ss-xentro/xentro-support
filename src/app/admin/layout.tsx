import { getAuthCookieServer } from "@/lib/auth-utils"
import { redirect } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, FileText, Settings, Users } from "lucide-react"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const sessionUser = await getAuthCookieServer()

  if (!sessionUser) {
    redirect("/login")
  }

  if (sessionUser.role !== 'ADMIN' && sessionUser.role !== 'SUPER_ADMIN') {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-card border-r border-border flex-shrink-0 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold tracking-tight">Admin Portal</h2>
        </div>
        <nav className="p-4 space-y-2 flex-1">
          <Link href="/admin/tickets" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors text-sm font-medium">
            <LayoutDashboard className="w-4 h-4" />
            Tickets
          </Link>
          <Link href="/admin/faqs" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors text-sm font-medium">
            <FileText className="w-4 h-4" />
            FAQs
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors text-sm font-medium">
            <Users className="w-4 h-4" />
            Users
          </Link>
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto">
        {/* Mobile Navigation */}
        <div className="md:hidden border-b border-border bg-card p-4 flex gap-4 overflow-x-auto">
           <Link href="/admin/tickets" className="text-sm font-medium whitespace-nowrap">Tickets</Link>
           <Link href="/admin/faqs" className="text-sm font-medium whitespace-nowrap">FAQs</Link>
           <Link href="/admin/users" className="text-sm font-medium whitespace-nowrap">Users</Link>
        </div>
        {children}
      </main>
    </div>
  )
}
