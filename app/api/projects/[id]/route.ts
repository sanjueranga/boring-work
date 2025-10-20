import { getSession } from "@/lib/auth";
import { projectOps, taskOps, userOps } from "@/lib/storage";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let user = await userOps.get(session.user.id);
  if (!user) {
    user = await userOps.create({
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      password: Buffer.from(crypto.randomUUID()).toString("base64"), // Generate a random password for OAuth users
    });
  }

  const project = await projectOps.get(params.id);

  if (!project || project.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const tasks = await taskOps.listByProject(project.id);

  return NextResponse.json({ ...project, tasks });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, description, expectedOutcomes } = await request.json();

  const project = projectOps.update(params.id, {
    title,
    description,
    expectedOutcomes,
  });

  return NextResponse.json(project);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  projectOps.delete(params.id);

  return NextResponse.json({ success: true });
}
