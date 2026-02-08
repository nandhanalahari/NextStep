"use client";

import { AnimatedSection } from "@/components/animated-section";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is NextStep?",
    answer:
      "NextStep is an AI-powered goal companion that breaks your big aspirations into one actionable step at a time. Instead of overwhelming roadmaps, you get a single, perfectly chosen next action tailored to your level, mood, and available time.",
  },
  {
    question: "How does the AI choose my next step?",
    answer:
      "Our AI considers your goal, your current skill level, your recent mood check-ins, and how much time you have today. It picks the single most impactful action you can take right now — usually 15 to 45 minutes — that moves you forward without burning you out.",
  },
  {
    question: "How much time do I need?",
    answer:
      "As little as 15 minutes. NextStep adapts to your actual schedule. Got a busy day? You'll get a quick, high-impact task. Have more time? The AI will suggest something deeper. There's no fixed commitment.",
  },
  {
    question: "Who is NextStep for?",
    answer:
      "Anyone with a goal they're serious about: students learning DSA, career changers breaking into tech, professionals building new skills, or anyone who's tired of planning and wants to start doing. If you've ever felt paralyzed by where to begin, NextStep is for you.",
  },
  {
    question: "Can I skip or change a step?",
    answer:
      "Yes. Mark steps as done or skipped — the AI recalibrates instantly. Life happens. NextStep learns from it and adjusts your path accordingly, celebrating wins and adapting when you need to pivot.",
  },
];

export function FaqSection() {
  return (
    <section
      id="faq"
      className="relative px-6 -mt-8 pt-8 pb-24 md:-mt-12 md:pt-12 md:pb-32"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-1/4 top-1/2 h-[300px] w-[300px] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-3xl">
        <AnimatedSection className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            FAQ
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold text-foreground md:text-5xl">
            Common questions
            <span className="text-primary"> answered</span>
          </h2>
        </AnimatedSection>

        <AnimatedSection animation="fade-in-up" delay={100} className="mt-16">
          <Accordion type="single" collapsible className="space-y-0">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={faq.question}
                value={`item-${i}`}
                className="border-border px-4 py-2 first:rounded-t-xl last:rounded-b-xl even:bg-muted/30"
              >
                <AccordionTrigger className="text-left text-base font-medium text-foreground hover:no-underline hover:text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </AnimatedSection>
      </div>
    </section>
  );
}
