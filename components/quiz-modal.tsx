"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Award, CheckCircle2, XCircle } from "lucide-react"
import type { Quiz } from "@/lib/types"

interface QuizModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  quiz: Quiz
  onComplete: (passed: boolean, score: number) => void
}

export function QuizModal({ open, onOpenChange, quiz, onComplete }: QuizModalProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([])
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)

  const currentQuestion = quiz.questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestionIndex] = answerIndex
    setSelectedAnswers(newAnswers)
  }

  const handleNext = () => {
    if (isLastQuestion) {
      calculateResults()
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const calculateResults = () => {
    let correct = 0
    quiz.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) {
        correct++
      }
    })
    const finalScore = Math.round((correct / quiz.questions.length) * 100)
    setScore(finalScore)
    setShowResults(true)
  }

  const handleFinish = () => {
    const passed = score >= quiz.passingScore
    onComplete(passed, score)
    onOpenChange(false)
    // Reset state
    setCurrentQuestionIndex(0)
    setSelectedAnswers([])
    setShowResults(false)
    setScore(0)
  }

  if (showResults) {
    const passed = score >= quiz.passingScore
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Quiz Results</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-6">
            <div className={`text-center p-8 rounded-lg ${passed ? "bg-green-500/10" : "bg-red-500/10"}`}>
              {passed ? (
                <Award className="w-20 h-20 mx-auto mb-4 text-green-600" />
              ) : (
                <XCircle className="w-20 h-20 mx-auto mb-4 text-red-600" />
              )}
              <h3 className="text-3xl font-bold mb-2">{score}%</h3>
              <p className="text-lg text-muted-foreground">
                {passed
                  ? `Congratulations! You passed with ${score}%`
                  : `You need ${quiz.passingScore}% to pass. You scored ${score}%.`}
              </p>
            </div>

            {passed && (
              <div className="bg-accent/50 p-6 rounded-lg text-center">
                <Award className="w-12 h-12 mx-auto mb-3 text-yellow-600" />
                <h4 className="font-semibold text-lg mb-2">Badge Earned!</h4>
                <p className="text-sm text-muted-foreground">
                  You have earned the Course Completion badge! Check your profile to see it.
                </p>
              </div>
            )}

            <div className="space-y-4">
              <h4 className="font-semibold">Review Answers:</h4>
              {quiz.questions.map((q, idx) => {
                const userAnswer = selectedAnswers[idx]
                const isCorrect = userAnswer === q.correctAnswer
                return (
                  <div key={q.id} className="p-4 border border-border rounded-lg">
                    <div className="flex items-start gap-2 mb-2">
                      {isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium mb-2">
                          {idx + 1}. {q.question}
                        </p>
                        <p className="text-sm text-muted-foreground">Your answer: {q.options[userAnswer]}</p>
                        {!isCorrect && (
                          <p className="text-sm text-green-600">Correct answer: {q.options[q.correctAnswer]}</p>
                        )}
                        <p className="text-sm text-muted-foreground mt-2 italic">{q.explanation}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <Button onClick={handleFinish} className="w-full">
              {passed ? "Claim Your Badge" : "Try Again Later"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{quiz.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </span>
            <span>Passing Score: {quiz.passingScore}%</span>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{currentQuestion.question}</h3>

            <RadioGroup
              value={selectedAnswers[currentQuestionIndex]?.toString()}
              onValueChange={(value) => handleAnswerSelect(Number.parseInt(value))}
            >
              {currentQuestion.options.map((option, idx) => (
                <div
                  key={idx}
                  className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer"
                >
                  <RadioGroupItem value={idx.toString()} id={`option-${idx}`} />
                  <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <Button
            onClick={handleNext}
            disabled={selectedAnswers[currentQuestionIndex] === undefined}
            className="w-full"
          >
            {isLastQuestion ? "Submit Quiz" : "Next Question"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
