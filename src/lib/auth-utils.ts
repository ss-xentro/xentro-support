import { cookies } from "next/headers"

export interface SessionUser {
  id?: string
  email?: string
  name?: string
  avatar?: string
  role: string
  contexts?: string[]
}

const AUTH_COOKIE = "xentro_auth"

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
