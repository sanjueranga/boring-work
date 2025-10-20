"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, LogOut, Settings, BarChart3, CheckSquare, FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Project {
  id: string
  title: string
}

interface SidebarProps {
  projects: Project[]
  isMounted: boolean
}

export function Sidebar({ projects, isMounted }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true)
  const pathname = usePathname()
  const router = useRouter()

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/tasks", label: "All Tasks", icon: CheckSquare },
    { href: "/projects", label: "Projects", icon: FolderOpen },
    { href: "/settings", label: "Settings", icon: Settings },
  ]

  const handleSignOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    localStorage.removeItem("session")
    router.push("/login")
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 hover:bg-muted rounded-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="p-6 space-y-8">
          <div className="pt-2">
            <h1 className="text-2xl font-bold text-sidebar-foreground">Progress</h1>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className="w-full justify-start gap-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon size={20} />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </nav>

          <div className="border-t border-sidebar-border pt-4">
            <p className="text-xs font-semibold text-sidebar-foreground mb-3 px-2">YOUR PROJECTS</p>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {!isMounted ? (
                <p className="text-xs text-sidebar-foreground/60 px-2">Loading projects...</p>
              ) : projects.length === 0 ? (
                <p className="text-xs text-sidebar-foreground/60 px-2">No projects yet</p>
              ) : (
                projects.map((project) => (
                  <Link key={project.id} href={`/projects/${project.id}`}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-sm truncate"
                      onClick={() => setIsOpen(false)}
                    >
                      {project.title}
                    </Button>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="absolute bottom-6 left-6 right-6">
            <Button onClick={handleSignOut} variant="outline" className="w-full justify-start gap-2 bg-transparent">
              <LogOut size={20} />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
