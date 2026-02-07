"use client"

import { AnimatedSection } from "@/components/animated-section"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CtaSection() {
  return (
    <section className="relative px-6 py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[140px]" />
      </div>

      <AnimatedSection className="relative mx-auto max-w-3xl">
        <div className="rounded-2xl border border-primary/20 bg-card p-10 text-center md:p-16">
          <h2 className="font-display text-3xl font-bold text-foreground md:text-5xl">
            Ready to take your
            <br />
            <span className="text-primary">next step?</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Join thousands who stopped overthinking and started doing. Your AI
            mentor is ready — and your first step is just one click away.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="group animate-pulse-glow bg-primary px-8 text-primary-foreground hover:bg-primary/90"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <p className="text-xs text-muted-foreground">
              No credit card required
            </p>
          </div>
        </div>
      </AnimatedSection>
    </section>
  )
}
