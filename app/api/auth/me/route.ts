import { NextRequest, NextResponse } from "next/server"
import { verifyToken, getAuthCookieName } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(getAuthCookieName())?.value
    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    return NextResponse.json({
      user: { id: payload.id, email: payload.email, name: payload.name },
    })
  } catch {
    return NextResponse.json({ user: null }, { status: 200 })
  }
}
