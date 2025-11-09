import { type NextRequest, NextResponse } from "next/server"
import { generateObject } from "ai"
import { z } from "zod"

const quizSchema = z.object({
  title: z.string(),
  passingScore: z.number(),
  questions: z.array(
    z.object({
      question: z.string(),
      options: z.array(z.string()),
      correctAnswer: z.number(),
      explanation: z.string(),
    }),
  ),
})

interface GenerateQuizRequest {
  courseTitle: string
  courseTopic: string
  difficulty: string
  chapters: Array<{ title: string }>
}

export const runtime = "edge"

export async function POST(request: NextRequest) {
  try {
    const body: GenerateQuizRequest = await request.json()
    const { courseTitle, courseTopic, difficulty, chapters } = body

    const chapterTitles = chapters.map((c) => c.title).join(", ")

    const { object: generatedQuiz } = await generateObject({
      model: "openai/gpt-4.1-nano",
      schema: quizSchema,
      prompt: `You are an expert educator creating a comprehensive final exam. Create a final quiz for the following course:

Course: ${courseTitle}
Topic: ${courseTopic}
Difficulty: ${difficulty}
Chapters: ${chapterTitles}

Create 5-7 multiple choice questions that test the key concepts from all chapters. Questions should:
- Cover different chapters proportionally
- Test understanding, not just memorization
- Be appropriate for ${difficulty} level
- Have 4 answer options each
- Include clear explanations for correct answers

The title should be "Final Exam: ${courseTitle}"
Set passingScore to 70 for Beginner, 75 for Intermediate, and 80 for Advanced.`,
      maxOutputTokens: 2000,
      temperature: 0.7,
    })

    return NextResponse.json({
      quiz: generatedQuiz,
      success: true,
    })
  } catch (error) {
    console.error("[v0] Error generating quiz:", error)
    return NextResponse.json(
      {
        error: "Failed to generate quiz",
        success: false,
      },
      { status: 500 },
    )
  }
}
