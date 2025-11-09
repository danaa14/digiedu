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

// Schema for course validation
const courseSchema = z.object({
  title: z.string(),
  description: z.string(),
  chapters: z.array(
    z.object({
      title: z.string(),
      order: z.number(),
      content: z.string(),
    })
  ),
  learningOutcomes: z.array(z.string()),
})

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: GenerateCourseRequest = await request.json()
    const { topic, level, hobbies, learningStyle } = body

    // Get chapter count based on difficulty
    const chapterCount = getChapterCountForDifficulty(level as "Beginner" | "Intermediate" | "Advanced")

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

    const systemPrompt = `You are an expert course designer specializing in creating engaging educational content. Generate a complete course structure with detailed chapter content.

Your response must be valid JSON matching this schema:
{
  "title": "string (an engaging course title)",
  "description": "string (2-3 sentences about the course)",
  "chapters": [{
    "title": "string (clear chapter title)",
    "order": number (starting from 1),
    "content": "string (REQUIRED - Write at least 500 words of actual chapter content including explanations, examples, and exercises. Use markdown formatting with ## for headings)"
  }],
  "learningOutcomes": ["string (specific outcomes)"]
}

Each chapter's content must include:
- A proper introduction
- Detailed explanations
- Code examples where relevant
- Practical exercises
- Key takeaways

Use markdown formatting with ## headers. Do not include any text outside the JSON structure.`

    const userPrompt = `Create a comprehensive course with detailed chapter content for:

Topic: ${topic}
Difficulty: ${level}
Chapters: ${chapterCount}
Interests: ${hobbies.join(", ")}
${learningStyle ? `Learning Style: ${learningStyle}` : ""}

Requirements:
1. Course Title: Create an engaging title that includes "${topic}"
2. Description: Write 2-3 compelling sentences about the course
3. Chapters: Create ${chapterCount} detailed chapters that build progressively
4. Learning Outcomes: List specific, measurable outcomes

For EACH chapter, you MUST include:
1. Title: Clear, action-oriented title
2. Content: At least 500 words with:
   - ## Introduction (brief overview)
   - ## Key Concepts (main teaching points)
   - ## Examples (practical demonstrations)
   - ## Exercises (hands-on practice)
   - ## Summary (key takeaways)

Important:
- Target the content for ${level.toLowerCase()} level learners
- Include examples related to ${hobbies.join(" and ")}
- Use proper markdown formatting with ## headers
- Provide actual content, not placeholders
- Include code examples where relevant
- Make it engaging and practical

Remember: Generate COMPLETE chapter content, not just descriptions.`

    console.log("[v0] Generating course content using", model)

    const completion = await client.chat.completions.create({
      model: "gpt-3.5-turbo-16k",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 4000,
      presence_penalty: 0.3,
      frequency_penalty: 0.3
    })

    const text = completion.choices?.[0]?.message?.content ?? ""
    console.log("[v0] Received response length:", text.length)
    
    // Parse JSON
    let parsed: any
    try {
      parsed = JSON.parse(text)
      console.log("[v0] Successfully parsed JSON")
    } catch (error) {
      console.error("[v0] Failed to parse JSON directly:", error)
      
      // Try to extract JSON from text
      const match = text.match(/\{[\s\S]*\}/)
      if (!match) {
        console.error("[v0] No JSON found in:", text)
        throw new Error("No JSON found in response")
      }

      try {
        parsed = JSON.parse(match[0])
        console.log("[v0] Successfully parsed extracted JSON")
      } catch (extractError) {
        console.error("[v0] Failed to parse extracted JSON:", extractError)
        throw new Error("Invalid JSON in response")
      }
    }

    // Validate response
    const result = courseSchema.parse(parsed)
    console.log("[v0] Validated response schema")

    // Validate chapter content
    const validationErrors: string[] = [];
    result.chapters.forEach((chapter, idx) => {
      if (!chapter.content || chapter.content.length < 100) {
        validationErrors.push(`Chapter ${idx + 1} "${chapter.title}" has insufficient content (${chapter.content?.length || 0} chars)`);
      }
      if (!chapter.content?.includes("##")) {
        validationErrors.push(`Chapter ${idx + 1} "${chapter.title}" is missing markdown headers`);
      }
    });

    if (validationErrors.length > 0) {
      console.error("[v0] Content validation failed:", validationErrors);
      throw new Error("Generated content did not meet requirements: " + validationErrors.join(", "));
    }

    // Log success details
    console.log("[v0] Generated course:", {
      title: result.title,
      chaptersCount: result.chapters.length,
      contentLengths: result.chapters.map(ch => ch.content.length)
    });

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
