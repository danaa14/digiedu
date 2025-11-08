"use client"

import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Heart, MessageCircle } from "lucide-react"
import type { CommunityPost } from "@/lib/community-data"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface CommunityPostCardProps {
  post: CommunityPost
}

const difficultyColors = {
  Beginner: "bg-green-500/10 text-green-700 border-green-500/20",
  Intermediate: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  Advanced: "bg-purple-500/10 text-purple-700 border-purple-500/20",
}

export function CommunityPostCard({ post }: CommunityPostCardProps) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post.likes)

  const handleLike = () => {
    if (liked) {
      setLikeCount((prev) => prev - 1)
    } else {
      setLikeCount((prev) => prev + 1)
    }
    setLiked(!liked)
  }

  const timeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    if (seconds < 60) return "just now"
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      {/* Author Header */}
      <div className="flex items-center gap-3 mb-4">
        <Avatar className="w-10 h-10 border-2 border-primary/20">
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">{post.author.avatar}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="font-semibold text-foreground">{post.author.name}</div>
          <div className="text-sm text-muted-foreground">{timeAgo(post.timestamp)}</div>
        </div>
      </div>

      {/* Course Info */}
      <div className="mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-foreground">{post.course.title}</span>
          <Badge className={cn("border text-xs", difficultyColors[post.course.difficulty])}>
            {post.course.difficulty}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <p className="text-foreground mb-4 text-pretty leading-relaxed">{post.content}</p>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">{"Course Progress"}</span>
          <span className="font-semibold text-primary">
            {post.progress}
            {"%"}
          </span>
        </div>
        <Progress value={post.progress} className="h-2" />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-2 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          className={cn("gap-2", liked && "text-red-500 hover:text-red-600")}
        >
          <Heart className={cn("w-4 h-4", liked && "fill-current")} />
          <span>{likeCount}</span>
        </Button>
        <Button variant="ghost" size="sm" className="gap-2">
          <MessageCircle className="w-4 h-4" />
          <span>{post.comments}</span>
        </Button>
      </div>
    </Card>
  )
}
