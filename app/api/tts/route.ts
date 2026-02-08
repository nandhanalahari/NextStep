import { NextResponse } from "next/server"

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
// Rachel - calm, human voice for mentor mode
const VOICE_ID = "21m00Tcm4TlvDq8ikWAM"

export async function POST(req: Request) {
  const { text } = await req.json()

  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "Text is required" }, { status: 400 })
  }

  if (!ELEVENLABS_API_KEY) {
    return NextResponse.json(
      { error: "ELEVENLABS_API_KEY is not configured" },
      { status: 500 },
    )
  }

  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: "POST",
        headers: {
          Accept: "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: text.trim(),
          model_id: "eleven_multilingual_v2",
        }),
      },
    )

    if (!res.ok) {
      const err = await res.text()
      console.error("ElevenLabs API error:", res.status, err)
      return NextResponse.json(
        { error: "Failed to generate speech" },
        { status: res.status },
      )
    }

    const audioBuffer = await res.arrayBuffer()
    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
      },
    })
  } catch (err) {
    console.error("TTS error:", err)
    return NextResponse.json(
      { error: "Failed to generate speech" },
      { status: 500 },
    )
  }
}
