'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/admin/Sidebar'
import Navbar from '@/components/admin/Navbar'
import { User, Mail, Shield } from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [fullName, setFullName] = useState('')

  useEffect(() => {
    const userData = localStorage.getItem('admin_user')
    if (!userData) {
      router.push('/admin/login')
      return
    }
    const parsedUser = JSON.parse(userData)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(parsedUser)
    setFullName(parsedUser.name)
    setLoading(false)
  }, [router])

  const handleSaveProfile = () => {
    const updatedUser = { ...user, name: fullName }
    localStorage.setItem('admin_user', JSON.stringify(updatedUser))
    setUser(updatedUser)
    setIsEditing(false)
  }

  if (loading) return null

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} user={user} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar user={user} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-auto">
          <div className="p-6 lg:p-8 max-w-2xl">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
              <p className="text-muted-foreground mt-2">Manage your account information</p>
            </div>

            {/* Profile Card */}
            <div className="bg-card border border-border rounded-lg p-8 space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-6 pb-6 border-b border-border">
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">{user?.name || 'Admin'}</h2>
                  <p className="text-sm text-muted-foreground">Admin Account</p>
                </div>
              </div>

              {/* Info Fields */}
              <div className="space-y-6">
                {/* Full Name */}
                <div>
                  <label htmlFor="name" className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                    <User className="w-4 h-4" />
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      id="name"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  ) : (
                    <p className="px-4 py-2 rounded-lg bg-muted text-foreground">{fullName}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </label>
                  <p className="px-4 py-2 rounded-lg bg-muted text-foreground">{user?.email}</p>
                  <p className="text-xs text-muted-foreground mt-2">Email cannot be changed</p>
                </div>

                {/* Role */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                    <Shield className="w-4 h-4" />
                    Role
                  </label>
                  <p className="px-4 py-2 rounded-lg bg-muted text-foreground">Administrator</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-border flex gap-4">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSaveProfile}
                      className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition font-medium"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => {
                        setFullName(user?.name || '')
                        setIsEditing(false)
                      }}
                      className="px-6 py-2 border border-input text-foreground rounded-lg hover:bg-muted transition font-medium"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition font-medium"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            {/* Account Info */}
            <div className="mt-8 bg-muted/50 border border-border rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-3">Account Information</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Account Type: Administrator</li>
                <li>• Access Level: Full</li>
                <li>• Created: {new Date().toLocaleDateString()}</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
