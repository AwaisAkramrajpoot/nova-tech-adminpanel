'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, Plus, FolderOpen, User, LogOut, X } from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { useState } from 'react'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  user: SupabaseUser
}

export default function Sidebar({ isOpen, onToggle, user }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [loggingOut, setLoggingOut] = useState(false)

  const menuItems = [
    { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/projects/add', icon: Plus, label: 'Add Project' },
    { href: '/admin/projects', icon: FolderOpen, label: 'Manage Projects' },
    { href: '/admin/profile', icon: User, label: 'Profile' },
  ]

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await supabase.auth.signOut()
      router.push('/admin/login')
      router.refresh()
    } catch (error) {
      console.error('Error logging out:', error)
    } finally {
      setLoggingOut(false)
    }
  }

  const isActive = (href: string) => pathname === href

  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin'

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed md:static w-64 h-screen bg-card border-r border-border transition-transform duration-300 ease-in-out z-40 flex flex-col`}
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">N</span>
            </div>
            <div>
              <h2 className="font-bold text-foreground">Novaa Tech</h2>
              <p className="text-xs text-muted-foreground">Admin</p>
            </div>
          </div>
          <button onClick={onToggle} className="md:hidden text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => window.innerWidth < 768 && onToggle()}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">{loggingOut ? 'Logging out...' : 'Logout'}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 bg-black/50 md:hidden z-30"
        />
      )}
    </>
  )
}