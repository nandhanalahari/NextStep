import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-server"
import { isCalendarConnected } from "@/lib/google-calendar"

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ connected: false }, { status: 200 })
  }

  const connected = await isCalendarConnected(user.id)
  return NextResponse.json({ connected })
}
