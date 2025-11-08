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
    learningStyle: "Hands-on",
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
