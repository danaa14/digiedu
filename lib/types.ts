export type DifficultyLevel = "Beginner" | "Intermediate" | "Advanced"

export type LearningStyle = "Visual" | "Practical / Hands-on" | "Theoretical"

export interface Chapter {
  id: string
  title: string
  content: string
  order: number
  isCompleted: boolean
}

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
  chapters?: Chapter[]
  quiz?: Quiz
  badgeEarned?: boolean
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

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

export interface Quiz {
  id: string
  courseId: string
  title: string
  questions: QuizQuestion[]
  passingScore: number
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  earnedAt?: Date
  courseId?: string
}
