import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { getCurrentUser } from "@/lib/auth-server"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDb()
    const goals = await db
      .collection("goals")
      .find({ userId: user.id })
      .sort({ createdAt: -1 })
      .toArray()

    const result = goals.map((g) => ({
      id: g.id,
      title: g.title,
      description: g.description,
      tasks: g.tasks,
      createdAt: g.createdAt,
      completed: g.completed,
      reflection: g.reflection,
    }))

    return NextResponse.json({ goals: result })
  } catch (err) {
    console.error("Goals GET error:", err)
    return NextResponse.json({ error: "Failed to fetch goals" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { id, title, description, tasks, createdAt, completed, reflection } = body

    if (!id || !title || !Array.isArray(tasks)) {
      return NextResponse.json({ error: "Invalid goal data" }, { status: 400 })
    }

    const db = await getDb()
    const doc = {
      userId: user.id,
      id,
      title,
      description: description ?? "",
      tasks,
      createdAt: createdAt ?? new Date().toISOString(),
      completed: completed ?? false,
      reflection: reflection ?? undefined,
    }

    await db.collection("goals").insertOne(doc)
    return NextResponse.json({ goal: doc })
  } catch (err) {
    console.error("Goals POST error:", err)
    return NextResponse.json({ error: "Failed to create goal" }, { status: 500 })
  }
}
