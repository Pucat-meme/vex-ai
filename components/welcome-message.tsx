"use client"

import Image from "next/image"
import { useStore } from "@/lib/store"
import { useNotification } from "@/components/notification-provider"
import { generateAIResponse } from "@/lib/ai-service"

export function WelcomeMessage() {
  const { currentChatId, chats, createChat, addMessage } = useStore()
  const { showNotification } = useNotification()

  // Check if there's a current chat with messages
  const currentChat = currentChatId ? chats.find((chat) => chat.id === currentChatId) : null
  const hasMessages = currentChat?.messages.length ? currentChat.messages.length > 0 : false

  // Don't show welcome message if there are messages
  if (hasMessages) return null

  const handlePromptClick = async (prompt: string) => {
    try {
      // Create a new chat if none exists
      let chatId = currentChatId
      if (!chatId) {
        chatId = createChat()
      }

      // Add user message
      const userMessage = {
        role: "user" as const,
        content: prompt,
      }

      addMessage(chatId, userMessage)

      // Prepare messages for AI
      const messages = [
        {
          role: "system",
          content:
            "You are Vex AI, a helpful and friendly AI assistant. Provide concise, accurate, and helpful responses.",
        },
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
      console.error("Error submitting prompt:", error)
      showNotification("Error", "Failed to generate a response. Please try again.", "error")
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 text-center animate-fade-in">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full gradient-primary">
        <Image src="/vexai.svg" alt="Vex AI Logo" width={48} height={48} className="h-12 w-12" />
      </div>

      <h1 className="mb-2 text-2xl font-bold aurora-text">Welcome to Vex AI</h1>
      <p className="mb-8 max-w-md text-muted-foreground">
        Your intelligent AI assistant powered by Groq. Ask me anything, and I'll do my best to help you.
      </p>

      <div className="grid w-full max-w-lg gap-4 sm:grid-cols-2">
        {examples.map((example, index) => (
          <div
            key={index}
            className="flex cursor-pointer flex-col rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50 animate-slide-in-up aurora-glow"
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => handlePromptClick(example.prompt)}
          >
            <h3 className="mb-2 font-medium aurora-text">{example.title}</h3>
            <p className="text-sm text-muted-foreground">{example.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

const examples = [
  {
    title: "What can you do?",
    description: "Learn about my capabilities and how I can assist you.",
    prompt: "What can you do? Please explain your capabilities in detail.",
  },
  {
    title: "Write a blog post",
    description: "I can help you draft content on various topics.",
    prompt: "Write a short blog post about the future of artificial intelligence.",
  },
  {
    title: "Explain a concept",
    description: "Ask me to explain any topic in simple terms.",
    prompt: "Explain quantum computing in simple terms that a 10-year-old would understand.",
  },
  {
    title: "Coding assistance",
    description: "Get help with programming problems and questions.",
    prompt: "How do I create a responsive navigation bar using React and Tailwind CSS?",
  },
]
