import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { verifyPassword, createToken, getAuthCookieName } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    const db = await getDb()
    const users = db.collection("users")

    const user = await users.findOne({ email: email.toLowerCase().trim() })
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    if (!user.passwordHash || user.authProvider === "google") {
      return NextResponse.json(
        { error: "This account uses Sign in with Google. Use the Google button above." },
        { status: 401 }
      )
    }

    const valid = await verifyPassword(password, user.passwordHash)
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    const id = user._id.toString()
    const token = await createToken({
      id,
      email: user.email,
      name: user.name,
    })

    const res = NextResponse.json({ user: { id, name: user.name, email: user.email } })
    res.cookies.set(getAuthCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })
    return res
  } catch (err) {
    console.error("Login error:", err)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
