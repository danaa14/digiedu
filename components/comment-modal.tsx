"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/lib/auth-context"
import type { Comment } from "@/lib/community-data"

interface CommentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCommentSubmit: (comment: Comment) => void
  postId: string
}

export function CommentModal({ open, onOpenChange, onCommentSubmit, postId }: CommentModalProps) {
  const { user } = useAuth()
  const [content, setContent] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newComment: Comment = {
      id: Date.now().toString(),
      postId,
      author: {
        name: user?.name || "Anonymous",
        avatar: user?.name?.substring(0, 2).toUpperCase() || "AN",
      },
      content,
      timestamp: new Date(),
    }

    onCommentSubmit(newComment)
    onOpenChange(false)
    setContent("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add Comment</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <Textarea
            placeholder="Write your comment..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-24 resize-none"
            required
          />

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={!content.trim()}>
              Post Comment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}