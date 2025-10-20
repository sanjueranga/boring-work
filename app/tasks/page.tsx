"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { CreateTaskDialog } from "@/components/create-task-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

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
  project: { title: string } | null;
  tags: Tag[];
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/tasks");
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      loadTasks();
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">All Tasks</h1>
            <p className="text-muted-foreground mt-2">
              View and manage all your tasks
            </p>
          </div>
          <CreateTaskDialog onTaskCreated={loadTasks} />
        </div>

        {isLoading ? (
          <div className="text-center text-muted-foreground">
            Loading tasks...
          </div>
        ) : tasks.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No tasks yet. Create one to get started!
            </CardContent>
          </Card>
        ) : (
          <div className="border rounded-lg">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                    Task
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                    Duration
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                    Project
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                    Tags
                  </th>
                  <th className="p-3 w-16"></th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr
                    key={task.id}
                    className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="p-3">
                      <div className="font-medium">{task.title}</div>
                      {task.description && (
                        <div className="text-sm text-muted-foreground mt-0.5">
                          {task.description}
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-sm text-muted-foreground whitespace-nowrap">
                      {task.duration} min
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {task.project?.title || "-"}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1 flex-wrap">
                        {task.tags.map((tag) => (
                          <span
                            key={tag.id}
                            style={{ backgroundColor: tag.color }}
                            className="text-xs text-white px-2 py-0.5 rounded"
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(task.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 size={18} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
