"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { CommunityPostCard } from "@/components/community-post"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockCommunityPosts } from "@/lib/community-data"
import { Filter } from "lucide-react"

export default function CommunityPage() {
  const [posts, setPosts] = useState(mockCommunityPosts)
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all")

  const filteredPosts =
    filterDifficulty === "all" ? posts : posts.filter((post) => post.course.difficulty === filterDifficulty)

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-3 text-balance">{"Community"}</h1>
          <p className="text-lg text-muted-foreground text-pretty">
            {"Share your progress and get inspired by other learners"}
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-8">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{"All Levels"}</SelectItem>
              <SelectItem value="Beginner">{"Beginner"}</SelectItem>
              <SelectItem value="Intermediate">{"Intermediate"}</SelectItem>
              <SelectItem value="Advanced">{"Advanced"}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Posts Feed */}
        <div className="space-y-6">
          {filteredPosts.map((post) => (
            <CommunityPostCard key={post.id} post={post} />
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">{"No posts found for this filter"}</p>
            <Button onClick={() => setFilterDifficulty("all")}>{"Clear Filter"}</Button>
          </div>
        )}
      </main>
    </div>
  )
}
