export interface Comment {
  id: string
  postId: string
  author: {
    name: string
    avatar: string
  }
  content: string
  timestamp: Date
}

export interface CommunityPost {
  id: string
  author: {
    name: string
    avatar: string
  }
  course: {
    title: string
    difficulty: "Beginner" | "Intermediate" | "Advanced"
  }
  content: string
  hashtags: string[]
  progress: number
  likes: number
  comments: Comment[]
  timestamp: Date
}

export const mockCommunityPosts: CommunityPost[] = [
  {
    id: "1",
    author: { name: "Sarah Johnson", avatar: "SJ" },
    course: { title: "Photography Composition", difficulty: "Intermediate" },
    content:
      "Just completed the Rule of Thirds module! My photos are already looking so much better. The AI really understood my style preferences.",
    hashtags: ["photography", "progress", "learning"],
    progress: 65,
    likes: 24,
    comments: [],
    timestamp: new Date("2025-01-08T10:30:00"),
  },
  {
    id: "2",
    author: { name: "Mike Chen", avatar: "MC" },
    course: { title: "Web Development Mastery", difficulty: "Beginner" },
    content:
      "Loving how the course integrated my interest in gaming! Building a game review website as my final project.",
    hashtags: ["webdev", "gaming", "milestone"],
    progress: 30,
    likes: 15,
    comments: [],
    timestamp: new Date("2025-01-08T09:15:00"),
  },
  {
    id: "3",
    author: { name: "Emma Rodriguez", avatar: "ER" },
    course: { title: "Spanish Language Immersion", difficulty: "Advanced" },
    content:
      "The AI incorporated my love for travel and cooking into the lessons. Practicing Spanish recipes has been an amazing way to learn!",
    hashtags: ["language", "spanish", "cooking"],
    progress: 85,
    likes: 42,
    comments: [],
    timestamp: new Date("2025-01-08T08:45:00"),
  },
  {
    id: "4",
    author: { name: "David Park", avatar: "DP" },
    course: { title: "Data Science Fundamentals", difficulty: "Intermediate" },
    content:
      "Halfway through and already applying what I learned at work. The practical approach really suits my learning style.",
    hashtags: ["datascience", "career", "progress"],
    progress: 50,
    likes: 31,
    comments: [],
    timestamp: new Date("2025-01-07T16:20:00"),
  },
  {
    id: "5",
    author: { name: "Lisa Thompson", avatar: "LT" },
    course: { title: "Yoga & Mindfulness", difficulty: "Beginner" },
    content: "This course has transformed my daily routine. The AI tailored it perfectly to my wellness goals!",
    hashtags: ["wellness", "yoga", "mindfulness"],
    progress: 95,
    likes: 56,
    comments: [],
    timestamp: new Date("2025-01-07T14:10:00"),
  },
]

export function savePosts(posts: CommunityPost[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem("community_posts", JSON.stringify(posts))
  }
}

export function loadPosts(): CommunityPost[] {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("community_posts")
    if (saved) {
      const parsed = JSON.parse(saved)
      return parsed.map((p: any) => ({
        ...p,
        comments: Array.isArray(p.comments) ? p.comments.map((c: any) => ({
          ...c,
          timestamp: new Date(c.timestamp)
        })) : [],
        timestamp: new Date(p.timestamp),
      }))
    }
  }
  return mockCommunityPosts
}
