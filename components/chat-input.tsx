"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useStore } from "@/lib/store"
import { generateAIResponse } from "@/lib/ai-service"
import { useNotification } from "@/components/notification-provider"

export function ChatInput() {
  const [input, setInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { chats, currentChatId, addMessage, createChat } = useStore()
  const { showNotification } = useNotification()

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = "auto"
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
  }, [input])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || isSubmitting) return

    try {
      setIsSubmitting(true)

      // Create a new chat if none exists
      let chatId = currentChatId
      if (!chatId) {
        chatId = createChat()
      }

      // Get current chat
      const chat = chats.find((c) => c.id === chatId)
      if (!chat) return

      // Add user message
      const userMessage = {
        role: "user" as const,
        content: input.trim(),
      }

      addMessage(chatId, userMessage)
      setInput("")

      // Prepare messages for AI
      const messages = [
        {
          role: "system",
          content:
            "You are Vex AI, a helpful and friendly AI assistant. Provide concise, accurate, and helpful responses.",
        },
        ...chat.messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        userMessage,
      ]

      // Generate AI response
      const response = await generateAIResponse(messages)

      // Add AI response
      addMessage(chatId, {
        role: "assistant",
        content: response.text,
      })
    } catch (error) {
      console.error("Error submitting message:", error)
      showNotification("Error", "Failed to generate a response. Please try again.", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        className="min-h-[60px] w-full resize-none rounded-lg border bg-background pr-12"
        disabled={isSubmitting}
      />

      <Button
        type="submit"
        size="icon"
        disabled={!input.trim() || isSubmitting}
        className="absolute bottom-2 right-2 h-8 w-8 rounded-md aurora-button"
      >
        <Send className="h-4 w-4" />
        <span className="sr-only">Send message</span>
      </Button>

      {isSubmitting && (
        <div className="absolute bottom-2 right-12 flex items-center gap-1 text-xs text-muted-foreground">
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span>Thinking...</span>
        </div>
      )}
    </form>
  )
}
