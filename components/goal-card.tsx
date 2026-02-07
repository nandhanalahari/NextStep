"use client"

import Link from "next/link"
import type { Goal } from "@/lib/goals-context"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Circle, ArrowRight, Calendar } from "lucide-react"

interface GoalCardProps {
  goal: Goal
  index: number
}

export function GoalCard({ goal, index }: GoalCardProps) {
  const completedCount = goal.tasks.filter((t) => t.completed).length
  const totalCount = goal.tasks.length
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const createdDate = new Date(goal.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })

  return (
    <Link href={`/dashboard/${goal.id}`}>
      <div
        className="group relative h-full rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 animate-scale-in cursor-pointer"
        style={{ animationDelay: `${index * 100}ms` }}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-display text-lg font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {goal.title}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {goal.description}
            </p>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1 ml-3" />
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {completedCount} of {totalCount} tasks
            </span>
            <span className="font-medium text-primary">{percentage}%</span>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>

        {/* Tasks preview */}
        <div className="mt-4 flex flex-col gap-1.5">
          {goal.tasks.slice(0, 3).map((task) => (
            <div key={task.id} className="flex items-center gap-2 text-sm">
              {task.completed ? (
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" />
              ) : (
                <Circle className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
              )}
              <span
                className={`truncate ${
                  task.completed ? "text-muted-foreground line-through" : "text-foreground/80"
                }`}
              >
                {task.title}
              </span>
            </div>
          ))}
          {goal.tasks.length > 3 && (
            <p className="text-xs text-muted-foreground ml-5">
              +{goal.tasks.length - 3} more tasks
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground pt-3 border-t border-border">
          <Calendar className="h-3 w-3" />
          Created {createdDate}
        </div>
      </div>
    </Link>
  )
}
