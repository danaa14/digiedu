import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

interface GenerateChapterRequest {
  courseTitle: string
  chapterTitle: string
  difficulty: string
  hobbies: string[]
  learningStyle?: string
}

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const body: GenerateChapterRequest = await request.json()
    const { courseTitle, chapterTitle, difficulty, hobbies, learningStyle } = body

    // Ensure API key is provided
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not set. Set it in your environment or .env.local file.")
      return NextResponse.json(
        { success: false, error: "OPENAI_API_KEY not set. Add it to your environment or .env.local." },
        { status: 500 },
      )
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const model = process.env.OPENAI_MODEL || "gpt-3.5-turbo"

    const systemPrompt = `You are an expert educational content creator specializing in creating engaging, practical, and comprehensive learning materials. Your content should be well-structured, easy to follow, and tailored to the student's level and interests. Use proper Markdown formatting with headers (##, ###), lists, and code blocks where appropriate.`

    const userPrompt = `Create detailed, practical content for this chapter that engages ${difficulty.toLowerCase()}-level learners interested in ${hobbies.join(", ")}.

Course: ${courseTitle}
Chapter: ${chapterTitle}
Learning Style: ${learningStyle || "Mixed"}

Structure the content as follows:

## Chapter Overview
[Brief introduction and learning objectives]

## Key Concepts
[Detailed explanations with real-world examples]

## Practical Examples
[3-4 examples connecting the topic to ${hobbies.join(" or ")}]

## Hands-on Practice
[2-3 exercises with clear instructions and expected outcomes]

## Common Challenges and Solutions
[Address typical stumbling points with clear solutions]

## Real-World Applications
[How this knowledge applies to ${hobbies.join(" and ")}]

## Key Takeaways
[Bullet-point summary of main concepts]

## Additional Resources
[Suggested further reading or practice]

Guidelines:
- Write at least 1000 words of meaningful content
- Include code examples if relevant
- Use analogies related to the student's interests
- Break down complex concepts into digestible parts
- Provide clear, step-by-step instructions for exercises
- Include tips and best practices throughout
- Use proper Markdown formatting`

    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 3000,
    })

    const content = completion.choices?.[0]?.message?.content ?? ""

    // Debug log
    console.log("[v0] Generated chapter content length:", content.length)

    return NextResponse.json({
      content,
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
