import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-server"

const SCOPE = "https://www.googleapis.com/auth/calendar.events"

export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.redirect(new URL("/login?from=/dashboard", req.url))
  }

  const clientId = process.env.GOOGLE_CLIENT_ID
  const redirectUri = process.env.GOOGLE_REDIRECT_URI

  if (!clientId || !redirectUri) {
    console.error("GOOGLE_CLIENT_ID or GOOGLE_REDIRECT_URI not set")
    return NextResponse.redirect(new URL("/dashboard?calendar=error", req.url))
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPE,
    prompt: "consent",
    access_type: "offline",
  })

  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  return NextResponse.redirect(url)
}
