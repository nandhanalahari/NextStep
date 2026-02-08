import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-server"
import { getDb } from "@/lib/mongodb"
import { getValidAccessToken } from "@/lib/google-calendar"

const CALENDAR_EVENTS_URL = "https://www.googleapis.com/calendar/v3/calendars/primary/events"

/**
 * POST /api/calendar/sync-upcoming
 * Creates Google Calendar events for all upcoming tasks (due date set, not completed).
 * Each event is at 11:59 PM on the due date in the user's timezone.
 * Body: { timeZone?: string } — e.g. "America/Los_Angeles". Defaults to "UTC".
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const accessToken = await getValidAccessToken(user.id)
  if (!accessToken) {
    return NextResponse.json(
      { error: "Google Calendar not connected. Connect your account first." },
      { status: 400 },
    )
  }

  const body = await req.json().catch(() => ({}))
  const timeZone = (body.timeZone as string) || "UTC"

  const db = await getDb()
  const goals = await db
    .collection("goals")
    .find({ userId: user.id, completed: { $ne: true } })
    .toArray()

  type TaskDoc = { id: string; title: string; description?: string; completed: boolean; dueDate?: string }
  const upcoming: { goalTitle: string; task: TaskDoc }[] = []
  for (const goal of goals) {
    const tasks = (goal.tasks as TaskDoc[]) ?? []
    for (const task of tasks) {
      if (task.dueDate && !task.completed) {
        upcoming.push({ goalTitle: goal.title as string, task })
      }
    }
  }

  if (upcoming.length === 0) {
    return NextResponse.json({
      success: true,
      count: 0,
      message: "No upcoming tasks with due dates to sync.",
    })
  }

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  }

  let created = 0
  for (const { goalTitle, task } of upcoming) {
    const date = task.dueDate!
    const startDateTime = `${date}T23:59:00`
    const [y, m, d] = date.split("-").map(Number)
    const nextDay = new Date(Date.UTC(y, m - 1, d + 1))
    const endDate = nextDay.toISOString().slice(0, 10)
    const endDateTime = `${endDate}T00:00:00`
    const event = {
      summary: task.title,
      description: [goalTitle, task.description].filter(Boolean).join("\n\n"),
      start: { dateTime: startDateTime, timeZone },
      end: { dateTime: endDateTime, timeZone },
    }

    try {
      const res = await fetch(CALENDAR_EVENTS_URL, {
        method: "POST",
        headers,
        body: JSON.stringify(event),
      })
      if (res.ok) {
        created++
      } else {
        console.error("Sync upcoming event failed:", res.status, await res.text())
      }
    } catch (err) {
      console.error("Sync upcoming error for task", task.id, err)
    }
  }

  return NextResponse.json({
    success: true,
    count: created,
    total: upcoming.length,
    message: created === upcoming.length
      ? `${created} task${created === 1 ? "" : "s"} added to Google Calendar (11:59 PM each day).`
      : `${created} of ${upcoming.length} tasks added. Some may have failed.`,
  })
}
