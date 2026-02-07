"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

const goals = [
  "land my dream internship",
  "learn machine learning",
  "get better grades",
  "be more productive",
  "launch my startup",
  "build healthy habits",
]

export function HeroSection() {
  const { user } = useAuth()
  const [currentGoal, setCurrentGoal] = useState(0)
  const [displayed, setDisplayed] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const goal = goals[currentGoal]
    let timeout: ReturnType<typeof setTimeout>

    if (!isDeleting) {
      if (displayed.length < goal.length) {
        timeout = setTimeout(() => {
          setDisplayed(goal.slice(0, displayed.length + 1))
        }, 60)
      } else {
        timeout = setTimeout(() => setIsDeleting(true), 2000)
      }
    } else {
      if (displayed.length > 0) {
        timeout = setTimeout(() => {
          setDisplayed(displayed.slice(0, -1))
        }, 30)
      } else {
        setIsDeleting(false)
        setCurrentGoal((prev) => (prev + 1) % goals.length)
      }
    }

    return () => clearTimeout(timeout)
  }, [displayed, isDeleting, currentGoal])

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-20">
      {/* Background glow effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      {/* Grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(160 84% 44% / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(160 84% 44% / 0.3) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {/* Badge */}
        <div className="mb-8 inline-flex animate-fade-in items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm text-primary">
          <Sparkles className="h-4 w-4" />
          <span>AI-Powered Life Mentoring</span>
        </div>

        {/* Main heading */}
        <h1
          className="animate-fade-in-up font-display text-5xl font-bold leading-tight tracking-tight text-foreground md:text-7xl"
          style={{ animationDelay: "100ms" }}
        >
          Your next step to
          <br />
          <span className="relative inline-block text-primary">
            {displayed}
            <span className="ml-0.5 inline-block h-[1em] w-[3px] animate-pulse rounded-full bg-primary align-middle" />
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className="mx-auto mt-6 max-w-2xl animate-fade-in-up text-lg leading-relaxed text-muted-foreground md:text-xl"
          style={{ animationDelay: "200ms" }}
        >
          Stop feeling overwhelmed by big goals. NextStep breaks them into one
          smart, daily micro-action — powered by AI that adapts to your pace,
          energy, and progress.
        </p>

        {/* CTA buttons */}
        <div
          className="mt-10 flex animate-fade-in-up flex-col items-center justify-center gap-4 sm:flex-row"
          style={{ animationDelay: "300ms" }}
        >
          <Link href={user ? "/dashboard" : "/get-started"}>
            <Button
              size="lg"
              className="group animate-pulse-glow bg-primary px-8 text-primary-foreground hover:bg-primary/90"
            >
              {user ? "Go to Dashboard" : "Start Your Journey"}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="#how-it-works">
            <Button
              variant="outline"
              size="lg"
              className="border-border px-8 text-foreground hover:bg-secondary bg-transparent"
            >
              See How It Works
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div
          className="mx-auto mt-16 grid max-w-lg animate-fade-in-up grid-cols-3 gap-8"
          style={{ animationDelay: "500ms" }}
        >
          {[
            { value: "10K+", label: "Active Users" },
            { value: "92%", label: "Completion Rate" },
            { value: "4.9", label: "User Rating" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-display text-2xl font-bold text-foreground md:text-3xl">
                {stat.value}
              </div>
              <div className="mt-1 text-xs text-muted-foreground md:text-sm">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
