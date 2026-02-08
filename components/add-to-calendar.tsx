"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CalendarPlus, Loader2, ExternalLink } from "lucide-react"
import type { Goal } from "@/lib/goals-context"

interface AddToCalendarProps {
  goal: Goal
}

export function AddToCalendar({ goal }: AddToCalendarProps) {
  const [connected, setConnected] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetch("/api/calendar/status")
      .then((r) => r.json())
      .then((d) => setConnected(d.connected))
      .catch(() => setConnected(false))
  }, [])

  const nextTask = goal.tasks.find((t) => !t.completed)
  const hasTaskToAdd = !!nextTask

  const handleConnect = () => {
    window.location.href = "/api/auth/google"
  }

  const handleAddToCalendar = async () => {
    if (!hasTaskToAdd) return
    setLoading(true)
    setError(null)
    setSuccess(false)
    try {
      const res = await fetch("/api/calendar/add-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goalId: goal.id,
          taskId: nextTask?.id,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || "Failed to add to calendar")
        return
      }
      setSuccess(true)
      if (data.link) {
        window.open(data.link, "_blank")
      }
    } catch {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  if (connected === null) {
    return (
      <div className="mt-6 rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Checking calendar…</span>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-6 rounded-xl border border-border bg-card p-6">
      <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
        <CalendarPlus className="h-5 w-5 text-primary" />
        Add to Google Calendar
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        {connected
          ? "Add today's next step as a calendar event (9:00 AM)."
          : "Connect your Google account to add tasks to Calendar."}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {!connected ? (
          <Button
            onClick={handleConnect}
            size="sm"
            variant="outline"
            className="border-primary/30 text-primary hover:bg-primary/10"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Connect Google Calendar
          </Button>
        ) : (
          <Button
            onClick={handleAddToCalendar}
            disabled={loading || !hasTaskToAdd}
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CalendarPlus className="mr-2 h-4 w-4" />
            )}
            {success ? "Added" : hasTaskToAdd ? "Add today's step to Calendar" : "No step to add"}
          </Button>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      {success && <p className="mt-2 text-sm text-primary">Event created. Open the link to view in Calendar.</p>}
    </div>
  )
}
