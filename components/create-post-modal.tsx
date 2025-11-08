"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/auth-context"
import type { CommunityPost } from "@/lib/community-data"
import { Badge } from "@/components/ui/badge"

interface CreatePostModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPostCreated: (post: CommunityPost) => void
}

export function CreatePostModal({ open, onOpenChange, onPostCreated }: CreatePostModalProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    courseTitle: "",
    difficulty: "Beginner" as "Beginner" | "Intermediate" | "Advanced",
    content: "",
    hashtags: "",
    progress: 0,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Parse hashtags
    const hashtagArray = formData.hashtags
      .split(",")
      .map((tag) => tag.trim().replace(/^#/, ""))
      .filter((tag) => tag.length > 0)

    const newPost: CommunityPost = {
      id: Date.now().toString(),
      author: {
        name: user?.name || "Anonymous",
        avatar: user?.name?.substring(0, 2).toUpperCase() || "AN",
      },
      course: {
        title: formData.courseTitle,
        difficulty: formData.difficulty,
      },
      content: formData.content,
      hashtags: hashtagArray,
      progress: formData.progress,
      likes: 0,
      comments: 0,
      timestamp: new Date(),
    }

    onPostCreated(newPost)
    onOpenChange(false)

    // Reset form
    setFormData({
      courseTitle: "",
      difficulty: "Beginner",
      content: "",
      hashtags: "",
      progress: 0,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Share Your Progress</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="courseTitle">Course Title</Label>
            <Input
              id="courseTitle"
              placeholder="e.g., Web Development Fundamentals"
              value={formData.courseTitle}
              onChange={(e) => setFormData({ ...formData, courseTitle: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty Level</Label>
            <Select
              value={formData.difficulty}
              onValueChange={(value) =>
                setFormData({ ...formData, difficulty: value as "Beginner" | "Intermediate" | "Advanced" })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Your Update</Label>
            <Textarea
              id="content"
              placeholder="Share your thoughts, progress, or achievements..."
              className="min-h-32 resize-none"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hashtags">Hashtags</Label>
            <Input
              id="hashtags"
              placeholder="e.g., webdev, learning, milestone (comma-separated)"
              value={formData.hashtags}
              onChange={(e) => setFormData({ ...formData, hashtags: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">Add hashtags to categorize your post. Separate with commas.</p>
            {formData.hashtags && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.hashtags
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter((tag) => tag)
                  .map((tag, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      #{tag.replace(/^#/, "")}
                    </Badge>
                  ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="progress">Course Progress: {formData.progress}%</Label>
            <input
              id="progress"
              type="range"
              min="0"
              max="100"
              step="5"
              value={formData.progress}
              onChange={(e) => setFormData({ ...formData, progress: Number.parseInt(e.target.value) })}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Post Update
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
