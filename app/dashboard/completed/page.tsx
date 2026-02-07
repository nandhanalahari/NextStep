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
} from "lucide-react"

export default function CompletedPage() {
  const { completedGoals } = useGoals()

  return (
    <DashboardShell>
      {/* Back nav */}
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
              {completedGoals.length === 0
                ? "No completed goals yet. Keep working!"
                : `${completedGoals.length} goal${completedGoals.length === 1 ? "" : "s"} achieved`}
            </p>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {completedGoals.length === 0 && (
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
            Complete all tasks in a goal to see it here. You got this!
          </p>
        </div>
      )}

      {/* Completed Goals List */}
      {completedGoals.length > 0 && (
        <div className="mt-8 flex flex-col gap-4">
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
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </DashboardShell>
  )
}
