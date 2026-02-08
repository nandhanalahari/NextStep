import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { getCurrentUser } from "@/lib/auth-server"
import {
  syncTaskEventToGoogleCalendar,
  deleteTaskEventFromGoogleCalendar,
} from "@/lib/google-calendar"

type TaskDoc = {
  id: string
  title: string
  description?: string
  completed: boolean
  dueDate?: string
  googleCalendarEventId?: string
  [key: string]: unknown
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { title, description, tasks: bodyTasks, createdAt, completed, reflection } = body

    const db = await getDb()
    const update: Record<string, unknown> = {}
    if (title !== undefined) update.title = title
    if (description !== undefined) update.description = description
    if (createdAt !== undefined) update.createdAt = createdAt
    if (completed !== undefined) update.completed = completed
    if (reflection !== undefined) update.reflection = reflection

    if (bodyTasks !== undefined && Array.isArray(bodyTasks)) {
      const current = await db.collection("goals").findOne({ id, userId: user.id })
      const currentTasks = (current?.tasks as TaskDoc[] | undefined) ?? []
      const bodyTaskIds = new Set((bodyTasks as TaskDoc[]).map((t) => t.id))

      for (const prev of currentTasks) {
        if (!bodyTaskIds.has(prev.id) && prev.googleCalendarEventId) {
          await deleteTaskEventFromGoogleCalendar(user.id, prev.googleCalendarEventId)
        }
      }

      const merged: TaskDoc[] = bodyTasks.map((t: TaskDoc) => {
        const cur = currentTasks.find((c) => c.id === t.id)
        return {
          ...t,
          googleCalendarEventId: t.googleCalendarEventId ?? cur?.googleCalendarEventId,
        }
      })

      for (let i = 0; i < merged.length; i++) {
        const task = merged[i]
        const prev = currentTasks.find((c) => c.id === task.id)

        if (task.completed && prev?.googleCalendarEventId) {
          await deleteTaskEventFromGoogleCalendar(user.id, prev.googleCalendarEventId)
          merged[i] = { ...task, googleCalendarEventId: undefined }
        } else if (task.dueDate) {
          const eventId = await syncTaskEventToGoogleCalendar(user.id, (current?.title as string) ?? "", task)
          if (eventId) merged[i] = { ...task, googleCalendarEventId: eventId }
        } else if (prev?.googleCalendarEventId) {
          await deleteTaskEventFromGoogleCalendar(user.id, prev.googleCalendarEventId)
          merged[i] = { ...task, googleCalendarEventId: undefined }
        }
      }

      update.tasks = merged
    }

    const result = await db.collection("goals").findOneAndUpdate(
      { id, userId: user.id },
      { $set: update },
      { returnDocument: "after" }
    )

    if (!result) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 })
    }

    return NextResponse.json({ goal: result })
  } catch (err) {
    console.error("Goals PATCH error:", err)
    return NextResponse.json({ error: "Failed to update goal" }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const db = await getDb()
    const result = await db.collection("goals").deleteOne({ id, userId: user.id })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Goals DELETE error:", err)
    return NextResponse.json({ error: "Failed to delete goal" }, { status: 500 })
  }
}
