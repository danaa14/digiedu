"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { Course, DifficultyLevel } from "@/lib/types"
import { Trash2, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

interface CourseCardProps {
  course: Course
  onDelete: (id: string) => void
  onContinue: (id: string) => void
}

const difficultyConfig: Record<DifficultyLevel, { color: string; requirement: string }> = {
  Beginner: {
    color: "bg-green-500/10 text-green-700 border-green-500/20",
    requirement: "No prior knowledge required.",
  },
  Intermediate: {
    color: "bg-blue-500/10 text-blue-700 border-blue-500/20",
    requirement: "Some experience recommended.",
  },
  Advanced: {
    color: "bg-purple-500/10 text-purple-700 border-purple-500/20",
    requirement: "Strong foundational knowledge required.",
  },
}

export function CourseCard({ course, onDelete, onContinue }: CourseCardProps) {
  const config = difficultyConfig[course.difficulty]

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow duration-200 flex flex-col h-full">
      <div className="flex items-start justify-between mb-3">
        <Badge className={cn("border", config.color)}>{course.difficulty}</Badge>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(course.id)}
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <h3 className="text-xl font-bold text-foreground mb-2 text-balance">{course.title}</h3>

      <p className="text-sm text-muted-foreground mb-3 line-clamp-2 text-pretty">{course.description}</p>

      <div className="mb-4">
        <p className="text-xs text-muted-foreground mb-1">{config.requirement}</p>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">{"Progress"}</span>
          <span className="font-semibold text-foreground">
            {course.progress}
            {"%"}
          </span>
        </div>
        <Progress value={course.progress} className="h-2" />
      </div>

      <Button onClick={() => onContinue(course.id)} className="w-full mt-auto">
        <BookOpen className="w-4 h-4 mr-2" />
        {"Continue"}
      </Button>
    </Card>
  )
}
