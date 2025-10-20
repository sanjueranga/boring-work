import { tagOps } from "@/lib/storage"
import { NextResponse } from "next/server"

export async function GET() {
  const tags = tagOps.list()
  return NextResponse.json(tags)
}