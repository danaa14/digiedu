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
          content: z.string().optional(), // Make content optional to match the Course type
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

    console.log("[v0] Sending prompts to OpenAI:", {
      systemPrompt,
      userPrompt,
      model,
    });

    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 3000,  // Increased token limit for more content
    })

    const text = completion.choices?.[0]?.message?.content ?? ""
    console.log("[v0] Raw OpenAI response:", text);

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

    // Debug log the generated course structure
    console.log("[v0] Generated course structure:", JSON.stringify(result, null, 2));
    console.log("[v0] Chapters content lengths:", result.chapters.map(ch => ({
      title: ch.title,
      contentLength: ch.content?.length || 0,
      hasMarkdown: ch.content?.includes("##") || false
    })));

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
