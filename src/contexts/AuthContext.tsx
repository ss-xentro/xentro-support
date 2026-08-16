"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useRouter } from "next/navigation"

export interface SessionUser {
  id?: string
  email?: string
  name?: string
  avatar?: string
  role: string
}

interface AuthContextType {
  user: SessionUser | null
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const AUTH_COOKIE = "xentro_auth"

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    
    async function fetchUser() {
      try {
        const raw = getCookie(AUTH_COOKIE)
        if (!raw) {
          setIsLoading(false)
          return
        }

        // Fetch user from /api/me to get the actual Support Role
        const res = await fetch("/api/me")
        if (res.ok) {
          const dbUser = await res.json()
          if (mounted) {
            setUser({
              id: dbUser.id,
              name: dbUser.name,
              email: dbUser.email,
              avatar: dbUser.image,
              role: dbUser.role
            })
          }
        }
      } catch (error) {
        console.error("Failed to fetch support user", error)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    fetchUser()

    return () => {
      mounted = false
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
