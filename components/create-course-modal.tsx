"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { CourseFormData, DifficultyLevel, LearningStyle, Course } from "@/lib/types"
import { hobbies } from "@/lib/hobbies"
import { Loader2, Sparkles } from "lucide-react"
import { getChapterCountForDifficulty } from "@/lib/course-utils"

interface CreateCourseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCourseCreated: (course: Course) => void
}

const difficultyInfo: Record<DifficultyLevel, string> = {
  Beginner: "No prior knowledge required.",
  Intermediate: "Some experience recommended.",
  Advanced: "Strong foundational knowledge required.",
}

export function CreateCourseModal({ open, onOpenChange, onCourseCreated }: CreateCourseModalProps) {
  const [formData, setFormData] = useState<CourseFormData>({
    topic: "",
    level: "Beginner",
    hobbies: [],
    learningStyle: undefined,
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedCourse, setGeneratedCourse] = useState<Course | null>(null)

  const handleHobbyToggle = (hobby: string) => {
    setFormData((prev) => ({
      ...prev,
      hobbies: prev.hobbies.includes(hobby) ? prev.hobbies.filter((h) => h !== hobby) : [...prev.hobbies, hobby],
    }))
  }

  const generateCourse = async () => {
  setIsGenerating(true)
  console.log("[v0] Generating course with data:", formData)

  try {
    const response = await fetch("/api/generate-course", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })

    // check if the server responded OK
    if (!response.ok) {
      const text = await response.text()
      console.error("[v0] Server responded with non-OK status:", response.status, text)
      alert(`Server error (${response.status}). Check the console for details.`)
      return
    }

    const data = await response.json()
    console.log("[v0] API response:", data)

    // ✅ more robust handling of API success/error
    if (data?.success && data.course) {
      const aiCourse = data.course

      console.log("[v0] Raw API chapters:", aiCourse.chapters);
      
      const chapters = (aiCourse.chapters || []).map((ch: any, idx: number) => {
        console.log(`[v0] Processing chapter ${idx + 1}:`, ch);
        
        // If we get a string instead of an object, create a template chapter
        if (typeof ch === "string") {
          console.log(`[v0] Chapter ${idx + 1} is string:`, ch);
          return {
            id: `chapter-${idx + 1}`,
            title: ch,
            content: "Content will be generated when you open this chapter.",
            order: idx + 1,
            isCompleted: false,
          };
        }
        
        // Otherwise use the chapter object from the API
        const chapter = {
          id: `chapter-${idx + 1}`,
          title: ch.title,
          content: ch.content || "Content will be generated when you open this chapter.",
          order: ch.order || idx + 1,
          isCompleted: false,
        };
        
        console.log(`[v0] Processed chapter ${idx + 1}:`, chapter);
        return chapter;
      })

      const mockGenerated: Course = {
        id: Date.now().toString(),
        title: aiCourse.title || "Untitled Course",
        description: aiCourse.description || "No description available.",
        difficulty: formData.level,
        progress: 0,
        modules: [],
        requirements: difficultyInfo[formData.level],
        createdAt: new Date(),
        hobbies: formData.hobbies,
        learningStyle: formData.learningStyle,
        chapters,
      }

      console.log("[v0] Generated course:", mockGenerated)
      setGeneratedCourse(mockGenerated)
    } else {
      console.error("[v0] API returned error object:", data)
      alert(data.error || "Course generation failed. Check your API route or key.")
    }
  } catch (error) {
    console.error("[v0] Exception while generating course:", error)
    alert(`Failed to generate course. Error: ${error instanceof Error ? error.message : String(error)}`)
  } finally {
    setIsGenerating(false)
  }
}


  const handleSaveCourse = () => {
    if (generatedCourse) {
      console.log("[v0] Saving course:", generatedCourse)
      onCourseCreated(generatedCourse)
      onOpenChange(false)
      setFormData({
        topic: "",
        level: "Beginner",
        hobbies: [],
        learningStyle: undefined,
      })
      setGeneratedCourse(null)
    }
  }

  const getDifficultyDescription = (level: DifficultyLevel) => {
    const chapterCount = getChapterCountForDifficulty(level)
    return `${difficultyInfo[level]} ${chapterCount} chapters.`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {generatedCourse ? "Your AI-Generated Course" : "Create New Course"}
          </DialogTitle>
        </DialogHeader>

        {!generatedCourse ? (
          <div className="space-y-6 py-4">
            {/* Topic Input */}
            <div className="space-y-2">
              <Label htmlFor="topic" className="text-base font-semibold">
                What do you want to learn or achieve?
              </Label>
              <Input
                id="topic"
                placeholder="e.g., Web development, Photography, Spanish language..."
                value={formData.topic}
                onChange={(e) => setFormData((prev) => ({ ...prev, topic: e.target.value }))}
                className="h-12 text-base"
              />
            </div>

            {/* Difficulty Level */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Difficulty Level</Label>
              <RadioGroup
                value={formData.level}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, level: value as DifficultyLevel }))}
                className="space-y-3"
              >
                {(["Beginner", "Intermediate", "Advanced"] as DifficultyLevel[]).map((level) => (
                  <div
                    key={level}
                    className="flex items-start space-x-3 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                  >
                    <RadioGroupItem value={level} id={level} className="mt-0.5" />
                    <div className="flex-1">
                      <Label htmlFor={level} className="font-semibold cursor-pointer">
                        {level}
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">{getDifficultyDescription(level)}</p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Hobbies Checklist */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Select Your Hobbies (Choose multiple)</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {hobbies.map((hobby) => (
                  <div
                    key={hobby.label}
                    className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => handleHobbyToggle(hobby.label)}
                  >
                    <Checkbox
                      id={hobby.label}
                      checked={formData.hobbies.includes(hobby.label)}
                      onCheckedChange={() => handleHobbyToggle(hobby.label)}
                    />
                    <Label htmlFor={hobby.label} className="cursor-pointer flex items-center gap-2 flex-1">
                      <span>{hobby.emoji}</span>
                      <span className="text-sm">{hobby.label}</span>
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Learning Style */}
            <div className="space-y-2">
              <Label htmlFor="learning-style" className="text-base font-semibold">
                Preferred Learning Style (Optional)
              </Label>
              <Select
                value={formData.learningStyle}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, learningStyle: value as LearningStyle }))}
              >
                <SelectTrigger id="learning-style" className="h-12">
                  <SelectValue placeholder="Select a learning style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Visual">Visual</SelectItem>
                  <SelectItem value="Practical / Hands-on">Practical / Hands-on</SelectItem>
                  <SelectItem value="Theoretical">Theoretical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Generate Button */}
            <Button
              onClick={generateCourse}
              disabled={!formData.topic || formData.hobbies.length === 0 || isGenerating}
              className="w-full h-12 text-base"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Your Course...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate My Custom Course
                </>
              )}
            </Button>
          </div>
        ) : (
          /* Course Preview */
          <div className="space-y-6 py-4">
            <div className="p-6 bg-accent/50 rounded-lg space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-2">{generatedCourse.title}</h3>
                <p className="text-muted-foreground text-pretty">{generatedCourse.description}</p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2">
                  Course Chapters: {generatedCourse.chapters?.length || 0}
                </h4>
                <ul className="space-y-2">
                  {generatedCourse.chapters?.map((chapter, idx) => (
                    <li key={chapter.id} className="flex items-start gap-2">
                      <span className="font-semibold text-primary">{idx + 1}.</span>
                      <span className="text-foreground">{chapter.title}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-1">Requirements:</h4>
                <p className="text-sm text-muted-foreground">{generatedCourse.requirements}</p>
              </div>

              {generatedCourse.hobbies.length > 0 && (
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Tailored to your interests:</h4>
                  <div className="flex flex-wrap gap-2">
                    {generatedCourse.hobbies.map((hobby) => {
                      const hobbyData = hobbies.find((h) => h.label === hobby)
                      return (
                        <span key={hobby} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                          {hobbyData?.emoji} {hobby}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setGeneratedCourse(null)} className="flex-1">
                Regenerate
              </Button>
              <Button onClick={handleSaveCourse} className="flex-1">
                Save Course
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
