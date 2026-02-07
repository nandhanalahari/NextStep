"use client"

import { AnimatedSection } from "@/components/animated-section"
import { Brain, Target, Zap, Heart, Clock, TrendingUp } from "lucide-react"

const features = [
  {
    icon: Brain,
    title: "AI Goal Decomposition",
    description:
      "Gemini-powered intelligence breaks complex goals into clear, actionable micro-tasks you can start right now.",
  },
  {
    icon: Target,
    title: "One Step at a Time",
    description:
      "No overwhelming roadmaps. Just one perfectly chosen next action — 15 to 45 minutes — tailored to your level.",
  },
  {
    icon: Zap,
    title: "Adaptive Difficulty",
    description:
      "Feeling burnt out? The AI senses it and dials back. On fire? It pushes you further. It learns your rhythm.",
  },
  {
    icon: Heart,
    title: "Mood-Aware Mentoring",
    description:
      "Quick daily check-ins let the AI understand your energy and emotional state for truly personalized guidance.",
  },
  {
    icon: Clock,
    title: "Time-Flexible Planning",
    description:
      "Got 15 minutes or 2 hours? NextStep adapts to your actual availability, not an ideal schedule.",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description:
      "Visual streaks, completion rates, and milestone celebrations keep you motivated on the path to success.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="relative px-6 py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-0 top-0 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <AnimatedSection className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Features
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold text-foreground md:text-5xl">
            Everything you need to reach
            <br className="hidden md:block" />
            <span className="text-primary"> new heights</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            NextStep combines cutting-edge AI with proven behavioral science to
            create a mentor that actually understands you.
          </p>
        </AnimatedSection>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <AnimatedSection
              key={feature.title}
              animation="scale-in"
              delay={i * 100}
            >
              <div className="group relative h-full rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:bg-secondary/50">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}
