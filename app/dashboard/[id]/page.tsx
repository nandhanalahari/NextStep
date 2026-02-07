"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useGoals } from "@/lib/goals-context"
import { DashboardShell } from "@/components/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  Trash2,
  Trophy,
  PartyPopper,
  Calendar,
  Lock,
  Plus,
  ChevronDown,
  ChevronUp,
  Trash,
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
  const { getGoal, toggleTask, completeTask, updateGoalReflection, addTask, deleteTask, deleteGoal } = useGoals()
  const [celebrateId, setCelebrateId] = useState<string | null>(null)
  const [customTitle, setCustomTitle] = useState("")
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [addAfterIndex, setAddAfterIndex] = useState(0)
  const [customDescription, setCustomDescription] = useState("")
  const [completionDialogOpen, setCompletionDialogOpen] = useState(false)
  const [completionTaskId, setCompletionTaskId] = useState<string | null>(null)
  const [completionSummary, setCompletionSummary] = useState("")
  const [reflectionDialogOpen, setReflectionDialogOpen] = useState(false)
  const [reflectionGoalId, setReflectionGoalId] = useState<string | null>(null)
  const [reflection, setReflection] = useState({ beginningThoughts: "", endThoughts: "", satisfaction: 3 })
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null)
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null)

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
    if (task?.completed) {
      toggleTask(goal.id, taskId)
    } else if (task && isTaskUnlocked(goal.tasks.indexOf(task))) {
      setCompletionTaskId(taskId)
      setCompletionSummary("")
      setCompletionDialogOpen(true)
    }
  }

  const handleCompleteTask = () => {
    if (!completionTaskId || !completionSummary.trim()) return
    const taskIndex = goal.tasks.findIndex((t) => t.id === completionTaskId)
    const willCompleteGoal = goal.tasks.filter((t) => t.completed).length + 1 === goal.tasks.length
    completeTask(goal.id, completionTaskId, completionSummary.trim())
    setCelebrateId(completionTaskId)
    setTimeout(() => setCelebrateId(null), 800)
    setCompletionDialogOpen(false)
    setCompletionTaskId(null)
    setCompletionSummary("")
    if (willCompleteGoal) {
      setReflectionGoalId(goal.id)
      setReflection({ beginningThoughts: "", endThoughts: "", satisfaction: 3 })
      setReflectionDialogOpen(true)
    }
  }

  const handleReflectionSubmit = () => {
    if (reflectionGoalId) {
      updateGoalReflection(reflectionGoalId, {
        beginningThoughts: reflection.beginningThoughts.trim() || undefined,
        endThoughts: reflection.endThoughts.trim() || undefined,
        satisfaction: reflection.satisfaction,
      })
      setReflectionDialogOpen(false)
      setReflectionGoalId(null)
    }
  }

  const handleAddTask = () => {
    if (!customTitle.trim()) return
    addTask(goal.id, addAfterIndex, customTitle.trim(), customDescription.trim())
    setCustomTitle("")
    setCustomDescription("")
    setAddDialogOpen(false)
  }

  const handleDeleteTask = async (taskId: string) => {
    if (deletingTaskId) return
    setDeletingTaskId(taskId)
    try {
      await deleteTask(goal.id, taskId)
    } finally {
      setDeletingTaskId(null)
    }
  }

  const openAddDialog = (afterIndex: number) => {
    setAddAfterIndex(afterIndex)
    setCustomTitle("")
    setCustomDescription("")
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
        <div className="mt-6 rounded-xl border border-primary/30 bg-primary/10 p-6 animate-scale-in">
          <div className="text-center">
            <PartyPopper className="mx-auto h-10 w-10 text-primary" />
            <h2 className="mt-3 font-display text-xl font-bold text-foreground">
              Goal Completed!
            </h2>
            <p className="mt-1 text-muted-foreground">
              Amazing work! You have completed all tasks for this goal.
            </p>
          </div>
          {goal.reflection && (goal.reflection.beginningThoughts || goal.reflection.endThoughts || goal.reflection.satisfaction) && (
            <div className="mt-6 pt-6 border-t border-primary/20 space-y-3 text-left">
              {goal.reflection.satisfaction != null && (
                <p className="text-sm">
                  <span className="font-medium text-foreground">Satisfaction:</span>{" "}
                  <span className="text-primary">{goal.reflection.satisfaction}/5</span>
                </p>
              )}
              {goal.reflection.beginningThoughts && (
                <p className="text-sm">
                  <span className="font-medium text-foreground">At the start:</span>{" "}
                  <span className="text-muted-foreground">{goal.reflection.beginningThoughts}</span>
                </p>
              )}
              {goal.reflection.endThoughts && (
                <p className="text-sm">
                  <span className="font-medium text-foreground">Now:</span>{" "}
                  <span className="text-muted-foreground">{goal.reflection.endThoughts}</span>
                </p>
              )}
            </div>
          )}
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
                        <div
                          className="shrink-0 pt-0.5 flex flex-col gap-1 items-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {unlocked ? (
                            <Checkbox
                              id={`task-${task.id}`}
                              checked={task.completed}
                              onCheckedChange={() => handleToggle(task.id)}
                              className="h-5 w-5 cursor-pointer"
                            />
                          ) : (
                            <div
                              className="flex h-5 w-5 items-center justify-center rounded border border-border bg-muted"
                              title="Complete previous tasks to unlock"
                            >
                              <Lock className="h-3 w-3 text-muted-foreground" />
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteTask(task.id)}
                            disabled={deletingTaskId === task.id}
                            className="rounded p-0.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                            title="Delete task"
                          >
                            <Trash className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
                          className="min-w-0 flex-1 text-left"
                        >
                          <span
                            className={`block text-sm font-medium ${
                              task.completed
                                ? "text-muted-foreground line-through"
                                : unlocked
                                  ? "text-foreground"
                                  : "text-muted-foreground"
                            }`}
                          >
                            {task.title}
                          </span>
                          {(task.description || (task.completed && task.completionSummary)) && expandedTaskId === task.id && (
                            <div className="mt-2 space-y-2">
                              {task.description && (
                                <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                                  {task.description}
                                </p>
                              )}
                              {task.completed && task.completionSummary && (
                                <div>
                                  <p className="text-xs font-medium text-primary">What I did:</p>
                                  <p className="mt-0.5 text-xs text-muted-foreground whitespace-pre-wrap">
                                    {task.completionSummary}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                          {(task.description || (task.completed && task.completionSummary)) && expandedTaskId !== task.id && (
                            <span className="mt-1 flex items-center gap-1 text-xs text-primary">
                              <ChevronDown className="h-3 w-3" />
                              Click to expand
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-background border border-border mt-2 text-xs font-medium text-muted-foreground">
                      {index + 1}
                    </div>
                  </div>

                  {/* Connector line + Add button between tasks */}
                  {index < goal.tasks.length - 1 ? (
                    <div className="flex items-center px-1 self-start min-w-[48px] min-h-[40px]">
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
                  ) : (
                    /* Trophy at end of roadmap */
                    <div className="flex items-center px-1 self-start min-w-[48px] min-h-[40px]">
                      <div className="flex-1 h-px bg-border min-w-[24px]" />
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
                        <Trophy className="h-5 w-5 text-primary" />
                      </div>
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
            <div className="space-y-3 pt-2">
              <div>
                <Label className="text-sm">Title</Label>
                <Input
                  placeholder="Task title"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">Description</Label>
                <Textarea
                  placeholder="What does this task involve? How should it be done?"
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  className="mt-1 min-h-[80px]"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAddTask}
                  disabled={!customTitle.trim() || !customDescription.trim()}
                >
                  Add
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Task completion dialog: what did you do? */}
        <Dialog open={completionDialogOpen} onOpenChange={setCompletionDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Complete task</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              What did you do to accomplish this task? List or summarize your steps.
            </p>
            <Textarea
              placeholder="e.g., Researched 3 companies, updated resume, applied to 5 roles..."
              value={completionSummary}
              onChange={(e) => setCompletionSummary(e.target.value)}
              className="min-h-[120px] mt-2"
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setCompletionDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCompleteTask}
                disabled={!completionSummary.trim()}
                className="bg-primary text-primary-foreground"
              >
                Mark complete
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reflection dialog when goal fully completed */}
        <Dialog open={reflectionDialogOpen} onOpenChange={setReflectionDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Reflect on your journey</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              From the beginning to the end — how do you feel? Rate your satisfaction and share a brief reflection.
            </p>
            <div className="space-y-4 pt-4">
              <div>
                <Label className="text-sm">How satisfied are you? (1–5)</Label>
                <div className="flex gap-2 mt-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setReflection((r) => ({ ...r, satisfaction: n }))}
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                        reflection.satisfaction === n
                          ? "bg-primary text-primary-foreground"
                          : "border border-border bg-muted/50 hover:bg-muted"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-sm">How did you feel at the beginning?</Label>
                <Textarea
                  placeholder="e.g., Overwhelmed, uncertain where to start..."
                  value={reflection.beginningThoughts}
                  onChange={(e) => setReflection((r) => ({ ...r, beginningThoughts: e.target.value }))}
                  className="min-h-[80px] mt-2"
                />
              </div>
              <div>
                <Label className="text-sm">How do you feel now?</Label>
                <Textarea
                  placeholder="e.g., Proud, more confident, ready for the next step..."
                  value={reflection.endThoughts}
                  onChange={(e) => setReflection((r) => ({ ...r, endThoughts: e.target.value }))}
                  className="min-h-[80px] mt-2"
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={handleReflectionSubmit} className="bg-primary text-primary-foreground">
                Save reflection
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardShell>
  )
}
