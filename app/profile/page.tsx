"use client"

import { Navigation } from "@/components/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { BookOpen, Trophy, Target, Flame, Star, Clock, TrendingUp, Award } from "lucide-react"
import { getAllCourses } from "@/lib/data"
import { AuthGuard } from "@/components/auth-guard"
import { useAuth } from "@/lib/auth-context"
import { Progress } from "@/components/ui/progress"
import { useState, useEffect } from "react"

function ProfileContent() {
  const { user } = useAuth()
  const [courses, setCourses] = useState<any[]>([])

  useEffect(() => {
    setCourses(getAllCourses())
  }, [])

  const totalCourses = courses.length
  const completedCourses = courses.filter((c) => c.progress === 100).length
  const inProgressCourses = courses.filter((c) => c.progress > 0 && c.progress < 100).length
  const averageProgress =
    totalCourses > 0 ? Math.round(courses.reduce((sum, course) => sum + course.progress, 0) / totalCourses) : 0

  const totalChapters = courses.reduce((sum, course) => sum + (course.chapters?.length || 0), 0)
  const completedChapters = courses.reduce(
    (sum, course) => sum + (course.chapters?.filter((ch) => ch.isCompleted).length || 0),
    0,
  )

  const estimatedLearningMinutes = completedChapters * 10
  const learningHours = Math.floor(estimatedLearningMinutes / 60)
  const learningMinutes = estimatedLearningMinutes % 60

  const difficultyDistribution = courses.reduce(
    (acc, course) => {
      acc[course.difficulty] = (acc[course.difficulty] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const allHobbies = courses.flatMap((course) => course.hobbies)
  const hobbyCount = allHobbies.reduce(
    (acc, hobby) => {
      acc[hobby] = (acc[hobby] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const favoriteHobbies = Object.entries(hobbyCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const quizBadgesEarned = courses.filter((c) => c.badgeEarned).length

  const badges = [
    { id: "1", name: "First Course", icon: Star, earned: totalCourses >= 1 },
    { id: "2", name: "Course Creator", icon: BookOpen, earned: totalCourses >= 3 },
    { id: "3", name: "Completionist", icon: Target, earned: completedCourses >= 1 },
    { id: "4", name: "Advanced Learner", icon: Trophy, earned: difficultyDistribution["Advanced"] >= 1 },
    { id: "5", name: "Quick Learner", icon: TrendingUp, earned: averageProgress >= 50 },
    { id: "6", name: "Dedicated", icon: Flame, earned: totalChapters >= 5 },
    { id: "7", name: "Master", icon: Award, earned: completedCourses >= 3 },
    { id: "8", name: "Quiz Master", icon: Trophy, earned: quizBadgesEarned >= 1, special: true },
    { id: "9", name: "Perfect Score", icon: Award, earned: quizBadgesEarned >= 3, special: true },
  ]

  const earnedBadges = badges.filter((b) => b.earned).length

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="flex items-center gap-6 mb-12">
          <Avatar className="w-24 h-24 border-4 border-primary">
            <AvatarFallback className="text-3xl font-bold bg-primary text-primary-foreground">
              {user?.name?.substring(0, 2).toUpperCase() || "AN"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-foreground mb-2">{user?.name || "Anonymous"}</h1>
            <p className="text-lg text-muted-foreground">Lifelong Learner</p>
            <div className="flex items-center gap-4 mt-3">
              <Badge variant="secondary" className="gap-1">
                <Trophy className="w-3 h-3" />
                {earnedBadges}/{badges.length} Achievements
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Target className="w-3 h-3" />
                Level {Math.floor(completedChapters / 5) + 1}
              </Badge>
              {quizBadgesEarned > 0 && (
                <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20 border gap-1">
                  <Award className="w-3 h-3" />
                  {quizBadgesEarned} Quiz {quizBadgesEarned === 1 ? "Badge" : "Badges"}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">{totalCourses}</div>
            <div className="text-sm text-muted-foreground">Total Courses</div>
            <div className="text-xs text-muted-foreground mt-2">
              {completedCourses} completed, {inProgressCourses} in progress
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">{averageProgress}%</div>
            <div className="text-sm text-muted-foreground">Average Progress</div>
            <Progress value={averageProgress} className="h-1 mt-2" />
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Trophy className="w-8 h-8 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">{completedChapters}</div>
            <div className="text-sm text-muted-foreground">Chapters Completed</div>
            <div className="text-xs text-muted-foreground mt-2">of {totalChapters} total</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">
              {learningHours}h {learningMinutes}m
            </div>
            <div className="text-sm text-muted-foreground">Learning Time</div>
            <div className="text-xs text-muted-foreground mt-2">Estimated</div>
          </Card>
        </div>

        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold text-foreground mb-6">Progress by Difficulty Level</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(["Beginner", "Intermediate", "Advanced"] as const).map((level) => {
              const coursesAtLevel = courses.filter((c) => c.difficulty === level)
              const count = coursesAtLevel.length
              const avgProgress =
                count > 0 ? Math.round(coursesAtLevel.reduce((sum, c) => sum + c.progress, 0) / count) : 0

              const colors = {
                Beginner: "bg-green-500/10 text-green-700 border-green-500/20",
                Intermediate: "bg-blue-500/10 text-blue-700 border-blue-500/20",
                Advanced: "bg-purple-500/10 text-purple-700 border-purple-500/20",
              }

              return (
                <div key={level} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge className={`border ${colors[level]}`}>{level}</Badge>
                    <span className="text-sm text-muted-foreground">{count} courses</span>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Average</span>
                      <span className="font-semibold text-primary">{avgProgress}%</span>
                    </div>
                    <Progress value={avgProgress} className="h-2" />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Learning Interests</h2>
            {favoriteHobbies.length > 0 ? (
              <div className="space-y-3">
                {favoriteHobbies.map(([hobby, count], idx) => (
                  <div key={hobby} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {idx + 1}
                      </div>
                      <span className="text-foreground font-medium">{hobby}</span>
                    </div>
                    <Badge variant="secondary">
                      {count} {count === 1 ? "course" : "courses"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Create courses to discover your favorite interests</p>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center justify-between">
              Achievements
              <Badge variant="outline">
                {earnedBadges}/{badges.length}
              </Badge>
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {badges.map((badge) => {
                const Icon = badge.icon
                return (
                  <div
                    key={badge.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      badge.earned
                        ? badge.special
                          ? "border-yellow-500 bg-yellow-500/10 shadow-md"
                          : "border-primary bg-primary/5 shadow-sm"
                        : "border-border bg-muted/30 opacity-50"
                    }`}
                  >
                    <Icon
                      className={`w-8 h-8 mb-2 ${
                        badge.earned ? (badge.special ? "text-yellow-600" : "text-primary") : "text-muted-foreground"
                      }`}
                    />
                    <p className={`text-sm font-medium ${badge.earned ? "text-foreground" : "text-muted-foreground"}`}>
                      {badge.name}
                    </p>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-bold text-foreground mb-6">Learning Journey</h2>
          <div className="space-y-4">
            {courses.length > 0 ? (
              courses
                .sort((a, b) => {
                  const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime()
                  const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime()
                  return dateB - dateA
                })
                .map((course) => {
                  const courseDate = course.createdAt instanceof Date ? course.createdAt : new Date(course.createdAt)
                  return (
                    <div
                      key={course.id}
                      className="flex items-start justify-between p-4 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-foreground">{course.title}</h3>
                          {course.badgeEarned && (
                            <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20 border gap-1">
                              <Trophy className="w-3 h-3" />
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <span>{courseDate.toLocaleDateString()}</span>
                          <Badge variant="outline" className="text-xs">
                            {course.difficulty}
                          </Badge>
                          <span>{course.chapters?.length || 0} chapters</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>
                      <div className="text-right ml-6">
                        <div className="text-2xl font-bold text-primary">{course.progress}%</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {course.progress === 100 ? "Complete" : "In Progress"}
                        </div>
                      </div>
                    </div>
                  )
                })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No courses yet. Start your learning journey by creating your first course!</p>
              </div>
            )}
          </div>
        </Card>
      </main>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  )
}
