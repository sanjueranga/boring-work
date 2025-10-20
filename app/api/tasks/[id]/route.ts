import { getSession } from "@/lib/auth"
import { taskOps } from "@/lib/storage"
import { type NextRequest, NextResponse } from "next/server"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const task = taskOps.get(params.id)

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 })
  }

  taskOps.delete(params.id)

  return NextResponse.json({ success: true })
}
