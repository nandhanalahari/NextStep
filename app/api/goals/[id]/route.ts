import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { getCurrentUser } from "@/lib/auth-server"

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
    const { title, description, tasks, createdAt, completed, reflection } = body

    const db = await getDb()
    const update: Record<string, unknown> = {}
    if (title !== undefined) update.title = title
    if (description !== undefined) update.description = description
    if (tasks !== undefined) update.tasks = tasks
    if (createdAt !== undefined) update.createdAt = createdAt
    if (completed !== undefined) update.completed = completed
    if (reflection !== undefined) update.reflection = reflection

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
