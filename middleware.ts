import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "nextstep-dev-secret-change-in-production"
)
const COOKIE_NAME = "nextstep-session"

const protectedPaths = ["/dashboard", "/new-goal"]
const authPaths = ["/login", "/get-started"]

function isProtected(pathname: string) {
  return protectedPaths.some((p) => pathname === p || pathname.startsWith(p + "/"))
}

function isAuthPath(pathname: string) {
  return authPaths.some((p) => pathname === p || pathname.startsWith(p + "/"))
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get(COOKIE_NAME)?.value

  if (isProtected(pathname)) {
    if (!token) {
      const loginUrl = new URL("/login", req.url)
      loginUrl.searchParams.set("from", pathname)
      return NextResponse.redirect(loginUrl)
    }
    try {
      await jwtVerify(token, JWT_SECRET)
      return NextResponse.next()
    } catch {
      const res = NextResponse.redirect(new URL("/login", req.url))
      res.cookies.delete(COOKIE_NAME)
      return res
    }
  }

  if (isAuthPath(pathname) && token) {
    try {
      await jwtVerify(token, JWT_SECRET)
      return NextResponse.redirect(new URL("/dashboard", req.url))
    } catch {
      // Token invalid, allow access to auth page
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/new-goal/:path*", "/login", "/get-started"],
}
