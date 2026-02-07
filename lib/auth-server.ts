import { cookies } from "next/headers"
import { verifyToken, getAuthCookieName } from "@/lib/auth"

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get(getAuthCookieName())?.value
  if (!token) return null
  const payload = await verifyToken(token)
  return payload
}
