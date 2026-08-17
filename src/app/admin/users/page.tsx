"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Loader2, Shield, User, ShieldAlert, Plus, X } from "lucide-react"

type UserType = {
  id: string
  name: string | null
  email: string | null
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN'
}

export default function AdminUsersPage() {
  const { user: authUser, isAuthenticated, isLoading } = useAuth()
  const [users, setUsers] = useState<UserType[] | null>(null)
  const [addingAdmin, setAddingAdmin] = useState(false)
  const [newAdminEmail, setNewAdminEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users")
      if (res.ok) {
        setUsers(await res.json())
      } else {
        setUsers([])
      }
    } catch (error) {
      console.error(error)
      setUsers([])
    }
  }

  useEffect(() => {
    if (isAuthenticated && authUser?.role === 'SUPER_ADMIN') {
      fetchUsers()
    }
  }, [isAuthenticated, authUser?.role])

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAdminEmail) return

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newAdminEmail })
      })

      if (res.ok) {
        setNewAdminEmail("")
        setAddingAdmin(false)
        fetchUsers() // Refresh list
      } else {
        const text = await res.text()
        alert(text || "Failed to add admin")
      }
    } catch (error) {
      console.error(error)
      alert("An error occurred while adding the admin.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-10 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isAuthenticated || authUser?.role !== 'SUPER_ADMIN') {
    return (
      <div className="p-10 text-center">
        <ShieldAlert className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground mt-2">Only Super Admins can access user management.</p>
      </div>
    )
  }

  if (users === null) {
    return (
      <div className="p-10 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1">View users and manage administrators in the Support System.</p>
        </div>
        <button
          onClick={() => setAddingAdmin(true)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Admin
        </button>
      </div>

      {addingAdmin && (
        <div className="bg-card border border-border rounded-xl shadow-sm p-6 mb-8 relative">
          <button
            onClick={() => setAddingAdmin(false)}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold mb-4">Add Administrator</h2>
          <form onSubmit={handleAddAdmin} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2 text-foreground/80">Admin Email Address</label>
              <input
                type="email"
                required
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="admin@xentro.com"
                className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !newAdminEmail}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50 h-[42px] flex items-center justify-center min-w-[120px]"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm"}
            </button>
          </form>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium text-muted-foreground">User</th>
                <th className="px-6 py-4 font-medium text-muted-foreground">Email</th>
                <th className="px-6 py-4 font-medium text-muted-foreground">Support Role</th>
                <th className="px-6 py-4 font-medium text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium shrink-0">
                        {(u.name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium">{u.name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${u.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                      u.role === 'ADMIN' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                      }`}>
                      {u.role === 'SUPER_ADMIN' && <ShieldAlert className="w-3.5 h-3.5" />}
                      {u.role === 'ADMIN' && <Shield className="w-3.5 h-3.5" />}
                      {u.role === 'USER' && <User className="w-3.5 h-3.5" />}
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {u.id === authUser?.id ? (
                      <span className="text-xs text-muted-foreground italic">You</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
