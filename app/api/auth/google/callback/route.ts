import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-server"
import { getDb } from "@/lib/mongodb"
import { createToken, getAuthCookieName } from "@/lib/auth"

const TOKEN_URL = "https://oauth2.googleapis.com/token"
const USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")
  const state = req.nextUrl.searchParams.get("state") || ""

  if (!code) {
    const isSignin = state.startsWith("signin:")
    return NextResponse.redirect(
      new URL(isSignin ? "/login?error=denied" : "/dashboard?calendar=denied", req.url)
    )
  }

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = process.env.GOOGLE_REDIRECT_URI

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.redirect(new URL("/login?error=config", req.url))
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
      const isSignin = state.startsWith("signin:")
      return NextResponse.redirect(
        new URL(isSignin ? "/login?error=token" : "/dashboard?calendar=error", req.url)
      )
    }

    const data = (await tokenRes.json()) as {
      access_token: string
      refresh_token?: string
      expires_in: number
    }

    // Sign-in with Google: state is "signin:<from>"
    if (state.startsWith("signin:")) {
      const from = (() => {
        try {
          return decodeURIComponent(state.slice(7)) || "/dashboard"
        } catch {
          return "/dashboard"
        }
      })()

      const userInfoRes = await fetch(USERINFO_URL, {
        headers: { Authorization: `Bearer ${data.access_token}` },
      })
      if (!userInfoRes.ok) {
        console.error("Google userinfo failed:", userInfoRes.status)
        return NextResponse.redirect(new URL("/login?error=userinfo", req.url))
      }

      const profile = (await userInfoRes.json()) as { id: string; email: string; name: string }
      const email = (profile.email || "").toLowerCase().trim()
      const name = (profile.name || email.split("@")[0] || "User").trim()

      if (!email) {
        return NextResponse.redirect(new URL("/login?error=no_email", req.url))
      }

      const db = await getDb()
      const users = db.collection("users")

      let user = await users.findOne({ email })
      if (!user) {
        const result = await users.insertOne({
          name,
          email,
          passwordHash: "",
          authProvider: "google",
          createdAt: new Date(),
        })
        user = await users.findOne({ _id: result.insertedId })
      }
      if (!user) {
        return NextResponse.redirect(new URL("/login?error=create", req.url))
      }

      const id = user._id.toString()
      const token = await createToken({
        id,
        email: user.email,
        name: user.name,
      })

      const res = NextResponse.redirect(new URL(from, req.url))
      res.cookies.set(getAuthCookieName(), token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      })
      return res
    }

    // Calendar flow: user must already be logged in
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.redirect(new URL("/login?from=/dashboard", req.url))
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
    const isSignin = state.startsWith("signin:")
    return NextResponse.redirect(
      new URL(isSignin ? "/login?error=server" : "/dashboard?calendar=error", req.url)
    )
  }
}
