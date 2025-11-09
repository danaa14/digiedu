import { type NextRequest, NextResponse } from "next/server"
import { getChapterCountForDifficulty } from "@/lib/course-utils"
import OpenAI from "openai"
import { z } from "zod"

interface GenerateCourseRequest {
  topic: string
  level: string
  hobbies: string[]
  learningStyle?: string
}

// Prefer Node runtime while testing (Edge can cause issues)
export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const body: GenerateCourseRequest = await request.json()
    const { topic, level, hobbies, learningStyle } = body

    const chapterCount = getChapterCountForDifficulty(level as "Beginner" | "Intermediate" | "Advanced")

    const courseSchema = z.object({
      title: z.string(),
      description: z.string(),
      chapters: z.array(
        z.object({
          title: z.string(),
          order: z.number(),
        }),
      ),
      learningOutcomes: z.array(z.string()),
    })

    // Ensure API key is provided
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not set. Set it in your environment or .env.local file.")
      return NextResponse.json(
        { success: false, error: "OPENAI_API_KEY not set. Add it to your environment or .env.local." },
        { status: 500 },
      )
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const model = process.env.OPENAI_MODEL || "gpt-4o-mini"

    const systemPrompt = `You are an expert course designer. When you respond, return only valid JSON that matches the schema: { title: string, description: string, chapters: [{ title: string, order: number }], learningOutcomes: string[] }. Do not include any extra text or markdown.`

    const userPrompt = `Create a comprehensive course structure for the following:\n\nTopic: ${topic}\nDifficulty Level: ${level}\nNumber of Chapters: ${chapterCount}\nStudent's Interests: ${hobbies.join(", ")}\n${learningStyle ? `Learning Style: ${learningStyle}` : ""}\n\nPlease create:\n1. An engaging course title that incorporates the topic\n2. A compelling course description (2-3 sentences)\n3. ${chapterCount} chapter titles that progressively build knowledge\n4. Key learning outcomes for the entire course\n\nThe course should be tailored to a ${level.toLowerCase()} learner and incorporate their interests in ${hobbies.join(", ")} where relevant.`

    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    })

    const text = completion.choices?.[0]?.message?.content ?? ""

    // Parse JSON safely
    let parsed: any = null
    try {
      parsed = JSON.parse(text)
    } catch (err) {
      const match = text.match(/\{[\s\S]*\}/)
      if (match) {
        try {
          parsed = JSON.parse(match[0])
        } catch (err) {
          throw new Error("Model did not return valid JSON.")
        }
      } else {
        throw new Error("Model did not return valid JSON.")
      }
    }

    const result = courseSchema.parse(parsed)

    return NextResponse.json({ course: result, success: true })
  } catch (error: any) {
    console.error("[v0] Error generating course:", error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to generate course",
        stack: process.env.NODE_ENV === "development" ? error?.stack : undefined,
      },
      { status: 500 },
    )
  }
}
