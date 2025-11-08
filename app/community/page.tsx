"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { CommunityPostCard } from "@/components/community-post"
import { CreatePostModal } from "@/components/create-post-modal"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { loadPosts, savePosts, type CommunityPost } from "@/lib/community-data"
import { Filter, Plus, Hash } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import { Badge } from "@/components/ui/badge"

function CommunityContent() {
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all")
  const [filterHashtag, setFilterHashtag] = useState<string>("all")
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    setPosts(loadPosts())
  }, [])

  useEffect(() => {
    if (posts.length > 0) {
      savePosts(posts)
    }
  }, [posts])

  const handlePostCreated = (post: CommunityPost) => {
    setPosts((prev) => [post, ...prev])
  }

  const allHashtags = Array.from(new Set(posts.flatMap((post) => post.hashtags))).sort()

  const filteredPosts = posts.filter((post) => {
    const matchesDifficulty = filterDifficulty === "all" || post.course.difficulty === filterDifficulty
    const matchesHashtag = filterHashtag === "all" || post.hashtags.includes(filterHashtag)
    return matchesDifficulty && matchesHashtag
  })

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-3 text-balance">Community</h1>
            <p className="text-lg text-muted-foreground text-pretty">
              Share your progress and get inspired by other learners
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} size="lg" className="gap-2">
            <Plus className="w-5 h-5" />
            New Post
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-8 p-4 bg-card rounded-lg border border-border">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>

          <Hash className="w-5 h-5 text-muted-foreground ml-2" />
          <Select value={filterHashtag} onValueChange={setFilterHashtag}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by hashtag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Hashtags</SelectItem>
              {allHashtags.map((tag) => (
                <SelectItem key={tag} value={tag}>
                  #{tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(filterDifficulty !== "all" || filterHashtag !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilterDifficulty("all")
                setFilterHashtag("all")
              }}
              className="ml-auto"
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Popular Hashtags */}
        {allHashtags.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Popular Hashtags</h3>
            <div className="flex flex-wrap gap-2">
              {allHashtags.slice(0, 10).map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => setFilterHashtag(tag)}
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Posts Feed */}
        <div className="space-y-6">
          {filteredPosts.map((post) => (
            <CommunityPostCard key={post.id} post={post} />
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">No posts found for this filter</p>
            <Button
              onClick={() => {
                setFilterDifficulty("all")
                setFilterHashtag("all")
              }}
            >
              Clear Filter
            </Button>
          </div>
        )}
      </main>

      {/* Create Post Modal */}
      <CreatePostModal open={showCreateModal} onOpenChange={setShowCreateModal} onPostCreated={handlePostCreated} />
    </div>
  )
}

export default function CommunityPage() {
  return (
    <AuthGuard>
      <CommunityContent />
    </AuthGuard>
  )
}
