"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Volume2, Loader2 } from "lucide-react"
import type { Goal } from "@/lib/goals-context"

interface VoiceSummaryProps {
  goal: Goal
}

function buildSummaryText(goal: Goal): string {
  if (goal.tasks.length === 0) {
    return `Add some tasks to get started with ${goal.title}.`
  }

  const nextTask = goal.tasks.find((t) => !t.completed)
  if (!nextTask) {
    return `You've completed all steps for ${goal.title}. Great work!`
  }

  const why = nextTask.description
    ? `Here's why it matters: ${nextTask.description}`
    : "Every step counts toward your goal."

  return `Today's next step for ${goal.title} is: ${nextTask.title}. ${why}`
}

export function VoiceSummary({ goal }: VoiceSummaryProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const summaryText = buildSummaryText(goal)

  const handlePlay = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: summaryText }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to generate speech")
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)

      audio.onended = () => URL.revokeObjectURL(url)
      await audio.play()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-6">
      <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
        <Volume2 className="h-5 w-5 text-primary" />
        Voice Mentor
      </h3>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
        {summaryText}
      </p>
      <div className="mt-4 flex items-center gap-3">
        <Button
          onClick={handlePlay}
          disabled={loading}
          size="sm"
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
          <span className="ml-2">{loading ? "Generating…" : "Listen"}</span>
        </Button>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    </div>
  )
}
