"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Search, LifeBuoy, Book, LogIn, LogOut, LayoutDashboard } from "lucide-react"
import { useTheme } from "next-themes"

export default function Home() {
  const { data: session, status } = useSession()
  const { theme, setTheme } = useTheme()

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      {/* Premium Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />

      {/* Navbar */}
      <nav className="border-b border-border/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LifeBuoy className="w-6 h-6 text-primary" />
            <span className="font-bold text-xl tracking-tight">Xentro Support</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full hover:bg-secondary transition-colors"
            >
              {theme === 'dark' ? '🌞' : '🌙'}
            </button>
            {status === "loading" ? (
              <div className="w-20 h-8 bg-secondary animate-pulse rounded-md" />
            ) : session ? (
              <div className="flex items-center gap-3">
                <Link
                  href={session.user.role === 'ADMIN' ? "/admin" : "/dashboard"}
                  className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut()}
                  className="text-sm font-medium text-destructive hover:text-destructive/80 transition-colors flex items-center gap-1"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn("google")}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-all shadow-sm flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
            How can we help <span className="text-blue-500">you?</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Search our knowledge base or create a ticket to get personalized assistance from our support team.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-2xl relative mb-16"
        >
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-4 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm transition-all text-lg"
              placeholder="Search for articles, guides, and FAQs..."
            />
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl"
        >
          <Link href="/faqs" className="group p-8 rounded-2xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all text-left flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />
            <Book className="w-8 h-8 text-blue-500 mb-4" />
            <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">Knowledge Base</h3>
            <p className="text-muted-foreground">Browse through our comprehensive guides and frequently asked questions.</p>
          </Link>

          <Link href="/tickets/new" className="group p-8 rounded-2xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all text-left flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-2xl group-hover:bg-green-500/10 transition-colors" />
            <LifeBuoy className="w-8 h-8 text-green-500 mb-4" />
            <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">Submit a Ticket</h3>
            <p className="text-muted-foreground">Can't find what you're looking for? Our support team is here to help.</p>
          </Link>
        </motion.div>
      </main>
    </div>
  )
}
