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

const CALENDAR_EVENTS_URL = "https://www.googleapis.com/calendar/v3/calendars/primary/events"

export interface TaskForCalendarSync {
  id: string
  title: string
  description?: string
  dueDate?: string
  googleCalendarEventId?: string
}

/**
 * Create or update a Google Calendar all-day event for a task. Returns the event id or null.
 */
export async function syncTaskEventToGoogleCalendar(
  userId: string,
  goalTitle: string,
  task: TaskForCalendarSync
): Promise<string | null> {
  if (!task.dueDate) return null

  const accessToken = await getValidAccessToken(userId)
  if (!accessToken) return null

  const desc = [goalTitle, task.description].filter(Boolean).join("\n\n")
  const nextDay = new Date(task.dueDate + "T12:00:00")
  nextDay.setDate(nextDay.getDate() + 1)
  const endDate = nextDay.toISOString().slice(0, 10)
  const event = {
    summary: task.title,
    description: desc,
    start: { date: task.dueDate },
    end: { date: endDate },
  }

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  }

  if (task.googleCalendarEventId) {
    const res = await fetch(
      `${CALENDAR_EVENTS_URL}/${task.googleCalendarEventId}`,
      { method: "PUT", headers, body: JSON.stringify(event) }
    )
    if (res.status === 404) {
      // Event was deleted in Google Calendar; create new one
      const createRes = await fetch(CALENDAR_EVENTS_URL, {
        method: "POST",
        headers,
        body: JSON.stringify(event),
      })
      if (!createRes.ok) {
        console.error("Google Calendar create-after-update failed:", createRes.status)
        return null
      }
      const data = (await createRes.json()) as { id: string }
      return data.id
    }
    if (!res.ok) {
      console.error("Google Calendar update failed:", res.status)
      return null
    }
    const data = (await res.json()) as { id: string }
    return data.id
  }

  const res = await fetch(CALENDAR_EVENTS_URL, {
    method: "POST",
    headers,
    body: JSON.stringify(event),
  })
  if (!res.ok) {
    console.error("Google Calendar create failed:", res.status)
    return null
  }
  const data = (await res.json()) as { id: string }
  return data.id
}

/**
 * Delete a task's event from Google Calendar. No-op if no token or event missing.
 */
export async function deleteTaskEventFromGoogleCalendar(
  userId: string,
  eventId: string
): Promise<void> {
  const accessToken = await getValidAccessToken(userId)
  if (!accessToken) return

  const res = await fetch(
    `${CALENDAR_EVENTS_URL}/${eventId}`,
    { method: "DELETE", headers: { Authorization: `Bearer ${accessToken}` } }
  )
  if (!res.ok && res.status !== 404) {
    console.error("Google Calendar delete failed:", res.status)
  }
}
