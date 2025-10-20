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

  const tasksWithTags = await Promise.all(
    tasks.map(async (task) => ({
      ...task,
      tags: (
        await Promise.all(
          (task.tags || []).map((tagId: string) => tagOps.get(tagId))
        )
      ).filter(Boolean),
    }))
  );

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
    id: generateId(),
    title,
    description,
    duration,
    projectId: projectId || undefined,
    userId: user.id,
    tags: tagIds || [],
    completed: false,
    createdAt: new Date(),
  });

  return NextResponse.json(task);
}
