'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Sidebar from '@/components/admin/Sidebar'
import Navbar from '@/components/admin/Navbar'
import { Edit2, Trash2, Plus, FolderOpen } from 'lucide-react'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'

interface Project {
  id: string
  title: string
  description: string
  category: string
  status: string
  technologies: string[]
  project_url: string
  created_at: string
}

export default function ProjectsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<Project[]>([])
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

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
      await loadProjects(user.id)
    } catch (error) {
      console.error('Error fetching user:', error)
      router.push('/admin/login')
    }
  }

  const loadProjects = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error('Error loading projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)

      if (error) throw error

      setProjects(projects.filter(p => p.id !== id))
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Error deleting project:', error)
      alert('Failed to delete project')
    }
  }

  const toggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'published' ? 'draft' : 'published'
      
      const { error } = await supabase
        .from('projects')
        .update({ status: newStatus })
        .eq('id', id)

      if (error) throw error

      setProjects(projects.map(p => 
        p.id === id ? { ...p, status: newStatus } : p
      ))
    } catch (error) {
      console.error('Error updating project status:', error)
      alert('Failed to update project status')
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
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Manage Projects</h1>
                <p className="text-muted-foreground mt-2">View and manage all your projects</p>
              </div>
              <Link
                href="/admin/projects/add"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
              >
                <Plus className="w-5 h-5" />
                Add Project
              </Link>
            </div>

            {/* Projects List */}
            {projects.length > 0 ? (
              <div className="space-y-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-card border border-border rounded-lg p-6 hover:border-primary transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-foreground mb-2">{project.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3 max-w-2xl">{project.description}</p>

                        <div className="flex flex-wrap gap-3 mb-4">
                          <span className="text-xs px-3 py-1 bg-muted rounded-full text-foreground font-medium">
                            {project.category}
                          </span>
                          <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                            project.status === 'published'
                              ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                              : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                          }`}>
                            {project.status === 'published' ? 'Published' : 'Draft'}
                          </span>
                        </div>

                        {project.technologies && project.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {project.technologies.map((tech: string) => (
                              <span key={tech} className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => toggleStatus(project.id, project.status)}
                          className="px-3 py-2 rounded-lg hover:bg-muted transition text-sm font-medium text-foreground"
                        >
                          {project.status === 'published' ? 'Unpublish' : 'Publish'}
                        </button>
                        <Link
                          href={`/admin/projects/edit/${project.id}`}
                          className="p-2 rounded-lg hover:bg-muted transition text-foreground"
                        >
                          <Edit2 className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => setDeleteConfirm(project.id)}
                          className="p-2 rounded-lg hover:bg-destructive/10 transition text-destructive"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Delete Confirmation */}
                    {deleteConfirm === project.id && (
                      <div className="mt-4 p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex items-center justify-between">
                        <p className="text-sm text-destructive font-medium">Are you sure you want to delete this project?</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => deleteProject(project.id)}
                            className="px-3 py-1 bg-destructive text-destructive-foreground rounded text-sm font-medium hover:opacity-90 transition"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-3 py-1 bg-muted text-foreground rounded text-sm font-medium hover:opacity-90 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-card border border-border rounded-lg p-12 text-center">
                <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Projects Yet</h3>
                <p className="text-muted-foreground mb-6">Start by creating your first project</p>
                <Link
                  href="/admin/projects/add"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
                >
                  <Plus className="w-4 h-4" />
                  Create Project
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}