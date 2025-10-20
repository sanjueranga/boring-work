"use client"

import type { ReactNode } from "react"
import { Sidebar } from "./sidebar"
import { useEffect, useState } from "react"

interface Project {
  id: string
  title: string
}

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/projects")
        if (response.ok) {
          const data = await response.json()
          setProjects(data)
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error)
      } finally {
        setLoading(false)
      }
    }

    if (isMounted) {
      fetchProjects()
    }
  }, [isMounted])

  return (
    <div className="flex h-screen bg-background">
      <Sidebar projects={projects} isMounted={isMounted} />
      <main className="flex-1 md:ml-64 overflow-auto">{children}</main>
    </div>
  )
}