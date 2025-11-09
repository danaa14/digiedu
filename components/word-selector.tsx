"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, MessageSquare, Loader2, X } from "lucide-react"
import { createPortal } from "react-dom"

interface WordComment {
  id: string
  word: string
  text: string
  author: string
  createdAt: Date
  chapterId: string
}

interface WordSelectorProps {
  content: string
  chapterId: string
  courseId: string
  onContentUpdate?: (content: string) => void
}

interface WordExplanation {
  word: string
  chapterId: string
}

export function WordSelector({ content, chapterId, courseId, onContentUpdate }: WordSelectorProps) {
  const [selectedWord, setSelectedWord] = useState<string>("")
  const [dropdownPosition, setDropdownPosition] = useState<{ x: number; y: number } | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false)
  const [explanation, setExplanation] = useState<string>("")
  const [showCommentForm, setShowCommentForm] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [comments, setComments] = useState<WordComment[]>([])
  const [isSavingComment, setIsSavingComment] = useState(false)
  const [explainedWords, setExplainedWords] = useState<Set<string>>(new Set())
  const contentRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Load comments from localStorage
  useEffect(() => {
    const storedComments = localStorage.getItem(`word-comments-${chapterId}`)
    if (storedComments) {
      try {
        const parsed = JSON.parse(storedComments)
        setComments(parsed.map((c: any) => ({ ...c, createdAt: new Date(c.createdAt) })))
      } catch (e) {
        console.error("Failed to parse comments:", e)
      }
    }

    const storedExplained = localStorage.getItem(`word-explained-${chapterId}`)
    if (storedExplained) {
      try {
        setExplainedWords(new Set(JSON.parse(storedExplained)))
      } catch (e) {
        console.error("Failed to parse explained words:", e)
      }
    }
  }, [chapterId])

  const handleTextSelection = (e: React.MouseEvent) => {
    const selection = window.getSelection()
    const text = selection?.toString().trim()

        if (text && text.length > 0) {
      setSelectedWord(text)
      const range = selection?.getRangeAt(0)
      const rect = range?.getBoundingClientRect()
      if (rect) {
        setDropdownPosition({
          x: rect.left + rect.width / 2 + window.scrollX,
          y: rect.top + window.scrollY - 10,
        })
      }

      setShowDropdown(true)
      setExplanation("")
      setShowCommentForm(false)
      setCommentText("")
    } else {
      setShowDropdown(false)
    }

  }

  const handleAskAPI = async () => {
  setIsLoadingExplanation(true)
  setExplanation("")

  try {
    const response = await fetch("/api/explain-word", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word: selectedWord }),
    })

    const data = await response.json() // <-- here

    if (data.success) {
      setExplanation(data.explanation)
      const newExplained = new Set(explainedWords).add(selectedWord.toLowerCase())
      setExplainedWords(newExplained)
      localStorage.setItem(`word-explained-${chapterId}`, JSON.stringify(Array.from(newExplained)))
    } else {
      setExplanation("Failed to get explanation. Please try again.")
    }
  } catch (error) {
    console.error("Error getting explanation:", error)  
    setExplanation("An error occurred. Please try again.")
  } finally {
    setIsLoadingExplanation(false)
  }
}

  const handleAddComment = async () => {
    if (!commentText.trim()) return

    setIsSavingComment(true)

    const newComment: WordComment = {
      id: Date.now().toString(),
      word: selectedWord,
      text: commentText,
      author: "You",
      createdAt: new Date(),
      chapterId,
    }

    const updatedComments = [...comments, newComment]
    setComments(updatedComments)

    // Save to localStorage
    localStorage.setItem(`word-comments-${chapterId}`, JSON.stringify(updatedComments))

    setCommentText("")
    setShowCommentForm(false)
    setIsSavingComment(false)
  }

  const getCommentsForWord = (word: string) => {
  return comments.filter((c) =>
    c.word.toLowerCase().split(" ").some(w => w === word.toLowerCase())
  )
}


  const hasComments = (word: string) => {
  return comments.some((c) =>
    c.word.toLowerCase().split(" ").some(w => w === word.toLowerCase())
  )
}


  const isExplained = (word: string) => {
    return explainedWords.has(word.toLowerCase())
  }

  const wordComments = selectedWord ? getCommentsForWord(selectedWord) : []

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const renderContentWithIndicators = () => {
    const words = content.split(/(\s+)/)
    return words.map((word, index) => {
      const cleanWord = word
        .trim()
        .toLowerCase()
        .replace(/[.,!?;:]/g, "")
      if (!cleanWord || /^\s+$/.test(word)) {
        return <span key={index}>{word}</span>
      }

      const commented = hasComments(cleanWord)
      const explained = isExplained(cleanWord)

      return (
        <span key={index} className={commented || explained ? "relative inline-block" : ""}>
          {word}
          {commented && (
            <span
              className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full border border-background"
              title="Has comments"
            />
          )}
          {explained && !commented && (
            <span
              className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full border border-background"
              title="AI explained"
            />
          )}
        </span>
      )
    })
  }

  return (
    <div className="relative">
      <div
        ref={contentRef}
        onMouseUp={handleTextSelection}
        className="prose prose-slate max-w-none cursor-text select-text"
      >
        <div className="whitespace-pre-wrap text-foreground leading-relaxed">{renderContentWithIndicators()}</div>
      </div>

      {showDropdown && dropdownPosition &&
  createPortal(
    <div
      ref={dropdownRef}
      style={{
        position: "absolute",
        top: dropdownPosition.y,
        left: dropdownPosition.x,
        transform: "translate(-50%, -100%)",
        zIndex: 9999,
      }}
      className="mb-2"
    >
      <Card className="p-4 shadow-lg border-2 border-primary/20 min-w-[320px] max-w-[500px]">
        <div className="flex items-center justify-between mb-3">
              <div className="font-semibold text-foreground flex items-center gap-2">
                {selectedWord}
                {hasComments(selectedWord.toLowerCase()) && (
                  <span className="w-2 h-2 bg-blue-500 rounded-full" title="Has comments" />
                )}
                {isExplained(selectedWord.toLowerCase()) && (
                  <span className="w-2 h-2 bg-purple-500 rounded-full" title="AI explained" />
                )}
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowDropdown(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex gap-2 mb-3">
              <Button onClick={handleAskAPI} disabled={isLoadingExplanation} className="flex-1 gap-2" size="sm">
                {isLoadingExplanation ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Ask AI
                  </>
                )}
              </Button>
              <Button
                onClick={() => setShowCommentForm(!showCommentForm)}
                variant="outline"
                className="flex-1 gap-2"
                size="sm"
              >
                <MessageSquare className="w-4 h-4" />
                Add Comment
              </Button>
            </div>

            {explanation && (
              <div className="mb-3 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <div className="text-sm text-foreground">{explanation}</div>
              </div>
            )}

            {showCommentForm && (
              <div className="mb-3">
                <Textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add your comment for other learners..."
                  className="mb-2 min-h-[80px]"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleAddComment}
                    disabled={!commentText.trim() || isSavingComment}
                    size="sm"
                    className="flex-1"
                  >
                    {isSavingComment ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Comment"
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowCommentForm(false)
                      setCommentText("")
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {wordComments.length > 0 && (
              <div className="border-t border-border pt-3">
                <div className="text-xs font-semibold text-muted-foreground mb-2">Comments ({wordComments.length})</div>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {wordComments.map((comment) => (
                   <div key={comment.id} className="p-2 bg-blue-500/10 rounded border border-blue-500/20 text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-xs">{comment.author}</span>
                        <span className="text-xs text-muted-foreground">{comment.createdAt.toLocaleDateString()}</span>
                      </div>
                      <div className="text-foreground">{comment.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
    </div>,
    document.body
  )
}
    </div>
  )
}
