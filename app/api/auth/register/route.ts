import { NextResponse } from "next/server"
import { userOps } from "@/lib/storage"
import { setSession } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { email, name, password, confirmPassword } = await request.json()

    if (!email || !name || !password) {
      return NextResponse.json({ error: "Email, name, and password are required" }, { status: 400 })
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    const user = userOps.register(email, name, password)

    await setSession({ user: { id: user.id, email: user.email, name: user.name } })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Registration failed"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
