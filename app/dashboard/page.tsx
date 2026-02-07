"use client"

import { useGoals } from "@/lib/goals-context"
import { DashboardShell } from "@/components/dashboard-shell"
import { GoalCard } from "@/components/goal-card"
import { Button } from "@/components/ui/button"
import { Plus, Target, Trophy } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { activeGoals, completedGoals } = useGoals()

  return (
    <DashboardShell>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Your Goals</h1>
          <p className="mt-1 text-muted-foreground">
            {activeGoals.length === 0
              ? "No active goals yet. Create one to get started."
              : `${activeGoals.length} active goal${activeGoals.length === 1 ? "" : "s"} in progress`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {completedGoals.length > 0 && (
            <Link href="/dashboard/completed">
              <Button
                variant="outline"
                className="border-border bg-transparent text-foreground hover:bg-secondary"
              >
                <Trophy className="mr-2 h-4 w-4 text-primary" />
                Completed ({completedGoals.length})
              </Button>
            </Link>
          )}
          <Link href="/new-goal">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              New Goal
            </Button>
          </Link>
        </div>
      </div>

      {/* Empty State */}
      {activeGoals.length === 0 && (
        <div className="mt-16 flex flex-col items-center text-center animate-fade-in">
          <div className="relative">
            <div className="absolute -inset-4 rounded-full bg-primary/10 blur-xl" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-primary/20 bg-card">
              <Target className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h2 className="mt-6 font-display text-xl font-bold text-foreground">
            No goals yet
          </h2>
          <p className="mt-2 max-w-md text-muted-foreground">
            Create your first goal and let our AI mentor break it down into achievable daily steps.
          </p>
          <Link href="/new-goal" className="mt-6">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 animate-pulse-glow">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Goal
            </Button>
          </Link>
        </div>
      )}

      {/* Goals Bulletin Board */}
      {activeGoals.length > 0 && (
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activeGoals.map((goal, index) => (
            <GoalCard key={goal.id} goal={goal} index={index} />
          ))}
        </div>
      )}
    </DashboardShell>
  )
}
