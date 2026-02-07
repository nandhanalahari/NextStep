"use client"

import Link from "next/link"
import { useGoals } from "@/lib/goals-context"
import { DashboardShell } from "@/components/dashboard-shell"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  Trophy,
  CheckCircle2,
  Calendar,
  ArrowRight,
  Star,
  Target,
} from "lucide-react"

export default function CompletedPage() {
  const { inProgressGoals, completedGoals } = useGoals()

  const hasAnyGoals = inProgressGoals.length > 0 || completedGoals.length > 0

  return (
    <DashboardShell>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
            <Trophy className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Completed Goals
            </h1>
            <p className="mt-1 text-muted-foreground">
              {!hasAnyGoals
                ? "Complete at least one task to see goals here."
                : `${inProgressGoals.length} in progress, ${completedGoals.length} achieved`}
            </p>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {!hasAnyGoals && (
        <div className="mt-16 flex flex-col items-center text-center animate-fade-in">
          <div className="relative">
            <div className="absolute -inset-4 rounded-full bg-primary/10 blur-xl" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-primary/20 bg-card">
              <Star className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          <h2 className="mt-6 font-display text-xl font-bold text-foreground">
            Nothing here yet
          </h2>
          <p className="mt-2 max-w-md text-muted-foreground">
            Complete at least one task in a goal to see it here. You got this!
          </p>
        </div>
      )}

      {/* In Progress Goals (≥1 task completed, not all) */}
      {inProgressGoals.length > 0 && (
        <div className="mt-8">
          <h2 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            In Progress
          </h2>
          <div className="flex flex-col gap-4">
            {inProgressGoals.map((goal, index) => {
              const createdDate = new Date(goal.createdAt).toLocaleDateString(
                "en-US",
                { month: "short", day: "numeric", year: "numeric" }
              )
              const completedCount = goal.tasks.filter((t) => t.completed).length
              const totalCount = goal.tasks.length
              const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

              return (
                <Link key={goal.id} href={`/dashboard/${goal.id}`}>
                  <div
                    className="group rounded-xl border border-primary/20 bg-primary/5 p-5 transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 cursor-pointer animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 border border-primary/30">
                        <Target className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                              {goal.title}
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                              {goal.description}
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1 mt-1" />
                        </div>

                        <div className="mt-3 flex items-center gap-4">
                          <Progress value={percentage} className="h-2 flex-1" />
                          <span className="text-sm font-medium text-primary shrink-0">{percentage}%</span>
                        </div>

                        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                            {completedCount} of {totalCount} tasks
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {createdDate}
                          </div>
                        </div>

                        {/* Roadmap with trophy at end */}
                        <div className="mt-4 overflow-x-auto pb-2 -mx-1">
                          <div className="flex items-center gap-0 min-w-max">
                            {goal.tasks.map((task, taskIndex) => (
                              <div key={task.id} className="flex items-center gap-0 flex-shrink-0">
                                <div className="flex flex-col items-center w-[160px] sm:w-[180px]">
                                  <div className={`w-full rounded-lg border p-3 ${
                                    task.completed ? "border-primary/20 bg-primary/5" : "border-border bg-muted/30"
                                  }`}>
                                    <div className="flex items-center gap-2">
                                      {task.completed ? (
                                        <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                                      ) : (
                                        <div className="h-4 w-4 shrink-0 rounded-full border border-border" />
                                      )}
                                      <span className={`text-sm font-medium ${
                                        task.completed ? "text-foreground line-through" : "text-muted-foreground"
                                      }`}>
                                        {task.title}
                                      </span>
                                    </div>
                                  </div>
                                  <div className={`flex h-5 w-5 items-center justify-center rounded-full border mt-1.5 text-xs font-medium ${
                                    task.completed ? "bg-primary/20 border-primary/30 text-primary" : "border-border text-muted-foreground"
                                  }`}>
                                    {taskIndex + 1}
                                  </div>
                                </div>
                                {taskIndex < goal.tasks.length - 1 ? (
                                  <div className="flex-1 h-px bg-border min-w-[20px] mx-0.5" />
                                ) : (
                                  <div className="flex items-center gap-0.5 min-w-[40px]">
                                    <div className="flex-1 h-px bg-border min-w-[10px]" />
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                                      <Trophy className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="flex-1 h-px bg-border min-w-[10px]" />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Completed Goals (all tasks done) */}
      {completedGoals.length > 0 && (
        <div className={`mt-8 ${inProgressGoals.length > 0 ? "mt-12" : ""}`}>
          <h2 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Achieved
          </h2>
          <div className="flex flex-col gap-4">
            {completedGoals.map((goal, index) => {
              const createdDate = new Date(goal.createdAt).toLocaleDateString(
                "en-US",
                { month: "short", day: "numeric", year: "numeric" }
              )

              return (
                <Link key={goal.id} href={`/dashboard/${goal.id}`}>
                  <div
                    className="group rounded-xl border border-primary/20 bg-primary/5 p-5 transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 cursor-pointer animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 border border-primary/30">
                        <Trophy className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                              {goal.title}
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                              {goal.description}
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1 mt-1" />
                        </div>

                        <div className="mt-3 flex items-center gap-4">
                          <Progress value={100} className="h-2 flex-1" />
                          <span className="text-sm font-medium text-primary shrink-0">100%</span>
                        </div>

                        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                            {goal.tasks.length} tasks completed
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {createdDate}
                          </div>
                          {goal.reflection?.satisfaction && (
                            <div className="flex items-center gap-1">
                              Satisfaction: {goal.reflection.satisfaction}/5
                            </div>
                          )}
                        </div>

                        {/* Roadmap with trophy at end */}
                        <div className="mt-4 overflow-x-auto pb-2 -mx-1">
                          <div className="flex items-center gap-0 min-w-max">
                            {goal.tasks.map((task, taskIndex) => (
                              <div key={task.id} className="flex items-center gap-0 flex-shrink-0">
                                <div className="flex flex-col items-center w-[160px] sm:w-[180px]">
                                  <div className="w-full rounded-lg border border-primary/20 bg-primary/5 p-3">
                                    <div className="flex items-center gap-2">
                                      <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                                      <span className="text-sm font-medium text-foreground line-through">
                                        {task.title}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 border border-primary/30 mt-1.5 text-xs font-medium text-primary">
                                    {taskIndex + 1}
                                  </div>
                                </div>
                                {taskIndex < goal.tasks.length - 1 ? (
                                  <div className="flex-1 h-px bg-border min-w-[20px] mx-0.5" />
                                ) : (
                                  <div className="flex items-center gap-0.5 min-w-[40px]">
                                    <div className="flex-1 h-px bg-border min-w-[10px]" />
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                                      <Trophy className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="flex-1 h-px bg-border min-w-[10px]" />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </DashboardShell>
  )
}
