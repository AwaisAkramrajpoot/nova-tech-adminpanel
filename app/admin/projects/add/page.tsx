'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Sidebar from '@/components/admin/Sidebar'
import Navbar from '@/components/admin/Navbar'
import { ArrowLeft, Plus, X } from 'lucide-react'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'

export default function AddProjectPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'web-development',
    technologies: [] as string[],
    project_url: '',
    status: 'draft',
    gradient: 'from-blue-500 to-cyan-500',
    pattern: 'dots'
  })
  const [techInput, setTechInput] = useState('')

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        router.push('/admin/login')
        return
      }
      setUser(user)
    } catch (error) {
      console.error('Error fetching user:', error)
      router.push('/admin/login')
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { value: 'web-development', label: 'Web Development' },
    { value: 'mobile-development', label: 'Mobile Development' },
    { value: 'custom-software', label: 'Custom Software' }
  ]

  const gradients = [
    { value: 'from-blue-500 to-cyan-500', label: 'Blue Cyan' },
    { value: 'from-purple-500 to-pink-500', label: 'Purple Pink' },
    { value: 'from-green-500 to-emerald-500', label: 'Green Emerald' },
    { value: 'from-orange-500 to-red-500', label: 'Orange Red' },
  ]

  const patterns = [
    { value: 'dots', label: 'Dots' },
    { value: 'grid', label: 'Grid' }
  ]

  const addTechnology = () => {
    if (techInput.trim() && !formData.technologies.includes(techInput.trim())) {
      setFormData({
        ...formData,
        technologies: [...formData.technologies, techInput.trim()]
      })
      setTechInput('')
    }
  }

  const removeTechnology = (tech: string) => {
    setFormData({
      ...formData,
      technologies: formData.technologies.filter(t => t !== tech)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([
          {
            user_id: user.id,
            title: formData.title,
            description: formData.description,
            category: formData.category,
            technologies: formData.technologies,
            project_url: formData.project_url,
            status: formData.status,
            gradient: formData.gradient,
            pattern: formData.pattern,
          }
        ])
        .select()

      if (error) throw error

      router.push('/admin/projects')
      router.refresh()
    } catch (error) {
      console.error('Error saving project:', error)
      alert('Failed to save project. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary mb-4 animate-pulse">
            <span className="text-primary-foreground font-bold text-lg">N</span>
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} user={user} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar user={user} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-auto">
          <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8">
              <Link
                href="/admin/projects"
                className="flex items-center gap-2 text-primary hover:underline mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Projects
              </Link>
              <h1 className="text-3xl font-bold text-foreground">Add New Project</h1>
              <p className="text-muted-foreground mt-2">Create and configure a new project</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-8 max-w-2xl">
              <div className="space-y-6">
                {/* Project Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
                    Project Title *
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., E-commerce Platform"
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your project..."
                    rows={4}
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-foreground mb-2">
                    Category *
                  </label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Technologies */}
                <div>
                  <label htmlFor="tech" className="block text-sm font-medium text-foreground mb-2">
                    Technologies
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      id="tech"
                      type="text"
                      value={techInput}
                      onChange={(e) => setTechInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
                      placeholder="Add technology (e.g., React, Node.js)"
                      className="flex-1 px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <button
                      type="button"
                      onClick={addTechnology}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.technologies.map((tech) => (
                      <div
                        key={tech}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                      >
                        {tech}
                        <button
                          type="button"
                          onClick={() => removeTechnology(tech)}
                          className="hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Project URL */}
                <div>
                  <label htmlFor="url" className="block text-sm font-medium text-foreground mb-2">
                    Project URL
                  </label>
                  <input
                    id="url"
                    type="url"
                    value={formData.project_url}
                    onChange={(e) => setFormData({ ...formData, project_url: e.target.value })}
                    placeholder="https://example.com"
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                {/* Gradient Style */}
                <div>
                  <label htmlFor="gradient" className="block text-sm font-medium text-foreground mb-2">
                    Gradient Style
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {gradients.map((grad) => (
                      <button
                        key={grad.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, gradient: grad.value })}
                        className={`p-3 rounded-lg border-2 transition ${
                          formData.gradient === grad.value
                            ? 'border-primary'
                            : 'border-input'
                        }`}
                      >
                        <div className={`h-6 rounded bg-gradient-to-r ${grad.value} mb-2`} />
                        <p className="text-xs font-medium text-foreground">{grad.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pattern Selector */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Pattern Style
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {patterns.map((pat) => (
                      <button
                        key={pat.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, pattern: pat.value })}
                        className={`p-3 rounded-lg border-2 transition ${
                          formData.pattern === pat.value
                            ? 'border-primary'
                            : 'border-input'
                        }`}
                      >
                        <p className="text-xs font-medium text-foreground">{pat.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Status
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="draft"
                        checked={formData.status === 'draft'}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      />
                      <span className="text-sm text-foreground">Draft</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="published"
                        checked={formData.status === 'published'}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      />
                      <span className="text-sm text-foreground">Published</span>
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-2 px-4 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Create Project'}
                  </button>
                  <Link
                    href="/admin/projects"
                    className="py-2 px-4 border border-input text-foreground rounded-lg hover:bg-muted transition text-center"
                  >
                    Cancel
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}