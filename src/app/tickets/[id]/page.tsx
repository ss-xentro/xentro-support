import { getAuthCookieServer } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Send } from "lucide-react"
import { revalidatePath } from "next/cache"

export default async function TicketDetail({ params }: { params: { id: string } }) {
  const sessionUser = await getAuthCookieServer()

  if (!sessionUser || !sessionUser.id) {
    redirect("/")
  }

  const { id } = await params;

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      messages: {
        include: { user: { select: { name: true, role: true, image: true } } },
        orderBy: { createdAt: 'asc' }
      },
      user: { select: { name: true } }
    }
  })

  if (!ticket) {
    notFound()
  }

  // Ensure user owns ticket or is admin
  if (ticket.userId !== sessionUser.id && sessionUser.role !== 'admin' && sessionUser.role !== 'ADMIN') {
    redirect("/dashboard")
  }

  async function addMessage(formData: FormData) {
    "use server"
    const message = formData.get("message") as string
    if (!message || !message.trim()) return

    const userSession = await getAuthCookieServer()
    if (!userSession || !userSession.id) return

    await prisma.ticketMessage.create({
      data: {
        message: message.trim(),
        ticketId: id,
        userId: userSession.id,
      }
    })

    revalidatePath(`/tickets/${id}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <Link href={sessionUser.role === 'admin' || sessionUser.role === 'ADMIN' ? "/admin/tickets" : "/dashboard"} className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to {sessionUser.role === 'admin' || sessionUser.role === 'ADMIN' ? 'Admin Tickets' : 'Dashboard'}
        </Link>

        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="p-6 border-b border-border bg-muted/30">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-2xl font-bold">{ticket.title}</h1>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                ticket.status === 'OPEN' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                ticket.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
              }`}>
                {ticket.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-muted-foreground whitespace-pre-wrap">{ticket.description}</p>
            {ticket.attachments && ticket.attachments.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold mb-3 text-foreground">Attachments</h3>
                <div className="flex flex-wrap gap-3">
                  {ticket.attachments.map((url, i) => (
                    <a 
                      key={i} 
                      href={url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="group relative block w-32 h-32 rounded-lg border border-border overflow-hidden bg-muted"
                    >
                      {url.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                        <img src={url} alt="Attachment" className="object-cover w-full h-full group-hover:opacity-90 transition-opacity" />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full text-xs font-medium px-2 break-all text-center">
                          {url.split('/').pop()}
                        </div>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-6 flex flex-wrap gap-4 text-xs text-muted-foreground bg-background rounded-lg border border-border p-3">
              <div><strong className="text-foreground">Opened by:</strong> {ticket.user.name || 'User'}</div>
              <div><strong className="text-foreground">Created:</strong> {new Date(ticket.createdAt).toLocaleString()}</div>
              <div><strong className="text-foreground">Profile URL:</strong> <a href={ticket.profileUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">{ticket.profileUrl}</a></div>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {ticket.messages.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground italic">
                No replies yet.
              </div>
            ) : (
              ticket.messages.map((msg) => {
                const isAdmin = msg.user.role === 'ADMIN'
                const isMe = msg.userId === sessionUser.id

                return (
                  <div key={msg.id} className={`flex gap-4 ${isMe ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isAdmin ? 'bg-blue-500 text-white' : 'bg-primary text-primary-foreground'}`}>
                      {msg.user.image ? (
                        <img src={msg.user.image} alt="" className="w-full h-full rounded-full" />
                      ) : (
                        (msg.user.name || 'U').charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${isMe ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted rounded-tl-sm'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold ${isMe ? 'text-primary-foreground/80' : 'text-foreground'}`}>
                          {msg.user.name || 'Unknown'} {isAdmin && <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-500 rounded text-[10px] ml-1">ADMIN</span>}
                        </span>
                        <span className={`text-[10px] ${isMe ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap text-sm">{msg.message}</p>
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {msg.attachments.map((url, i) => (
                            <a key={i} href={url} target="_blank" rel="noreferrer" className="block w-24 h-24 rounded border border-border overflow-hidden bg-background">
                              {url.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                                <img src={url} alt="Attachment" className="object-cover w-full h-full" />
                              ) : (
                                <div className="flex items-center justify-center w-full h-full text-[10px] p-1 text-center break-all">{url.split('/').pop()}</div>
                              )}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {ticket.status !== 'CLOSED' && (
            <div className="p-4 bg-muted/30 border-t border-border">
              <form action={addMessage} className="flex gap-2">
                <input
                  type="text"
                  name="message"
                  required
                  placeholder="Type your reply here..."
                  className="flex-1 bg-background border border-border rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary transition-all text-sm"
                />
                <button
                  type="submit"
                  className="bg-primary text-primary-foreground p-3 rounded-full hover:bg-primary/90 transition-colors shadow-sm"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
