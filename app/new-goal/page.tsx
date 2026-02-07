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
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

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
  const [phase, setPhase] = useState<"input" | "generating" | "review" | "error">("input")
  const [visibleTasks, setVisibleTasks] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!goal.trim()) return
    setPhase("generating")
    setLoading(true)
    setErrorMessage(null)

    try {
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: goal.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        const msg = data?.error || "Failed to generate plan"
        setErrorMessage(msg)
        setPhase("error")
        toast.error(msg)
        return
      }

      if (!data?.plan?.title || !Array.isArray(data?.plan?.tasks)) {
        setErrorMessage("Invalid response from AI. Please try again.")
        setPhase("error")
        toast.error("Invalid response from AI")
        return
      }

      setPlan(data.plan)
      setPhase("review")

      // Animate tasks appearing one by one
      const taskCount = data.plan.tasks.length
      for (let i = 0; i < taskCount; i++) {
        await new Promise((resolve) => setTimeout(resolve, 150))
        setVisibleTasks(i + 1)
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong. Check your connection and try again."
      setErrorMessage(msg)
      setPhase("error")
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
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

    await addGoal(newGoal)
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

        {/* Expanded chat: user message + AI generating, plan, or error */}
        {(phase === "generating" || phase === "review" || phase === "error") && (
          <div className="animate-fade-in space-y-6">
            {/* User message bubble */}
            <div className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-br-md border border-primary/20 bg-primary/10 px-5 py-4">
                <p className="text-sm font-medium text-primary/90 mb-1">You</p>
                <p className="text-foreground">{goal}</p>
              </div>
            </div>

            {/* AI: typing indicator, plan, or error */}
            <div className="flex justify-start">
              <div className="max-w-[90%] rounded-2xl rounded-bl-md border border-border bg-card px-5 py-4 w-full">
                <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  NextStep AI
                </p>
                {phase === "error" && (
                  <div className="space-y-4">
                    <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{errorMessage || "Something went wrong."}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Check that GOOGLE_GENERATIVE_AI_API_KEY is set in .env.local and restart the dev server. Get a free key at{" "}
                      <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">aistudio.google.com/apikey</a>.
                    </p>
                    <Button
                      onClick={handleGenerate}
                      variant="outline"
                      className="border-border"
                    >
                      Try again
                    </Button>
                  </div>
                )}
                {phase === "generating" && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Crafting your plan...</span>
                    <div className="flex gap-1 ml-2">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"
                          style={{ animationDelay: `${i * 200}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {phase === "review" && plan && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-display text-lg font-bold text-foreground">
                        {plan.title}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {plan.description}
                      </p>
                    </div>
                    <div className="space-y-2">
                      {plan.tasks.map((task, index) => (
                        <div
                          key={task.title}
                          className={`rounded-lg border border-border bg-muted/30 p-3 transition-all ${
                            index < visibleTasks
                              ? "translate-y-0 opacity-100"
                              : "translate-y-2 opacity-0"
                          }`}
                          style={{ transitionDelay: `${index * 50}ms` }}
                        >
                          <span className="text-xs font-medium text-primary mr-2">
                            {index + 1}.
                          </span>
                          <span className="font-medium text-foreground">{task.title}</span>
                          {task.description && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              {task.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Head over to dashboard to see your roadmap.
                    </p>
                    <div className="flex flex-wrap gap-3 pt-2">
                      <Button
                        onClick={handleSave}
                        size="lg"
                        className="bg-primary text-primary-foreground hover:bg-primary/90 animate-pulse-glow"
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
                        className="border-border bg-transparent text-foreground"
                      >
                        Try a Different Goal
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
