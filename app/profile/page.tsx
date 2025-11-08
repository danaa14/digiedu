"use client"

import { Navigation } from "@/components/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { BookOpen, Trophy, Target, Flame, Star } from "lucide-react"
import { mockCourses } from "@/lib/data"

export default function ProfilePage() {
  // Calculate statistics from courses
  const totalCourses = mockCourses.length
  const averageProgress = Math.round(mockCourses.reduce((sum, course) => sum + course.progress, 0) / totalCourses)

  const difficultyDistribution = mockCourses.reduce(
    (acc, course) => {
      acc[course.difficulty] = (acc[course.difficulty] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const averageDifficulty =
    Object.keys(difficultyDistribution).sort((a, b) => difficultyDistribution[b] - difficultyDistribution[a])[0] ||
    "Beginner"

  const allHobbies = mockCourses.flatMap((course) => course.hobbies)
  const hobbyCount = allHobbies.reduce(
    (acc, hobby) => {
      acc[hobby] = (acc[hobby] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const favoriteHobbies = Object.entries(hobbyCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([hobby]) => hobby)

  const badges = [
    { id: "1", name: "First Course Created", icon: Star, earned: totalCourses >= 1 },
    { id: "2", name: "Advanced Learner", icon: Trophy, earned: difficultyDistribution["Advanced"] >= 1 },
    { id: "3", name: "Course Completionist", icon: Target, earned: mockCourses.some((c) => c.progress === 100) },
    { id: "4", name: "7-Day Streak", icon: Flame, earned: false },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Profile Header */}
        <div className="flex items-center gap-6 mb-12">
          <Avatar className="w-24 h-24 border-4 border-primary">
            <AvatarFallback className="text-3xl font-bold bg-primary text-primary-foreground">{"JD"}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">{"John Doe"}</h1>
            <p className="text-lg text-muted-foreground">{"Lifelong Learner"}</p>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">{totalCourses}</div>
            <div className="text-sm text-muted-foreground">{"Courses Created"}</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">
              {averageProgress}
              {"%"}
            </div>
            <div className="text-sm text-muted-foreground">{"Average Progress"}</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Trophy className="w-8 h-8 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">{averageDifficulty}</div>
            <div className="text-sm text-muted-foreground">{"Most Common Level"}</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Flame className="w-8 h-8 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">{"3"}</div>
            <div className="text-sm text-muted-foreground">{"Day Streak"}</div>
          </Card>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Favorite Hobbies */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">{"Favorite Interests"}</h2>
            {favoriteHobbies.length > 0 ? (
              <div className="space-y-3">
                {favoriteHobbies.map((hobby, idx) => (
                  <div key={hobby} className="flex items-center justify-between">
                    <span className="text-foreground font-medium">{hobby}</span>
                    <Badge variant="secondary">
                      {hobbyCount[hobby]} {hobbyCount[hobby] === 1 ? "course" : "courses"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">{"Create courses to discover your favorite interests"}</p>
            )}
          </Card>

          {/* Badges & Achievements */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">{"Achievements"}</h2>
            <div className="grid grid-cols-2 gap-4">
              {badges.map((badge) => {
                const Icon = badge.icon
                return (
                  <div
                    key={badge.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      badge.earned ? "border-primary bg-primary/5" : "border-border bg-muted/30 opacity-50"
                    }`}
                  >
                    <Icon className={`w-8 h-8 mb-2 ${badge.earned ? "text-primary" : "text-muted-foreground"}`} />
                    <p className={`text-sm font-medium ${badge.earned ? "text-foreground" : "text-muted-foreground"}`}>
                      {badge.name}
                    </p>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        {/* Learning Journey */}
        <Card className="p-6 mt-6">
          <h2 className="text-xl font-bold text-foreground mb-4">{"Learning Journey"}</h2>
          <div className="space-y-4">
            {mockCourses
              .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
              .map((course) => (
                <div
                  key={course.id}
                  className="flex items-start justify-between p-4 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">{course.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{course.createdAt.toLocaleDateString()}</span>
                      <Badge variant="outline" className="text-xs">
                        {course.difficulty}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {course.progress}
                      {"%"}
                    </div>
                    <div className="text-xs text-muted-foreground">{"Progress"}</div>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      </main>
    </div>
  )
}
