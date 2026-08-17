"use client"

import { SessionProvider, useSession } from "next-auth/react"
import { ReactNode } from "react"

export interface SessionUser {
  id?: string
  email?: string
  name?: string
  role?: string
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
