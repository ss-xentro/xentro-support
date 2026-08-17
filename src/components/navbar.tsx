"use client"

import { useAuth } from "@/contexts/AuthContext"
import { signOut } from "next-auth/react"
import Link from "next/link"
import { LifeBuoy, LogIn, LogOut, LayoutDashboard } from "lucide-react"

export function Navbar() {
  const { user, isAuthenticated, isLoading } = useAuth()

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <nav className="border-b border-border/40 backdrop-blur-md sticky top-0 z-50 bg-background/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <LifeBuoy className="w-6 h-6 text-primary" />
          <span className="font-bold text-xl tracking-tight">Xentro Support</span>
        </Link>
        <div className="flex items-center gap-4">
          {isLoading ? (
            <div className="w-20 h-8 bg-secondary animate-pulse rounded-md" />
          ) : isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <Link
                href={user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? "/admin" : "/dashboard"}
                className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="text-sm font-medium text-destructive hover:text-destructive/80 transition-colors flex items-center gap-1"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-all shadow-sm flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
