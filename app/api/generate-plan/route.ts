import { generateText, Output } from "ai"
import { z } from "zod"

const planSchema = z.object({
  title: z.string().describe("A concise, motivating title for the goal"),
  description: z.string().describe("A brief 1-2 sentence description of the overall goal"),
  tasks: z.array(
    z.object({
      title: z.string().describe("A clear, actionable task title"),
      description: z.string().describe("A helpful description with specific guidance on how to accomplish this task"),
    })
  ).describe("5-8 concrete, ordered micro-tasks that build toward the goal"),
})

export async function POST(req: Request) {
  const { goal } = await req.json()

  if (!goal || typeof goal !== "string") {
    return Response.json({ error: "Goal is required" }, { status: 400 })
  }

  const { output } = await generateText({
    model: "google/gemini-2.5-flash",
    output: Output.object({ schema: planSchema }),
    prompt: `You are NextStep, an AI micro-mentor that turns vague life goals into achievable action plans.

The user wants to: "${goal}"

Break this goal down into 5-8 concrete, ordered micro-tasks. Each task should be:
- Specific and actionable (can be done in 15-45 minutes)
- Ordered logically (earlier tasks build foundation for later ones)
- Motivating and clear
- Include helpful guidance in the description

Make the title motivating and the description encouraging. The tasks should feel achievable, not overwhelming.`,
  })

  return Response.json({ plan: output })
}
