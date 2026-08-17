"use client"

import { useAuth } from "@/contexts/AuthContext"
import { signOut } from "next-auth/react"
import Link from "next/link"
import { LifeBuoy, LogIn, LogOut, LayoutDashboard, Settings, User as UserIcon, ChevronDown } from "lucide-react"
import { useState, useRef, useEffect } from "react"

export function Navbar() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <nav className="border-b border-border/40 backdrop-blur-md sticky top-0 z-50 bg-background/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <LifeBuoy className="w-6 h-6 text-primary" />
          <span className="font-bold text-xl tracking-tight">Xentro Support</span>
        </Link>
        <div className="flex items-center gap-4">
          {isLoading ? (
            <div className="w-10 h-10 bg-secondary animate-pulse rounded-full" />
          ) : isAuthenticated && user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-full hover:bg-secondary/80 transition-colors border border-transparent focus:border-border"
              >
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center overflow-hidden">
                  <span className="font-bold text-sm">{(user.name || "U").charAt(0).toUpperCase()}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-lg py-2 animate-fadeIn z-50">
                  <div className="px-4 py-2 border-b border-border/50 mb-2">
                    <p className="text-sm font-medium truncate">{user.name || "User"}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>

                  <Link
                    href={user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? "/admin/tickets" : "/dashboard"}
                    className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-secondary transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
                    Dashboard
                  </Link>

                  <Link
                    href="/settings"
                    className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-secondary transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <Settings className="w-4 h-4 text-muted-foreground" />
                    Settings
                  </Link>

                  <div className="h-px bg-border/50 my-2" />

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      handleSignOut();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
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
