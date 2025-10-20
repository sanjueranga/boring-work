import { getSession } from "@/lib/auth"
import { summaryOps, userOps } from "@/lib/storage"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await getSession()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await userOps.get(session.user.id)
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const summaries = await summaryOps.list(user.id)
  return NextResponse.json(summaries)
}