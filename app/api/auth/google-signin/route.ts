import { NextRequest, NextResponse } from "next/server"

const SCOPE = "openid email profile"

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const redirectUri = process.env.GOOGLE_REDIRECT_URI

  if (!clientId || !redirectUri) {
    console.error("GOOGLE_CLIENT_ID or GOOGLE_REDIRECT_URI not set")
    return NextResponse.redirect(new URL("/login?error=config", req.url))
  }

  const from = req.nextUrl.searchParams.get("from") || "/dashboard"
  const state = `signin:${encodeURIComponent(from)}`

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPE,
    state,
    access_type: "offline",
    prompt: "select_account",
  })

  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  return NextResponse.redirect(url)
}
