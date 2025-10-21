import { getSession } from "@/lib/auth";
import { taskOps, userOps, tagOps } from "@/lib/storage";
import { type NextRequest, NextResponse } from "next/server";
import { generateId } from "@/lib/uuid";

export async function GET() {
  const session = await getSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await userOps.get(session.user.id);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const tasks = await taskOps.list(user.id);
  if (!tasks || !Array.isArray(tasks)) {
    return NextResponse.json([]);
  }

  const tasksWithTags = tasks.map((task) => ({
    id: task._id?.toString() || task.id || "",
    title: task.title || "",
    description: task.description || "",
    projectId: task.projectId || null,
    tags: Array.isArray(task.tags) ? task.tags : [],
    completed: Boolean(task.completed),
    createdAt: task.createdAt || new Date().toISOString(),
  }));

  return NextResponse.json(tasksWithTags);
}

export async function POST(request: NextRequest) {
  const session = await getSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await userOps.get(session.user.id);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { title, description, duration, projectId, tagIds } =
    await request.json();

  const task = await taskOps.create({
    title,
    description,
    projectId: projectId || undefined,
    userId: user.id,
    tags: tagIds || [],
  });

  return NextResponse.json(task);
}
