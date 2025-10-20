import { getSession } from "@/lib/auth";
import { projectOps, userOps, taskOps } from "@/lib/storage";
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

  const projects = await projectOps.list(user.id);
  const projectsWithCounts = await Promise.all(
    projects.map(async (project) => ({
      ...project,
      _count: {
        tasks: (await taskOps.listByProject(project.id)).length,
      },
    }))
  );
  return NextResponse.json(projectsWithCounts);
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

  const { title, description, expectedOutcomes } = await request.json();

  const project = await projectOps.create({
    id: generateId(),
    title,
    description,
    expectedOutcomes,
    userId: user.id,
    createdAt: new Date(),
  });

  return NextResponse.json(project);
}
