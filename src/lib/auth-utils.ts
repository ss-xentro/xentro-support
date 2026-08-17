import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export interface SessionUser {
  id: string
  email: string
  name?: string | null
  image?: string | null
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN'
}

export async function getAuthCookieServer(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions)
  return session?.user as SessionUser | null
}

export async function getSupportUser() {
  const sessionUser = await getAuthCookieServer()
  if (!sessionUser || !sessionUser.id) return null

  // Refetch to ensure we have the latest data
  return await prisma.user.findUnique({
    where: { id: sessionUser.id }
  })
}
