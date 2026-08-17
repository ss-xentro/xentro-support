"use client"

import { SessionProvider, useSession } from "next-auth/react"
import { ReactNode } from "react"

export interface SessionUser {
  id: string
  email: string
  name?: string | null
  image?: string | null
  profileUrl?: string | null
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  )
}

export function useAuth() {
  const { data: session, status } = useSession()
  
  return {
    user: session?.user as SessionUser | null,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
  }
}
