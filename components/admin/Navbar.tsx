'use client'

import { Menu, Moon, Sun, User, LogOut } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface NavbarProps {
  user: SupabaseUser
  onMenuClick: () => void
}

export default function Navbar({ user, onMenuClick }: NavbarProps) {
  const router = useRouter()
  const supabase = createClient()
  const [darkMode, setDarkMode] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark')
    setDarkMode(isDark)
  }, [])

  const toggleDarkMode = () => {
    const html = document.documentElement
    html.classList.toggle('dark')
    setDarkMode(!darkMode)
    localStorage.setItem('theme', !darkMode ? 'dark' : 'light')
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    setShowDropdown(false)
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

  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin'

  return (
    <nav className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden text-muted-foreground hover:text-foreground transition"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <div className="flex items-center gap-6">
        {/* Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 pl-6 border-l border-border hover:opacity-80 transition"
          >
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-foreground">{userName}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-20">
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-destructive hover:bg-destructive/10 rounded-lg transition disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {loggingOut ? 'Logging out...' : 'Logout'}
                  </span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}