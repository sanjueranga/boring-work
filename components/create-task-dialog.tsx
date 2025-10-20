"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"

interface Tag {
  id: string
  name: string
  color: string
}

interface Project {
  id: string
  title: string
}

interface CreateTaskDialogProps {
  projectId?: string
  onTaskCreated: () => void
}

export function CreateTaskDialog({ projectId, onTaskCreated }: CreateTaskDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [tags, setTags] = useState<Tag[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedProject, setSelectedProject] = useState<string | undefined>(projectId)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: 60,
  })

  useEffect(() => {
    if (isOpen) {
      loadTags()
      loadProjects()
    }
  }, [isOpen])

  const loadTags = async () => {
    try {
      const response = await fetch("/api/tags")
      if (response.ok) {
        const data = await response.json()
        setTags(data)
      }
    } catch (error) {
      console.error("Failed to load tags:", error)
    }
  }

  const loadProjects = async () => {
    try {
      const response = await fetch("/api/projects")
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      }
    } catch (error) {
      console.error("Failed to load projects:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          projectId: selectedProject === 'no-project' ? null : selectedProject,
          tagIds: selectedTags,
        }),
      })

      if (response.ok) {
        setFormData({ title: "", description: "", duration: 60 })
        setSelectedTags([])
        setSelectedProject(undefined)
        setIsOpen(false)
        onTaskCreated()
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} className="gap-2">
        <Plus size={20} />
        New Task
      </Button>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create New Task</CardTitle>
        <CardDescription>Add a new task to track your progress</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <Input
              placeholder="Task title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="Task description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Project</label>
            <Select onValueChange={setSelectedProject} defaultValue={selectedProject}>
              <SelectTrigger>
                <SelectValue placeholder="Select a project (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-project">No project</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Duration (minutes)</label>
            <Input
              type="number"
              min="1"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: Number.parseInt(e.target.value) })}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() =>
                    setSelectedTags((prev) =>
                      prev.includes(tag.id) ? prev.filter((id) => id !== tag.id) : [...prev, tag.id],
                    )
                  }
                  style={selectedTags.includes(tag.id) ? { backgroundColor: tag.color } : {}}
                  className={`text-xs px-2 py-1 rounded transition-colors ${
                    selectedTags.includes(tag.id)
                      ? `text-white`
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
