import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { revalidatePath } from "next/cache"

export const dynamic = "force-dynamic"

export default async function AdminTickets() {
  const tickets = await prisma.ticket.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
      _count: { select: { messages: true } }
    }
  })

  async function updateStatus(formData: FormData) {
    "use server"
    const id = formData.get("id") as string
    const status = formData.get("status") as any
    if (!id || !status) return

    await prisma.ticket.update({
      where: { id },
      data: { status }
    })
    revalidatePath("/admin/tickets")
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">All Tickets</h1>
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-muted/50 uppercase text-muted-foreground text-xs">
            <tr>
              <th className="px-6 py-4 font-medium">Ticket</th>
              <th className="px-6 py-4 font-medium">User</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Messages</th>
              <th className="px-6 py-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {tickets.map(ticket => (
              <tr key={ticket.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-foreground">{ticket.title}</div>
                  <div className="text-muted-foreground text-xs">{new Date(ticket.createdAt).toLocaleDateString()}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-foreground">{ticket.user.name || 'Unknown'}</div>
                  <div className="text-muted-foreground text-xs">{ticket.user.email}</div>
                </td>
                <td className="px-6 py-4">
                  <form action={updateStatus}>
                    <input type="hidden" name="id" value={ticket.id} />
                    <select
                      name="status"
                      defaultValue={ticket.status}
                      onChange={(e) => e.target.form?.requestSubmit()}
                      className={`text-xs font-semibold rounded-md px-2 py-1 border border-border bg-background focus:ring-2 focus:ring-primary outline-none cursor-pointer ${
                        ticket.status === 'OPEN' ? 'text-green-600 dark:text-green-400' :
                        ticket.status === 'IN_PROGRESS' ? 'text-blue-600 dark:text-blue-400' :
                        'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      <option value="OPEN">OPEN</option>
                      <option value="IN_PROGRESS">IN PROGRESS</option>
                      <option value="RESOLVED">RESOLVED</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </form>
                </td>
                <td className="px-6 py-4 text-muted-foreground">
                  {ticket._count.messages} replies
                </td>
                <td className="px-6 py-4 text-right">
                  <Link href={`/tickets/${ticket.id}`} className="text-primary font-medium hover:underline text-sm">
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {tickets.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                  No tickets found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
