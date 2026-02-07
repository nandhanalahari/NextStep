"use client"

import { AnimatedSection } from "@/components/animated-section"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Sarah K.",
    role: "Computer Science Student",
    quote:
      "I went from 'I should learn DSA someday' to solving 3 problems a day. NextStep made it feel effortless.",
    stars: 5,
  },
  {
    name: "Marcus T.",
    role: "Career Changer",
    quote:
      "I was paralyzed by the thought of switching to tech. NextStep gave me exactly one thing to do each day. Now I have a job offer.",
    stars: 5,
  },
  {
    name: "Priya R.",
    role: "Graduate Student",
    quote:
      "The mood check-in is genius. On tough days it gives me lighter tasks. On good days it pushes me. It actually gets me.",
    stars: 5,
  },
]

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="relative px-6 py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-1/4 top-1/2 h-[300px] w-[300px] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <AnimatedSection className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Testimonials
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold text-foreground md:text-5xl">
            Loved by goal-setters
            <span className="text-primary"> everywhere</span>
          </h2>
        </AnimatedSection>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <AnimatedSection key={t.name} animation="fade-in-up" delay={i * 150}>
              <div className="group h-full rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30">
                <div className="flex gap-1">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star
                      key={`star-${t.name}-${j}`}
                      className="h-4 w-4 fill-primary text-primary"
                    />
                  ))}
                </div>
                <blockquote className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {`"${t.quote}"`}
                </blockquote>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-display text-sm font-bold text-primary">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {t.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
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
