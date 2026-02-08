import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-server"
import { getDb } from "@/lib/mongodb"
import { getValidAccessToken } from "@/lib/google-calendar"

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
  const { goalId, taskId } = body as { goalId?: string; taskId?: string }

  if (!goalId) {
    return NextResponse.json({ error: "goalId is required" }, { status: 400 })
  }

  const db = await getDb()
  const goal = await db.collection("goals").findOne({ id: goalId, userId: user.id })
  if (!goal) {
    return NextResponse.json({ error: "Goal not found" }, { status: 404 })
  }

  const tasks = (goal.tasks as { id: string; title: string; description?: string; completed: boolean }[]) ?? []
  const nextTask = taskId
    ? tasks.find((t) => t.id === taskId)
    : tasks.find((t) => !t.completed)

  if (!nextTask) {
    return NextResponse.json(
      { error: "No task to add. Complete the previous step or pick a task." },
      { status: 400 },
    )
  }

  // Pick time: today at 9:00 AM local (we use a sensible default; client could send timeZone/dateTime later)
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  const start = `${year}-${month}-${day}T09:00:00`
  const end = `${year}-${month}-${day}T09:30:00`

  const event = {
    summary: nextTask.title,
    description: [
      `NextStep: ${goal.title}`,
      nextTask.description || "",
    ].filter(Boolean).join("\n\n"),
    start: { dateTime: start, timeZone: "UTC" },
    end: { dateTime: end, timeZone: "UTC" },
  }

  try {
    const res = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error("Calendar API error:", res.status, err)
      return NextResponse.json(
        { error: "Failed to create calendar event" },
        { status: 502 },
      )
    }

    const created = (await res.json()) as { id: string; htmlLink?: string }
    return NextResponse.json({
      success: true,
      eventId: created.id,
      link: created.htmlLink,
    })
  } catch (err) {
    console.error("Add calendar event error:", err)
    return NextResponse.json(
      { error: "Failed to create calendar event" },
      { status: 500 },
    )
  }
}
