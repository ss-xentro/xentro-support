"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Loader2, Shield, User, ShieldAlert } from "lucide-react"

type UserType = {
  id: string
  name: string | null
  email: string | null
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN'
  image: string | null
}

export default function AdminUsersPage() {
  const { user: authUser, isAuthenticated, isLoading } = useAuth()
  const [users, setUsers] = useState<UserType[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated && authUser?.role === 'SUPER_ADMIN') {
      fetchUsers()
    } else if (!isLoading && (!isAuthenticated || authUser?.role !== 'SUPER_ADMIN')) {
      setLoading(false)
    }
  }, [isAuthenticated, authUser, isLoading])

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users")
      if (res.ok) {
        setUsers(await res.json())
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return
    
    setUpdating(userId)
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole })
      })

      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as any } : u))
      } else {
        const text = await res.text()
        alert(text || "Failed to update role")
      }
    } catch (error) {
      console.error(error)
      alert("An error occurred while updating the role.")
    } finally {
      setUpdating(null)
    }
  }

  if (isLoading || loading) {
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

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground mt-1">Promote or demote users in the Support System.</p>
      </div>

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
                        {u.image ? (
                          <img src={u.image} alt="" className="w-full h-full rounded-full" />
                        ) : (
                          (u.name || 'U').charAt(0).toUpperCase()
                        )}
                      </div>
                      <span className="font-medium">{u.name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      u.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
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
                      <select
                        disabled={updating === u.id}
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="bg-background border border-border rounded-md text-xs px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer disabled:opacity-50"
                      >
                        <option value="USER">User</option>
                        <option value="ADMIN">Admin</option>
                        <option value="SUPER_ADMIN">Super Admin</option>
                      </select>
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
