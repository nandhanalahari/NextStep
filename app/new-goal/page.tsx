"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useGoals, type Goal } from "@/lib/goals-context"
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Loader2,
  Check,
  Zap,
  Target,
} from "lucide-react"
import Link from "next/link"

interface GeneratedPlan {
  title: string
  description: string
  tasks: { title: string; description: string }[]
}

export default function NewGoalPage() {
  const router = useRouter()
  const { addGoal } = useGoals()
  const [goal, setGoal] = useState("")
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState<GeneratedPlan | null>(null)
  const [phase, setPhase] = useState<"input" | "generating" | "review">("input")
  const [visibleTasks, setVisibleTasks] = useState(0)

  const handleGenerate = async () => {
    if (!goal.trim()) return
    setPhase("generating")
    setLoading(true)

    try {
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: goal.trim() }),
      })

      if (!res.ok) throw new Error("Failed to generate plan")

      const data = await res.json()
      setPlan(data.plan)
      setPhase("review")

      // Animate tasks appearing one by one
      const taskCount = data.plan.tasks.length
      for (let i = 0; i < taskCount; i++) {
        await new Promise((resolve) => setTimeout(resolve, 150))
        setVisibleTasks(i + 1)
      }
    } catch {
      setPhase("input")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = () => {
    if (!plan) return

    const newGoal: Goal = {
      id: crypto.randomUUID(),
      title: plan.title,
      description: plan.description,
      tasks: plan.tasks.map((t) => ({
        id: crypto.randomUUID(),
        title: t.title,
        description: t.description,
        completed: false,
      })),
      createdAt: new Date().toISOString(),
      completed: false,
    }

    addGoal(newGoal)
    router.push("/dashboard")
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/8 blur-[150px]" />
      </div>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(hsl(160 84% 44% / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(160 84% 44% / 0.3) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Header */}
      <header className="relative z-10 mx-auto flex max-w-4xl items-center justify-between px-6 py-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold text-foreground">NextStep</span>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-3xl px-6 pb-20">
        {/* Input Phase */}
        {phase === "input" && (
          <div className="animate-fade-in-up">
            <div className="mb-10 text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm text-primary">
                <Target className="h-4 w-4" />
                New Goal
              </div>
              <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">
                What do you want to achieve?
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Tell us your goal and our AI mentor will create a personalized action plan.
              </p>
            </div>

            <div className="relative">
              <div className="absolute -inset-1 rounded-2xl bg-primary/10 blur-lg" />
              <div className="relative rounded-2xl border border-primary/20 bg-card p-6">
                <Textarea
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g., I want to land a software engineering internship at a top tech company this summer..."
                  className="min-h-[140px] resize-none border-0 bg-transparent text-lg text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Be as specific or vague as you want — the AI adapts.
                  </p>
                  <Button
                    onClick={handleGenerate}
                    disabled={!goal.trim()}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 group"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Plan
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Example goals */}
            <div className="mt-8">
              <p className="mb-3 text-center text-sm text-muted-foreground">Try these:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  "Learn machine learning",
                  "Get a tech internship",
                  "Build healthy morning habits",
                  "Launch a side project",
                  "Improve my GPA",
                ].map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => setGoal(example)}
                    className="rounded-full border border-border bg-secondary/50 px-4 py-2 text-sm text-muted-foreground transition-all hover:border-primary/30 hover:bg-primary/10 hover:text-foreground"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Generating Phase */}
        {phase === "generating" && (
          <div className="flex min-h-[60vh] flex-col items-center justify-center animate-fade-in">
            <div className="relative">
              <div className="absolute -inset-4 rounded-full bg-primary/20 blur-xl animate-pulse" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-primary/30 bg-card">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            </div>
            <h2 className="mt-8 font-display text-2xl font-bold text-foreground">
              Crafting your plan...
            </h2>
            <p className="mt-3 text-muted-foreground">
              AI is analyzing your goal and creating personalized micro-tasks
            </p>
            <div className="mt-6 flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-2 w-2 rounded-full bg-primary animate-pulse"
                  style={{ animationDelay: `${i * 200}ms` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Review Phase */}
        {phase === "review" && plan && (
          <div className="animate-fade-in">
            <div className="mb-8 text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm text-primary">
                <Check className="h-4 w-4" />
                Plan Ready
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
                {plan.title}
              </h1>
              <p className="mt-3 text-lg text-muted-foreground">
                {plan.description}
              </p>
            </div>

            {/* Tasks */}
            <div className="flex flex-col gap-4">
              {plan.tasks.map((task, index) => (
                <div
                  key={task.title}
                  className={`group relative rounded-xl border border-border bg-card p-5 transition-all duration-500 hover:border-primary/30 hover:bg-card/80 ${
                    index < visibleTasks
                      ? "translate-y-0 opacity-100"
                      : "translate-y-4 opacity-0"
                  }`}
                  style={{
                    transitionDelay: `${index * 50}ms`,
                  }}
                >
                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-sm font-bold text-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display font-semibold text-foreground">
                        {task.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {task.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                onClick={handleSave}
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-10 animate-pulse-glow"
              >
                <Check className="mr-2 h-4 w-4" />
                Save to Dashboard
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  setPlan(null)
                  setVisibleTasks(0)
                  setPhase("input")
                }}
                className="border-border bg-transparent text-foreground hover:bg-secondary"
              >
                Try a Different Goal
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
