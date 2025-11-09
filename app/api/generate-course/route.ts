import { type NextRequest, NextResponse } from "next/server"
import { getChapterCountForDifficulty } from "@/lib/course-utils"
import { generateObject } from "ai"
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

    const { object: generatedCourse } = await generateObject({
      model: "openai/gpt-4.1-nano",
      schema: courseSchema,
      prompt: `You are an expert course designer. Create a comprehensive course structure for the following:

Topic: ${topic}
Difficulty Level: ${level}
Number of Chapters: ${chapterCount}
Student's Interests: ${hobbies.join(", ")}
${learningStyle ? `Learning Style: ${learningStyle}` : ""}

Please create:
1. An engaging course title that incorporates the topic
2. A compelling course description (2-3 sentences)
3. ${chapterCount} chapter titles that progressively build knowledge
4. Key learning outcomes for the entire course

The course should be tailored to a ${level.toLowerCase()} learner and incorporate their interests in ${hobbies.join(", ")} where relevant.`,
      maxOutputTokens: 1500,
      temperature: 0.7,
    })

    return NextResponse.json({
      course: generatedCourse,
      success: true,
    })
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
