"use client"

import { useState, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import { useParams, useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { AuthGuard } from "@/components/auth-guard"
import { getCourseById, saveCourse } from "@/lib/data"
import { generateChapterTemplates } from "@/lib/course-utils"
import type { Course, Chapter, Quiz } from "@/lib/types"
import { ArrowLeft, BookOpen, CheckCircle2, Circle, Sparkles, Loader2, Award, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"
import { QuizModal } from "@/components/quiz-modal"
import { WordSelector } from "@/components/word-selector" 

function CourseDetailContent() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string

  const [course, setCourse] = useState<Course | null>(null)
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null)
  const [isGeneratingContent, setIsGeneratingContent] = useState(false)
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false)
  const [showQuizModal, setShowQuizModal] = useState(false)

  useEffect(() => {
    console.log("[v0] Loading course with ID:", courseId)
    const foundCourse = getCourseById(courseId)

    if (foundCourse) {
      console.log("[v0] Course found:", foundCourse.title);
      console.log("[v0] Course chapters:", foundCourse.chapters);
      
      if (!foundCourse.chapters?.length) {
        console.log("[v0] No chapters found, generating templates");
        const chapters = generateChapterTemplates(
          foundCourse.title.replace(" Course", ""),
          foundCourse.difficulty,
          foundCourse.hobbies,
        )
        foundCourse.chapters = chapters
        saveCourse(foundCourse)
      }
      
      console.log("[v0] Setting course with chapters:", foundCourse.chapters);
      setCourse(foundCourse)
      if (foundCourse.chapters && foundCourse.chapters.length > 0) {
        console.log("[v0] Setting current chapter:", foundCourse.chapters[0]);
        setCurrentChapter(foundCourse.chapters[0])
      }
    } else {
      console.log("[v0] Course not found, redirecting to dashboard")
      router.push("/")
    }
  }, [courseId, router])

  const handleGenerateContent = async (chapterId: string) => {
    if (!course || !currentChapter) return

    setIsGeneratingContent(true)

    try {
      const response = await fetch("/api/generate-chapter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseTitle: course.title,
          chapterTitle: currentChapter.title,
          difficulty: course.difficulty,
          hobbies: course.hobbies,
          learningStyle: course.learningStyle,
        }),
      })

      const data = await response.json()

      if (data.success) {
        const updatedChapters = course.chapters?.map((ch) =>
          ch.id === chapterId ? { ...ch, content: data.content } : ch,
        )
        const updatedCourse = { ...course, chapters: updatedChapters }
        setCourse(updatedCourse)
        setCurrentChapter({ ...currentChapter, content: data.content })
        saveCourse(updatedCourse)
      } else {
        alert("Failed to generate content. Please try again.")
      }
    } catch (error) {
      console.error("[v0] Error generating chapter content:", error)
      alert("An error occurred while generating content.")
    } finally {
      setIsGeneratingContent(false)
    }
  }

  const handleCompleteChapter = (chapterId: string) => {
    if (!course) return

    const updatedChapters = course.chapters?.map((ch) => (ch.id === chapterId ? { ...ch, isCompleted: true } : ch))

    const completedCount = updatedChapters?.filter((ch) => ch.isCompleted).length || 0
    const totalChapters = updatedChapters?.length || 1
    const newProgress = Math.round((completedCount / totalChapters) * 100)

    const updatedCourse = { ...course, chapters: updatedChapters, progress: newProgress }
    setCourse(updatedCourse)
    saveCourse(updatedCourse)
  }

  const handleGenerateQuiz = async () => {
    if (!course) return

    setIsGeneratingQuiz(true)

    try {
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseTitle: course.title,
          courseTopic: course.title.replace(" Course", ""),
          difficulty: course.difficulty,
          chapters: course.chapters || [],
        }),
      })

      const data = await response.json()

      if (data.success) {
        const quiz: Quiz = {
          id: `quiz-${course.id}`,
          courseId: course.id,
          title: data.quiz.title,
          questions: data.quiz.questions.map((q: any, idx: number) => ({
            id: `q-${idx}`,
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
          })),
          passingScore: data.quiz.passingScore,
        }

        const updatedCourse = { ...course, quiz }
        setCourse(updatedCourse)
        saveCourse(updatedCourse)
        setShowQuizModal(true)
      } else {
        alert("Failed to generate quiz. Please try again.")
      }
    } catch (error) {
      console.error("[v0] Error generating quiz:", error)
      alert("An error occurred while generating the quiz.")
    } finally {
      setIsGeneratingQuiz(false)
    }
  }

  const handleQuizComplete = (passed: boolean, score: number) => {
    if (!course) return

    if (passed) {
      const updatedCourse = { ...course, badgeEarned: true }
      setCourse(updatedCourse)
      saveCourse(updatedCourse)
    }
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const difficultyColors = {
    Beginner: "bg-green-500/10 text-green-700 border-green-500/20",
    Intermediate: "bg-blue-500/10 text-blue-700 border-blue-500/20",
    Advanced: "bg-purple-500/10 text-purple-700 border-purple-500/20",
  }

  const allChaptersCompleted = course.chapters?.every((ch) => ch.isCompleted) || false

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <Button variant="ghost" onClick={() => router.push("/")} className="mb-6 gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-4xl font-bold text-foreground text-balance">{course.title}</h1>
            <Badge className={cn("border", difficultyColors[course.difficulty])}>{course.difficulty}</Badge>
            {course.badgeEarned && (
              <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20 border gap-1">
                <Trophy className="w-3 h-3" />
                Badge Earned
              </Badge>
            )}
          </div>
          <p className="text-lg text-muted-foreground text-pretty mb-4">{course.description}</p>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Overall Progress</span>
              <span className="text-sm font-semibold text-primary">{course.progress}%</span>
            </div>
            <Progress value={course.progress} className="h-3" />
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Card className="p-4 sticky top-24">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Chapters ({course.chapters?.length || 0})
              </h3>
              <div className="space-y-2">
                {course.chapters?.map((chapter) => (
                  <button
                    key={chapter.id}
                    onClick={() => setCurrentChapter(chapter)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg transition-colors flex items-start gap-3",
                      currentChapter?.id === chapter.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent text-foreground",
                    )}
                  >
                    {chapter.isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                      <div className="text-xs opacity-80 mb-1">Chapter {chapter.order}</div>
                      <div className="text-sm font-medium">{chapter.title}</div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Final Test
                </h3>
                {!course.quiz ? (
                  <Button
                    onClick={handleGenerateQuiz}
                    disabled={isGeneratingQuiz || !allChaptersCompleted}
                    className="w-full gap-2 bg-transparent"
                    variant="outline"
                  >
                    {isGeneratingQuiz ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating Quiz...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate Quiz
                      </>
                    )}
                  </Button>
                ) : (
                  <Button onClick={() => setShowQuizModal(true)} className="w-full gap-2" variant="outline">
                    <Award className="w-4 h-4" />
                    {course.badgeEarned ? "Retake Quiz" : "Take Quiz"}
                  </Button>
                )}
                {!allChaptersCompleted && !course.quiz && (
                  <p className="text-xs text-muted-foreground mt-2 text-center">Complete all chapters to unlock</p>
                )}
                {course.badgeEarned && (
                  <div className="mt-3 p-2 bg-yellow-500/10 rounded-lg text-center">
                    <Trophy className="w-6 h-6 mx-auto mb-1 text-yellow-600" />
                    <p className="text-xs text-yellow-700 font-medium">Badge Earned!</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card className="p-8">
              {currentChapter && (
                <div>
                  <div className="mb-6">
                    <div className="text-sm text-muted-foreground mb-2">Chapter {currentChapter.order}</div>
                    <h2 className="text-3xl font-bold text-foreground mb-4">{currentChapter.title}</h2>
                  </div>

                  {currentChapter.content.includes("[Content will be generated by ChatGPT API") && (
                    <div className="bg-accent/50 border border-border rounded-lg p-6 mb-6 text-center">
                      <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">Generate AI-Powered Content</h3>
                      <p className="text-muted-foreground mb-4 text-pretty">
                        Click below to generate personalized chapter content using ChatGPT API
                      </p>
                      <Button
                        onClick={() => handleGenerateContent(currentChapter.id)}
                        disabled={isGeneratingContent}
                        size="lg"
                        className="gap-2"
                      >
                        {isGeneratingContent ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Generating Content...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5" />
                            Generate Chapter Content
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  <div className="mb-8">
                    <WordSelector content={currentChapter.content} chapterId={currentChapter.id} courseId={course.id} />
                  </div>

                  <div className="flex gap-3 pt-6 border-t border-border">
                    {!currentChapter.isCompleted && (
                      <Button
                        onClick={() => handleCompleteChapter(currentChapter.id)}
                        className="gap-2"
                        disabled={currentChapter.content.includes("[Content will be generated by ChatGPT API")}
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        Mark as Complete
                      </Button>
                    )}
                    {currentChapter.isCompleted && (
                      <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/20 px-4 py-2">
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Completed
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>

      {course.quiz && (
        <QuizModal
          open={showQuizModal}
          onOpenChange={setShowQuizModal}
          quiz={course.quiz}
          onComplete={handleQuizComplete}
        />
      )}
    </div>
  )
}

export default function CourseDetailPage() {
  return (
    <AuthGuard>
      <CourseDetailContent />
    </AuthGuard>
  )
}
