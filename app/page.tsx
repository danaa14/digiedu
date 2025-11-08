"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { CourseCard } from "@/components/course-card"
import { CreateCourseModal } from "@/components/create-course-modal"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { mockCourses } from "@/lib/data"
import type { Course } from "@/lib/types"

export default function DashboardPage() {
  const [courses, setCourses] = useState(mockCourses)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const handleDelete = (id: string) => {
    setCourses(courses.filter((c) => c.id !== id))
  }

  const handleContinue = (id: string) => {
    console.log("[v0] Continue course:", id)
    // TODO: Navigate to course detail page
  }

  const handleCourseCreated = (course: Course) => {
    setCourses((prev) => [course, ...prev])
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            {"Welcome to My Custom Course"}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            {"Create your own personalized AI-powered learning experience."}
          </p>
        </div>

        {/* Course Grid */}
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} onDelete={handleDelete} onContinue={handleContinue} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">{"No courses yet"}</h3>
            <p className="text-muted-foreground mb-6">{"Get started by creating your first AI-powered course"}</p>
          </div>
        )}

        {/* Floating Create Button */}
        <Button
          size="lg"
          onClick={() => setShowCreateModal(true)}
          className="fixed bottom-8 right-8 rounded-full h-14 px-6 shadow-lg hover:shadow-xl transition-shadow"
        >
          <Plus className="w-5 h-5 mr-2" />
          {"Create New Course"}
        </Button>
      </main>

      {/* CreateCourseModal */}
      <CreateCourseModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onCourseCreated={handleCourseCreated}
      />
    </div>
  )
}
