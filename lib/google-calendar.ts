import { getDb } from "@/lib/mongodb"

const TOKEN_URL = "https://oauth2.googleapis.com/token"

export async function getValidAccessToken(userId: string): Promise<string | null> {
  const db = await getDb()
  const doc = await db.collection("google_calendar_tokens").findOne({ userId })
  if (!doc?.accessToken) return null

  const expiresAt = doc.expiresAt ? new Date(doc.expiresAt).getTime() : 0
  const now = Date.now()
  // Refresh if expires in under 5 minutes
  if (expiresAt > now + 5 * 60 * 1000) {
    return doc.accessToken as string
  }

  const refreshToken = doc.refreshToken
  if (!refreshToken) return doc.accessToken as string

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  if (!clientId || !clientSecret) return null

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  })

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  })

  if (!res.ok) {
    console.error("Google token refresh failed:", res.status)
    return null
  }

  const data = (await res.json()) as { access_token: string; expires_in: number }
  const newExpiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString()

  await db.collection("google_calendar_tokens").updateOne(
    { userId },
    { $set: { accessToken: data.access_token, expiresAt: newExpiresAt, updatedAt: new Date().toISOString() } },
  )

  return data.access_token
}

export async function isCalendarConnected(userId: string): Promise<boolean> {
  const token = await getValidAccessToken(userId)
  return !!token
}
