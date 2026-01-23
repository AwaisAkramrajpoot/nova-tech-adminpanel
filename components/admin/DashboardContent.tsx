'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { BarChart3, FolderOpen, Eye, ArrowRight } from 'lucide-react'

interface Project {
  id: string
  title: string
  category: string
  status: string
  created_at: string
}

interface DashboardContentProps {
  userId: string
}

export default function DashboardContent({ userId }: DashboardContentProps) {
  const supabase = createClient()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProjects()
  }, [userId])

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const stats = [
    { label: 'Total Projects', value: projects.length, icon: FolderOpen, color: 'bg-blue-500/10' },
    { label: 'Published', value: projects.filter(p => p.status === 'published').length, icon: Eye, color: 'bg-green-500/10' },
    { label: 'Drafts', value: projects.filter(p => p.status === 'draft').length, icon: BarChart3, color: 'bg-yellow-500/10' },
  ]

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
        <p className="text-muted-foreground">Manage your projects and content from here</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className={`${stat.color} rounded-lg p-3`}>
                  <Icon className="w-6 h-6 text-primary" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/admin/projects/add"
          className="bg-primary hover:opacity-90 text-primary-foreground rounded-lg p-6 transition-all group"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-lg mb-2">Add New Project</h3>
              <p className="text-sm opacity-90">Create and publish new project</p>
            </div>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/admin/projects"
          className="bg-card border border-border hover:border-primary rounded-lg p-6 transition-all group"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-lg mb-2 text-foreground">Manage Projects</h3>
              <p className="text-sm text-muted-foreground">Edit, delete, or update projects</p>
            </div>
            <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Recent Projects */}
      {projects.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4">Recent Projects</h2>
          <div className="space-y-3">
            {projects.slice(0, 5).map((project) => (
              <div key={project.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between hover:border-primary transition">
                <div>
                  <h3 className="font-medium text-foreground">{project.title}</h3>
                  <p className="text-sm text-muted-foreground">{project.category}</p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                  project.status === 'published'
                    ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                    : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                }`}>
                  {project.status === 'published' ? 'Published' : 'Draft'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {projects.length === 0 && (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Projects Yet</h3>
          <p className="text-muted-foreground mb-6">Get started by creating your first project</p>
          <Link
            href="/admin/projects/add"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
          >
            Create Project
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  )
}