import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { hashPassword, createToken, getAuthCookieName } from "@/lib/auth"
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, password } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    const db = await getDb()
    const users = db.collection("users")

    const existing = await users.findOne({ email: email.toLowerCase().trim() })
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      )
    }

    const passwordHash = await hashPassword(password)
    const doc = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      createdAt: new Date(),
    }
    const result = await users.insertOne(doc)
    const id = result.insertedId.toString()

    const token = await createToken({ id, email: doc.email, name: doc.name })

    const res = NextResponse.json({ user: { id, name: doc.name, email: doc.email } })
    res.cookies.set(getAuthCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })
    return res
  } catch (err) {
    console.error("Signup error:", err)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
