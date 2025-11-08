export type DifficultyLevel = "Beginner" | "Intermediate" | "Advanced"

export type LearningStyle = "Visual" | "Practical / Hands-on" | "Theoretical"

export interface Course {
  id: string
  title: string
  description: string
  difficulty: DifficultyLevel
  progress: number
  modules: CourseModule[]
  requirements: string
  createdAt: Date
  hobbies: string[]
  learningStyle?: LearningStyle
}

export interface CourseModule {
  id: string
  title: string
  lessons: string[]
  outcomes: string[]
}

export interface CourseFormData {
  topic: string
  level: DifficultyLevel
  hobbies: string[]
  learningStyle?: LearningStyle
}
