"use client"

import { useSession } from "@/lib/use-session"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function HomePage() {
  const { session, loading } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (session?.user) {
        router.push("/dashboard")
      } else {
        router.push("/login")
      }
    }
  }, [session, loading, router])

  return null
}
