import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-server"
import { getDb } from "@/lib/mongodb"

const TOKEN_URL = "https://oauth2.googleapis.com/token"

export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.redirect(new URL("/login?from=/dashboard", req.url))
  }

  const code = req.nextUrl.searchParams.get("code")
  if (!code) {
    return NextResponse.redirect(new URL("/dashboard?calendar=denied", req.url))
  }

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = process.env.GOOGLE_REDIRECT_URI

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.redirect(new URL("/dashboard?calendar=error", req.url))
  }

  try {
    const body = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    })

    const tokenRes = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    })

    if (!tokenRes.ok) {
      const err = await tokenRes.text()
      console.error("Google token exchange failed:", tokenRes.status, err)
      return NextResponse.redirect(new URL("/dashboard?calendar=error", req.url))
    }

    const data = (await tokenRes.json()) as {
      access_token: string
      refresh_token?: string
      expires_in: number
    }

    const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString()

    const db = await getDb()
    const update: Record<string, unknown> = {
      userId: user.id,
      accessToken: data.access_token,
      expiresAt,
      updatedAt: new Date().toISOString(),
    }
    if (data.refresh_token) update.refreshToken = data.refresh_token

    await db.collection("google_calendar_tokens").updateOne(
      { userId: user.id },
      { $set: update },
      { upsert: true },
    )

    return NextResponse.redirect(new URL("/dashboard?calendar=connected", req.url))
  } catch (err) {
    console.error("Google callback error:", err)
    return NextResponse.redirect(new URL("/dashboard?calendar=error", req.url))
  }
}
