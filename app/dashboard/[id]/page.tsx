"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useGoals } from "@/lib/goals-context"
import { DashboardShell } from "@/components/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  ArrowLeft,
  Trash2,
  Trophy,
  PartyPopper,
  Calendar,
  Lock,
  Plus,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

export default function GoalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { getGoal, toggleTask, addTask, deleteGoal } = useGoals()
  const [celebrateId, setCelebrateId] = useState<string | null>(null)
  const [customTitle, setCustomTitle] = useState("")
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [addAfterIndex, setAddAfterIndex] = useState(0)

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

  // First incomplete index: tasks before this are done; this and after are locked until previous done
  const firstIncompleteIndex = goal.tasks.findIndex((t) => !t.completed)
  const isTaskUnlocked = (index: number) => {
    if (goal.tasks[index].completed) return true
    if (firstIncompleteIndex === -1) return true // all done
    return index === firstIncompleteIndex
  }

  const handleToggle = (taskId: string) => {
    const task = goal.tasks.find((t) => t.id === taskId)
    if (task && !task.completed) {
      setCelebrateId(taskId)
      setTimeout(() => setCelebrateId(null), 800)
    }
    toggleTask(goal.id, taskId)
  }

  const handleAddTask = () => {
    if (!customTitle.trim()) return
    addTask(goal.id, addAfterIndex, customTitle.trim())
    setCustomTitle("")
    setAddDialogOpen(false)
  }

  const openAddDialog = (afterIndex: number) => {
    setAddAfterIndex(afterIndex)
    setCustomTitle("")
    setAddDialogOpen(true)
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

        <div className="mt-6 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">
              {completedCount} of {totalCount} tasks completed
            </span>
            <span className="font-display text-lg font-bold text-primary">
              {percentage}%
            </span>
          </div>
          <div className="h-3 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 rounded-full"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

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

      {/* Roadmap: horizontal left-to-right */}
      <div className="mt-8">
        <h2 className="font-display text-xl font-bold text-foreground mb-4">Roadmap</h2>
        <div className="overflow-x-auto pb-4 -mx-1">
          <div className="flex items-start gap-0 min-w-max">
            {goal.tasks.map((task, index) => {
              const unlocked = isTaskUnlocked(index)
              const isCelebrating = celebrateId === task.id

              return (
                <div key={task.id} className="flex items-center gap-0 flex-shrink-0">
                  {/* Task node */}
                  <div
                    className={`relative flex flex-col items-center w-[180px] sm:w-[200px] ${
                      isCelebrating ? "ring-2 ring-primary ring-offset-2 ring-offset-background rounded-xl" : ""
                    }`}
                  >
                    <div
                      className={`w-full rounded-xl border p-4 transition-all ${
                        task.completed
                          ? "border-primary/30 bg-primary/5"
                          : unlocked
                            ? "border-primary/30 bg-card hover:border-primary/40"
                            : "border-border bg-muted/50 opacity-80"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="shrink-0 pt-0.5">
                          {unlocked ? (
                            <Checkbox
                              id={`task-${task.id}`}
                              checked={task.completed}
                              onCheckedChange={() => handleToggle(task.id)}
                              className="h-5 w-5"
                            />
                          ) : (
                            <div
                              className="flex h-5 w-5 items-center justify-center rounded border border-border bg-muted"
                              title="Complete previous tasks to unlock"
                            >
                              <Lock className="h-3 w-3 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <label
                            htmlFor={unlocked ? `task-${task.id}` : undefined}
                            className={`block text-sm font-medium cursor-pointer ${
                              task.completed
                                ? "text-muted-foreground line-through"
                                : unlocked
                                  ? "text-foreground"
                                  : "text-muted-foreground"
                            }`}
                          >
                            {task.title}
                          </label>
                          {task.description && (
                            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-background border border-border mt-2 text-xs font-medium text-muted-foreground">
                      {index + 1}
                    </div>
                  </div>

                  {/* Connector line + Add button between tasks */}
                  {index < goal.tasks.length - 1 && (
                    <div className="flex items-center px-1 self-stretch min-w-[48px]">
                      <div className="flex-1 h-px bg-border min-w-[24px]" />
                      <button
                        type="button"
                        onClick={() => openAddDialog(index)}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-dashed border-primary/40 bg-primary/5 text-primary hover:bg-primary/15 transition-colors"
                        aria-label="Add task"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <div className="flex-1 h-px bg-border min-w-[24px]" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add custom task</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              New task will be inserted after step {addAfterIndex + 1}.
            </p>
            <div className="flex gap-2 pt-2">
              <Input
                placeholder="Task title"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
              />
              <Button
                onClick={handleAddTask}
                disabled={!customTitle.trim()}
                className="shrink-0"
              >
                Add
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardShell>
  )
}
