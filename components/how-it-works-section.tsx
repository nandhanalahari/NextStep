"use client"

import { AnimatedSection } from "@/components/animated-section"
import { cn } from "@/lib/utils"

const steps = [
  {
    number: "01",
    title: "Share Your Goal",
    description:
      "Tell NextStep what you want to achieve — career growth, learning a new skill, better habits, or anything in between.",
    visual: (
      <div className="space-y-3">
        <div className="rounded-lg border border-border bg-secondary/50 p-3">
          <p className="text-xs text-muted-foreground">Your goal</p>
          <p className="mt-1 font-display text-sm font-medium text-foreground">
            {"I want to land a software engineering internship"}
          </p>
        </div>
        <div className="flex gap-2">
          <div className="rounded-md border border-border bg-secondary/30 px-3 py-1.5 text-xs text-muted-foreground">
            Beginner
          </div>
          <div className="rounded-md border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs text-primary">
            Intermediate
          </div>
          <div className="rounded-md border border-border bg-secondary/30 px-3 py-1.5 text-xs text-muted-foreground">
            Advanced
          </div>
        </div>
      </div>
    ),
  },
  {
    number: "02",
    title: "Get Your Next Step",
    description:
      "Our AI analyzes your goal, level, and available time to pick the single most impactful action you can take right now.",
    visual: (
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          <p className="text-xs font-medium text-primary">{"Today's Next Step"}</p>
        </div>
        <p className="mt-2 font-display text-sm font-semibold text-foreground">
          Complete 2 LeetCode Easy problems on Arrays
        </p>
        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <span>30 min</span>
          <span>Medium effort</span>
          <span>High impact</span>
        </div>
      </div>
    ),
  },
  {
    number: "03",
    title: "Track & Adapt",
    description:
      "Mark steps as done or skipped. The AI recalibrates instantly — celebrating wins and adjusting when life happens.",
    visual: (
      <div className="space-y-2">
        {[
          { label: "Review resume format", done: true },
          { label: "LeetCode Arrays set", done: true },
          { label: "Draft cover letter", done: false, current: true },
        ].map((item) => (
          <div
            key={item.label}
            className={cn(
              "flex items-center gap-3 rounded-lg border p-3 text-sm",
              item.done
                ? "border-primary/20 bg-primary/5"
                : item.current
                  ? "border-primary/40 bg-primary/10"
                  : "border-border bg-secondary/30"
            )}
          >
            <div
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs",
                item.done
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-muted-foreground"
              )}
            >
              {item.done && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
            <span
              className={cn(
                item.done ? "text-muted-foreground line-through" : "text-foreground"
              )}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
    ),
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative px-6 py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 bottom-0 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <AnimatedSection className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            How It Works
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold text-foreground md:text-5xl">
            Three steps to
            <span className="text-primary"> momentum</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            No complicated setups. No 50-page planners. Just tell us your goal
            and let the AI handle the rest.
          </p>
        </AnimatedSection>

        <div className="mt-16 space-y-16 md:space-y-24">
          {steps.map((step, i) => (
            <AnimatedSection
              key={step.number}
              animation={i % 2 === 0 ? "slide-in-left" : "slide-in-right"}
              delay={100}
            >
              <div
                className={cn(
                  "flex flex-col items-center gap-8 md:flex-row md:gap-16",
                  i % 2 !== 0 && "md:flex-row-reverse"
                )}
              >
                <div className="flex-1 space-y-4">
                  <span className="font-display text-5xl font-bold text-primary/20">
                    {step.number}
                  </span>
                  <h3 className="font-display text-2xl font-bold text-foreground md:text-3xl">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
                <div className="w-full max-w-sm flex-1">
                  <div className="rounded-2xl border border-border bg-card p-6 shadow-lg shadow-primary/5">
                    {step.visual}
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}
