import { getAuthCookieServer } from "@/lib/auth-utils"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { PlusCircle, MessageSquare } from "lucide-react"

export default async function Dashboard() {
  const sessionUser = await getAuthCookieServer()

  if (!sessionUser || !sessionUser.id) {
    redirect("/")
  }

  const tickets = await prisma.ticket.findMany({
    where: { userId: sessionUser.id },
    orderBy: { updatedAt: 'desc' },
    include: { _count: { select: { messages: true } } }
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Your Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage your support tickets and requests.</p>
          </div>
          <Link
            href="/tickets/new"
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            New Ticket
          </Link>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          {tickets.length === 0 ? (
            <div className="text-center py-20 px-4">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium">No tickets yet</h3>
              <p className="text-muted-foreground mb-4">You haven't created any support tickets.</p>
              <Link
                href="/tickets/new"
                className="text-blue-500 hover:underline"
              >
                Create your first ticket
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {tickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/tickets/${ticket.id}`}
                  className="block hover:bg-muted/50 p-6 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">{ticket.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        {ticket.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        ticket.status === 'OPEN' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        ticket.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                      }`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
