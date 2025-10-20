import { setSession } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const session = {
    user: {
      id: "demo_user",
      email: "demo@example.com",
      name: "Demo User",
    },
  }

  await setSession(session)

  return NextResponse.json({ success: true, user: session.user })
}
