import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"

interface GenerateChapterRequest {
  courseTitle: string
  chapterTitle: string
  difficulty: string
  hobbies: string[]
  learningStyle?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateChapterRequest = await request.json()
    const { courseTitle, chapterTitle, difficulty, hobbies, learningStyle } = body

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `You are an expert educational content creator. Generate comprehensive, engaging chapter content for an online course.

Course Title: ${courseTitle}
Chapter Title: ${chapterTitle}
Difficulty Level: ${difficulty}
Student's Interests: ${hobbies.join(", ")}
${learningStyle ? `Learning Style: ${learningStyle}` : ""}

Please create detailed chapter content that:
1. Introduces the chapter topic clearly
2. Breaks down complex concepts into digestible sections
3. Includes practical examples related to the student's interests (${hobbies.join(", ")})
4. Provides hands-on exercises or activities
5. Summarizes key takeaways
6. Suggests next steps

Format the content with clear sections and make it engaging and tailored to a ${difficulty.toLowerCase()} level learner. The content should be comprehensive and educational.`,
      maxOutputTokens: 2000,
      temperature: 0.7,
    })

    return NextResponse.json({
      content: text,
      success: true,
    })
  } catch (error) {
    console.error("[v0] Error generating chapter:", error)
    return NextResponse.json(
      {
        error: "Failed to generate chapter content",
        success: false,
      },
      { status: 500 },
    )
  }
}
