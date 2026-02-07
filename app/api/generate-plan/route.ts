import { GoogleGenAI } from "@google/genai"

const planJsonSchema = {
  type: "object",
  properties: {
    title: {
      type: "string",
      description: "A concise, motivating title for the goal",
    },
    description: {
      type: "string",
      description: "A brief 1-2 sentence description of the overall goal",
    },
    tasks: {
      type: "array",
      description: "5-8 concrete, ordered micro-tasks that build toward the goal",
      items: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "A clear, actionable task title",
          },
          description: {
            type: "string",
            description: "A helpful description with specific guidance on how to accomplish this task",
          },
        },
        required: ["title", "description"],
      },
    },
  },
  required: ["title", "description", "tasks"],
} as const

export async function POST(req: Request) {
  const { goal } = await req.json()

  if (!goal || typeof goal !== "string") {
    return Response.json({ error: "Goal is required" }, { status: 400 })
  }

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  if (!apiKey) {
    return Response.json(
      {
        error:
          "Gemini API key not configured. Add GOOGLE_GENERATIVE_AI_API_KEY to .env.local. Get a free key at https://aistudio.google.com/apikey",
      },
      { status: 503 }
    )
  }

  try {
    const ai = new GoogleGenAI({ apiKey })

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are NextStep, an AI micro-mentor that turns vague life goals into achievable action plans.

The user wants to: "${goal}"

Break this goal down into 5-8 concrete, ordered micro-tasks. Each task should be:
- Specific and actionable (can be done in 15-45 minutes)
- Ordered logically (earlier tasks build foundation for later ones)
- Motivating and clear
- Include helpful guidance in the description

Make the title motivating and the description encouraging. The tasks should feel achievable, not overwhelming.

Respond with a single JSON object only (no markdown, no code fence), with keys: title, description, tasks (array of { title, description }).`,
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: planJsonSchema,
      },
    })

    const text = response.text
    if (!text || typeof text !== "string") {
      throw new Error("No text in model response")
    }

    const plan = JSON.parse(text) as {
      title: string
      description: string
      tasks: { title: string; description: string }[]
    }

    if (!plan.title || !plan.description || !Array.isArray(plan.tasks)) {
      throw new Error("Invalid plan shape from model")
    }

    return Response.json({ plan })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("Generate plan error:", err)
    return Response.json(
      {
        error:
          message ||
          "Failed to generate plan. Check your API key and try again.",
      },
      { status: 500 }
    )
  }
}
