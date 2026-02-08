"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useGoals } from "@/lib/goals-context"
import { DashboardShell } from "@/components/dashboard-shell"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, CalendarDays, CheckCircle2, Circle } from "lucide-react"

export default function CalendarPage() {
  const { goals } = useGoals()
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date()
    return { year: d.getFullYear(), month: d.getMonth() }
  })

  const tasksByDate = useMemo(() => {
    const map = new Map<string, { goalId: string; goalTitle: string; task: { id: string; title: string; completed: boolean; dueDate?: string } }[]>()
    for (const goal of goals) {
      if (goal.completed) continue
      for (const task of goal.tasks) {
        if (!task.dueDate) continue
        const list = map.get(task.dueDate) ?? []
        list.push({ goalId: goal.id, goalTitle: goal.title, task })
        map.set(task.dueDate, list)
      }
    }
    return map
  }, [goals])

  const monthLabel = `${new Date(viewMonth.year, viewMonth.month).toLocaleString("default", { month: "long" })} ${viewMonth.year}`

  const daysInMonth = useMemo(() => {
    const first = new Date(viewMonth.year, viewMonth.month, 1)
    const last = new Date(viewMonth.year, viewMonth.month + 1, 0)
    const startPad = first.getDay()
    const days: (string | null)[] = []
    for (let i = 0; i < startPad; i++) days.push(null)
    for (let d = 1; d <= last.getDate(); d++) {
      days.push(`${viewMonth.year}-${String(viewMonth.month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`)
    }
    return days
  }, [viewMonth.year, viewMonth.month])

  const goPrev = () => {
    setViewMonth((m) => (m.month === 0 ? { year: m.year - 1, month: 11 } : { ...m, month: m.month - 1 }))
  }
  const goNext = () => {
    setViewMonth((m) => (m.month === 11 ? { year: m.year + 1, month: 0 } : { ...m, month: m.month + 1 }))
  }
  const goToday = () => {
    const d = new Date()
    setViewMonth({ year: d.getFullYear(), month: d.getMonth() })
  }

  const todayStr = useMemo(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
  }, [])

  return (
    <DashboardShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-primary" />
            Calendar
          </h1>
          <p className="text-sm text-muted-foreground">
            Set due dates on your roadmap tasks, then see them here.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={goPrev} className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-display text-lg font-semibold text-foreground min-w-[180px] text-center">
                {monthLabel}
              </span>
              <Button variant="outline" size="icon" onClick={goNext} className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="ghost" size="sm" onClick={goToday}>
              Today
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {daysInMonth.map((dateStr, i) => {
              if (!dateStr) return <div key={`empty-${i}`} className="h-10" />
              const tasks = tasksByDate.get(dateStr) ?? []
              const isToday = dateStr === todayStr
              return (
                <Link
                  key={dateStr}
                  href={tasks.length > 0 ? `/dashboard/${tasks[0].goalId}` : "#"}
                  className={`min-h-10 rounded-lg border p-1.5 text-left transition-colors ${
                    isToday
                      ? "border-primary bg-primary/10"
                      : tasks.length > 0
                        ? "border-primary/30 bg-primary/5 hover:bg-primary/10"
                        : "border-transparent hover:bg-muted/50"
                  }`}
                >
                  <span className={`text-sm ${isToday ? "font-semibold text-primary" : "text-foreground"}`}>
                    {new Date(dateStr + "T12:00:00").getDate()}
                  </span>
                  {tasks.length > 0 && (
                    <div className="mt-0.5 space-y-0.5">
                      {tasks.slice(0, 2).map(({ goalId, goalTitle, task }) => (
                        <div key={task.id} className="flex items-center gap-1 truncate">
                          {task.completed ? (
                            <CheckCircle2 className="h-3 w-3 shrink-0 text-primary" />
                          ) : (
                            <Circle className="h-3 w-3 shrink-0 text-muted-foreground" />
                          )}
                          <span className="truncate text-[10px] text-muted-foreground" title={task.title}>
                            {task.title}
                          </span>
                        </div>
                      ))}
                      {tasks.length > 2 && (
                        <span className="text-[10px] text-muted-foreground">+{tasks.length - 2}</span>
                      )}
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="font-display text-lg font-semibold text-foreground mb-3">Upcoming</h2>
          {(() => {
            const sorted = Array.from(tasksByDate.entries())
              .filter(([d]) => d >= todayStr)
              .sort((a, b) => a[0].localeCompare(b[0]))
              .slice(0, 14)
              .map(([dateStr, list]) => [dateStr, list.filter(({ task }) => !task.completed)] as const)
              .filter(([, list]) => list.length > 0)
            if (sorted.length === 0) {
              return (
                <p className="text-sm text-muted-foreground">
                  No upcoming tasks with due dates. Open a goal and set a due date on your current step.
                </p>
              )
            }
            return (
              <ul className="space-y-2">
                {sorted.map(([dateStr, list]) => (
                  <li key={dateStr} className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-muted-foreground">
                      {new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    {list.map(({ goalId, goalTitle, task }) => (
                      <Link
                        key={task.id}
                        href={`/dashboard/${goalId}`}
                        className="flex items-center gap-2 rounded-lg border border-border bg-background/50 px-3 py-2 text-sm hover:border-primary/30"
                      >
                        <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="flex-1 truncate font-medium text-foreground">{task.title}</span>
                        <span className="text-xs text-muted-foreground truncate">{goalTitle}</span>
                      </Link>
                    ))}
                  </li>
                ))}
              </ul>
            )
          })()}
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="font-display text-lg font-semibold text-foreground mb-3">Completed</h2>
          {(() => {
            const sorted = Array.from(tasksByDate.entries())
              .map(([dateStr, list]) => [dateStr, list.filter(({ task }) => task.completed)] as const)
              .filter(([, list]) => list.length > 0)
              .sort((a, b) => b[0].localeCompare(a[0]))
              .slice(0, 14)
            if (sorted.length === 0) {
              return (
                <p className="text-sm text-muted-foreground">
                  No completed tasks with due dates yet.
                </p>
              )
            }
            return (
              <ul className="space-y-2">
                {sorted.map(([dateStr, list]) => (
                  <li key={dateStr} className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-muted-foreground">
                      {new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    {list.map(({ goalId, goalTitle, task }) => (
                      <Link
                        key={task.id}
                        href={`/dashboard/${goalId}`}
                        className="flex items-center gap-2 rounded-lg border border-border bg-background/50 px-3 py-2 text-sm hover:border-primary/30"
                      >
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                        <span className="flex-1 truncate font-medium text-muted-foreground line-through">{task.title}</span>
                        <span className="text-xs text-muted-foreground truncate">{goalTitle}</span>
                      </Link>
                    ))}
                  </li>
                ))}
              </ul>
            )
          })()}
        </div>
      </div>
    </DashboardShell>
  )
}
