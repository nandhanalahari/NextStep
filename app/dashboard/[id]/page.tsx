"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useGoals } from "@/lib/goals-context"
import { DashboardShell } from "@/components/dashboard-shell"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  ArrowLeft,
  Trash2,
  Trophy,
  PartyPopper,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

export default function GoalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { getGoal, toggleTask, deleteGoal } = useGoals()
  const [expandedTask, setExpandedTask] = useState<string | null>(null)
  const [celebrateId, setCelebrateId] = useState<string | null>(null)

  const goal = getGoal(id)

  if (!goal) {
    return (
      <DashboardShell>
        <div className="flex min-h-[50vh] flex-col items-center justify-center animate-fade-in">
          <h2 className="font-display text-xl font-bold text-foreground">Goal not found</h2>
          <p className="mt-2 text-muted-foreground">This goal may have been deleted.</p>
          <Link href="/dashboard" className="mt-4">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </DashboardShell>
    )
  }

  const completedCount = goal.tasks.filter((t) => t.completed).length
  const totalCount = goal.tasks.length
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const handleToggle = (taskId: string) => {
    const task = goal.tasks.find((t) => t.id === taskId)
    if (task && !task.completed) {
      setCelebrateId(taskId)
      setTimeout(() => setCelebrateId(null), 800)
    }
    toggleTask(goal.id, taskId)
  }

  const handleDelete = () => {
    deleteGoal(goal.id)
    router.push("/dashboard")
  }

  const createdDate = new Date(goal.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  return (
    <DashboardShell>
      {/* Back nav */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Goals
      </Link>

      {/* Goal Header */}
      <div className="animate-fade-in-up">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <h1 className="font-display text-3xl font-bold text-foreground">
              {goal.title}
            </h1>
            <p className="mt-2 text-lg text-muted-foreground leading-relaxed">
              {goal.description}
            </p>
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Created {createdDate}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="border-destructive/30 bg-transparent text-destructive hover:bg-destructive/10 shrink-0"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Goal
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">
              {completedCount} of {totalCount} tasks completed
            </span>
            <span className="font-display text-lg font-bold text-primary">
              {percentage}%
            </span>
          </div>
          <Progress value={percentage} className="h-3" />
        </div>
      </div>

      {/* Completion celebration */}
      {goal.completed && (
        <div className="mt-6 rounded-xl border border-primary/30 bg-primary/10 p-6 text-center animate-scale-in">
          <PartyPopper className="mx-auto h-10 w-10 text-primary" />
          <h2 className="mt-3 font-display text-xl font-bold text-foreground">
            Goal Completed!
          </h2>
          <p className="mt-1 text-muted-foreground">
            Amazing work! You have completed all tasks for this goal.
          </p>
        </div>
      )}

      {/* Tasks List */}
      <div className="mt-8">
        <h2 className="font-display text-xl font-bold text-foreground mb-4">Tasks</h2>
        <div className="flex flex-col gap-3">
          {goal.tasks.map((task, index) => {
            const isExpanded = expandedTask === task.id
            const isCelebrating = celebrateId === task.id

            return (
              <div
                key={task.id}
                className={`group relative rounded-xl border transition-all duration-300 animate-fade-in-up ${
                  task.completed
                    ? "border-primary/20 bg-primary/5"
                    : "border-border bg-card hover:border-primary/20"
                } ${isCelebrating ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-4 p-4">
                  {/* Step number + checkbox */}
                  <div className="flex flex-col items-center gap-2 pt-0.5">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                        task.completed
                          ? "bg-primary text-primary-foreground"
                          : "border border-border text-muted-foreground"
                      }`}
                    >
                      {task.completed ? (
                        <Trophy className="h-3.5 w-3.5" />
                      ) : (
                        index + 1
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={`task-${task.id}`}
                        checked={task.completed}
                        onCheckedChange={() => handleToggle(task.id)}
                        className="mt-1 h-5 w-5 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <label
                          htmlFor={`task-${task.id}`}
                          className={`block font-medium cursor-pointer transition-colors ${
                            task.completed
                              ? "text-muted-foreground line-through"
                              : "text-foreground"
                          }`}
                        >
                          {task.title}
                        </label>

                        {/* Expandable description */}
                        {isExpanded && (
                          <p className="mt-2 text-sm text-muted-foreground leading-relaxed animate-fade-in">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expand toggle */}
                  <button
                    type="button"
                    onClick={() => setExpandedTask(isExpanded ? null : task.id)}
                    className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                    aria-label={isExpanded ? "Collapse task details" : "Expand task details"}
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </DashboardShell>
  )
}
