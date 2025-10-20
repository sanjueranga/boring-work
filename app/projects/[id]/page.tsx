"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  duration: number;
  tags: Tag[];
}

interface Project {
  id: string;
  title: string;
  description: string | null;
  expectedOutcomes: string | null;
  tasks: Task[];
}

export default function ProjectDetailPage() {
  const params = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProject = async () => {
      try {
        const response = await fetch(`/api/projects/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setProject(data);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadProject();
  }, [params.id]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 md:p-8 text-center text-muted-foreground">
          Loading project...
        </div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout>
        <div className="p-6 md:p-8">
          <Link href="/projects">
            <Button variant="outline" className="gap-2 bg-transparent">
              <ArrowLeft size={20} />
              Back to Projects
            </Button>
          </Link>
          <div className="mt-4 text-center text-muted-foreground">
            Project not found
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 space-y-8">
        <Link href="/projects">
          <Button variant="outline" className="gap-2 bg-transparent">
            <ArrowLeft size={20} />
            Back to Projects
          </Button>
        </Link>

        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {project.title}
          </h1>
          <p className="text-muted-foreground mt-2">{project.description}</p>
        </div>

        {project.expectedOutcomes && (
          <Card>
            <CardHeader>
              <CardTitle>Expected Outcomes</CardTitle>
            </CardHeader>
            <CardContent>{project.expectedOutcomes}</CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>
              Tasks (
              {project.tasks && Array.isArray(project.tasks)
                ? project.tasks.length
                : 0}
              )
            </CardTitle>
            <CardDescription>Tasks related to this project</CardDescription>
          </CardHeader>
          <CardContent>
            {!project.tasks ||
            !Array.isArray(project.tasks) ||
            project.tasks.length === 0 ? (
              <p className="text-muted-foreground">No tasks yet</p>
            ) : (
              <div className="space-y-2">
                {project.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 border border-border rounded-lg"
                  >
                    <div className="font-medium">{task.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {task.description}
                    </div>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {task.tags.map((tag) => (
                        <span
                          key={tag.id}
                          style={{ backgroundColor: tag.color }}
                          className="text-xs text-white px-2 py-1 rounded"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
