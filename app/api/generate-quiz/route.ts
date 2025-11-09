import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
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

// Use nodejs runtime for the OpenAI SDK
export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const body: GenerateQuizRequest = await request.json()
    const { courseTitle, courseTopic, difficulty, chapters } = body

    const chapterTitles = chapters.map((c) => c.title).join(", ")

    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY not set for quiz generation")
      return NextResponse.json({ success: false, error: "OPENAI_API_KEY not set" }, { status: 500 })
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini"

    const systemPrompt = `You are an expert educator. Return only valid JSON matching the schema: { title: string, passingScore: number, questions: [{ question: string, options: string[], correctAnswer: number, explanation: string }] }`

    const userPrompt = `Create a final quiz for the following course:\n\nCourse: ${courseTitle}\nTopic: ${courseTopic}\nDifficulty: ${difficulty}\nChapters: ${chapterTitles}\n\nCreate 5-7 multiple choice questions that test the key concepts from all chapters. Questions should:\n- Cover different chapters proportionally\n- Test understanding, not just memorization\n- Be appropriate for ${difficulty} level\n- Have 4 answer options each\n- Include clear explanations for correct answers\n\nThe title should be "Final Exam: ${courseTitle}"\nSet passingScore to 70 for Beginner, 75 for Intermediate, and 80 for Advanced.`

    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })

    const text = completion.choices?.[0]?.message?.content ?? ""

    let parsed: any = null
    try {
      parsed = JSON.parse(text)
    } catch (err) {
      const match = text.match(/\{[\s\S]*\}/)
      if (match) {
        try {
          parsed = JSON.parse(match[0])
        } catch (err) {
          throw new Error("Model did not return valid JSON for quiz generation")
        }
      } else {
        throw new Error("Model did not return valid JSON for quiz generation")
      }
    }

    const result = quizSchema.parse(parsed)

    return NextResponse.json({ quiz: result, success: true })
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
