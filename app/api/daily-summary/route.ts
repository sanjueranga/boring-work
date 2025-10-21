import { getSession } from "@/lib/auth";
import { userOps, taskOps, tagOps } from "@/lib/storage";
import { NextResponse } from "next/server";

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

  if (!Array.isArray(tasks)) {
    return NextResponse.json([]);
  }

  // Group tasks by date
  const tasksByDate = tasks.reduce((acc, task) => {
    const createdAt =
      task.createdAt instanceof Date
        ? task.createdAt
        : new Date(task.createdAt || Date.now());
    const date = createdAt.toISOString().split("T")[0];

    if (!acc[date]) {
      acc[date] = {
        date,
        weight: 0,
        tagWeights: {},
      };
    }

    // Calculate weights for each tag
    const tags = Array.isArray(task.tags)
      ? (task.tags as (string | { _id?: unknown })[])
      : [];
    tags.forEach((tag: string | { _id?: unknown }) => {
      const tagId =
        typeof tag === "string" ? tag : tag._id ? String(tag._id) : "";
      if (tagId) {
        acc[date].weight += 1;
        acc[date].tagWeights[tagId] = (acc[date].tagWeights[tagId] || 0) + 1;
      }
    });

    return acc;
  }, {} as Record<string, { date: string; weight: number; tagWeights: Record<string, number> }>);

  // Convert to array and sort by date
  const summaries = (Object.values(tasksByDate) as {
    date: string;
    weight: number;
    tagWeights: Record<string, number>;
  }[]).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return NextResponse.json(summaries);
}
