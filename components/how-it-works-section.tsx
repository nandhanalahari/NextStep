"use client";

import { AnimatedSection } from "@/components/animated-section";
import { PenLine, Sparkles, CheckCircle2 } from "lucide-react";

const steps = [
  {
    icon: PenLine,
    title: "Share your goal",
    description:
      "Tell NextStep what you want to achieve — a tech internship, a new habit, a side project, or anything else.",
  },
  {
    icon: Sparkles,
    title: "Get your plan",
    description:
      "Our AI breaks your goal into clear, actionable steps. No overwhelm — just one next step at a time.",
  },
  {
    icon: CheckCircle2,
    title: "Do and adapt",
    description:
      "Mark steps done, add your own, and track progress. The AI learns from you and keeps you moving.",
  },
];

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="relative px-6 py-24 md:py-32"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 bottom-0 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-5xl">
        <AnimatedSection className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            How It Works
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold text-foreground md:text-5xl">
            Three steps to
            <span className="text-primary"> momentum</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            NextStep turns big goals into small, doable actions so you stop
            planning and start doing.
          </p>
        </AnimatedSection>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <AnimatedSection
              key={step.title}
              animation="fade-in-up"
              delay={i * 100}
            >
              <div className="flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors hover:bg-primary/20">
                  <step.icon className="h-7 w-7" />
                </div>
                <span className="mt-4 font-display text-lg font-semibold text-foreground">
                  {step.title}
                </span>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
