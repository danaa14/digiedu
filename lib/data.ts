import type { Course } from "./types"

// Mock course data for demonstration
export const mockCourses: Course[] = [
  {
    id: "1",
    title: "Web Development Fundamentals",
    description: "Learn the basics of HTML, CSS, and JavaScript to build modern websites",
    difficulty: "Beginner",
    progress: 45,
    modules: [
      {
        id: "m1",
        title: "Introduction to HTML",
        lessons: ["HTML Basics", "Semantic HTML", "Forms and Inputs"],
        outcomes: ["Understand HTML structure", "Create web pages"],
      },
      {
        id: "m2",
        title: "Styling with CSS",
        lessons: ["CSS Selectors", "Flexbox", "Grid Layout"],
        outcomes: ["Style web pages", "Create responsive layouts"],
      },
    ],
    requirements: "No prior knowledge required.",
    createdAt: new Date("2025-01-15"),
    hobbies: ["Technology", "Reading"],
  learningStyle: "Practical / Hands-on",
  },
  {
    id: "2",
    title: "Advanced React Patterns",
    description: "Master advanced React concepts and design patterns for scalable applications",
    difficulty: "Advanced",
    progress: 20,
    modules: [
      {
        id: "m1",
        title: "Custom Hooks",
        lessons: ["Hook Patterns", "Performance Optimization"],
        outcomes: ["Create reusable hooks", "Optimize performance"],
      },
    ],
    requirements: "Strong foundational knowledge required.",
    createdAt: new Date("2025-01-20"),
    hobbies: ["Technology", "Puzzles"],
    learningStyle: "Theoretical",
  },
  {
    id: "3",
    title: "Photography Composition",
    description: "Learn the art of composing stunning photographs",
    difficulty: "Intermediate",
    progress: 60,
    modules: [
      {
        id: "m1",
        title: "Rule of Thirds",
        lessons: ["Understanding composition", "Framing techniques"],
        outcomes: ["Compose better photos", "Use leading lines"],
      },
    ],
    requirements: "Some experience recommended.",
    createdAt: new Date("2025-01-10"),
    hobbies: ["Photography", "Art"],
    learningStyle: "Visual",
  },
]

export function getAllCourses(): Course[] {
  if (typeof window === "undefined") return mockCourses

  const stored = localStorage.getItem("user-courses")
  console.log("[v0] Raw stored courses:", stored);
  
  if (!stored) return mockCourses

  try {
    const userCourses = JSON.parse(stored) as Course[]
    console.log("[v0] Parsed user courses:", userCourses);
    
    // Merge user courses with mock courses, user courses take priority
    const mockCoursesMap = new Map(mockCourses.map((c) => [c.id, c]))
    userCourses.forEach((c) => mockCoursesMap.set(c.id, c))
    const allCourses = Array.from(mockCoursesMap.values())
    console.log("[v0] All courses after merge:", allCourses);
    return allCourses;
  } catch {
    return mockCourses
  }
}

export function getCourseById(id: string): Course | null {
  const courses = getAllCourses()
  return courses.find((c) => c.id === id) || null
}

export function saveCourse(course: Course) {
  if (typeof window === "undefined") return

  const courses = getAllCourses()
  const index = courses.findIndex((c) => c.id === course.id)

  if (index >= 0) {
    courses[index] = {
      ...courses[index],
      ...course,
      chapters: course.chapters?.map(ch => ({
        ...ch,
        content: ch.content || "Content will be generated when you open this chapter."
      }))
    }
  } else {
    courses.push({
      ...course,
      chapters: course.chapters?.map(ch => ({
        ...ch,
        content: ch.content || "Content will be generated when you open this chapter."
      }))
    })
  }

  // Save all user-created courses (not mock courses)
  const userCourses = courses.filter((c) => !["1", "2", "3"].includes(c.id))
  try {
    localStorage.setItem("user-courses", JSON.stringify(userCourses))
    console.log("[v0] Saved course data successfully:", course.id)
  } catch (error) {
    console.error("[v0] Error saving course data:", error)
  }
}

export function deleteCourse(id: string) {
  if (typeof window === "undefined") return

  const courses = getAllCourses()
  const filtered = courses.filter((c) => c.id !== id)
  const userCourses = filtered.filter((c) => !["1", "2", "3"].includes(c.id))
  localStorage.setItem("user-courses", JSON.stringify(userCourses))
}
