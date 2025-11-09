import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"

export async function POST(request: NextRequest) {
  try {
    const { word } = await request.json()

    if (!word) {
      return NextResponse.json({ success: false, error: "Word is required" }, { status: 400 })
    }

    console.log("[v0] Generating explanation for word:", word)

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `You are a helpful educational assistant. Provide a clear, concise explanation of the word or term "${word}" in 2-3 sentences. Focus on the most common or relevant meaning in an educational context. Keep it simple and easy to understand.`,
    })

    console.log("[v0] Generated explanation:", text)

    return NextResponse.json({
      success: true,
      explanation: text.trim(),
    })
  } catch (error) {
    console.error("[v0] Error generating explanation:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate explanation",
      },
      { status: 500 },
    )
  }
}
