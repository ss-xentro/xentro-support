import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

export interface SessionUser {
  id?: string
  email?: string
  name?: string
  avatar?: string
  role: string
  contexts?: string[]
}

const AUTH_COOKIE = "xentro_auth"
const BOOTSTRAP_SUPER_ADMIN_EMAIL = "mstelidevara123@gmail.com"

/**
 * Parses the xentro_auth cookie to retrieve the user's session metadata.
 * This does not validate the HttpOnly JWT.
 */
export async function getAuthCookieServer(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const raw = cookieStore.get(AUTH_COOKIE)?.value
  if (!raw) return null
  
  try {
    const parsed = JSON.parse(decodeURIComponent(raw))
    return parsed as SessionUser
  } catch {
    return null
  }
}

/**
 * Gets the user from the auth cookie and ensures they exist in the Support DB.
 * Returns the Support DB User object, meaning it has the correct Support Role.
 */
export async function getSupportUser() {
  const sessionUser = await getAuthCookieServer()
  
  if (!sessionUser || !sessionUser.id) {
    return null
  }

  // Find or Create user in Support DB without updating their role if they already exist
  const existingUser = await prisma.user.findUnique({
    where: { id: sessionUser.id }
  })

  if (existingUser) {
    // Keep their name and email updated, but do NOT touch their role
    return await prisma.user.update({
      where: { id: sessionUser.id },
      data: {
        name: sessionUser.name,
        email: sessionUser.email,
        image: sessionUser.avatar
      }
    })
  }

  // Create new user
  const initialRole = sessionUser.email === BOOTSTRAP_SUPER_ADMIN_EMAIL ? 'SUPER_ADMIN' : 'USER'
  
  return await prisma.user.create({
    data: {
      id: sessionUser.id,
      name: sessionUser.name,
      email: sessionUser.email,
      image: sessionUser.avatar,
      role: initialRole
    }
  })
}
