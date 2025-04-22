"use client"

import { useEffect, useRef } from "react"
import { useStore } from "@/lib/store"
import { ChatMessage } from "@/components/chat-message"
import { ChatInput } from "@/components/chat-input"
import { WelcomeMessage } from "@/components/welcome-message"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { useNotification } from "@/components/notification-provider"

export function ChatInterface() {
  const { chats, currentChatId, isLoading, toggleSidebar, isSidebarOpen } = useStore()
  const { showNotification } = useNotification()

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Get current chat
  const currentChat = currentChatId ? chats.find((chat) => chat.id === currentChatId) : null

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [currentChat?.messages])

  const handleToggleSidebar = () => {
    toggleSidebar()
    showNotification(isSidebarOpen ? "Sidebar hidden" : "Sidebar visible", "", "info")
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center border-b px-4">
        <Button variant="ghost" size="icon" onClick={handleToggleSidebar} className="mr-4">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>

        <h1 className="text-lg font-semibold aurora-text">{currentChat ? currentChat.title : "New Chat"}</h1>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {!currentChat || currentChat.messages.length === 0 ? (
          <WelcomeMessage />
        ) : (
          <div className="divide-y">
            {currentChat.messages.map((message, index) => (
              <ChatMessage key={message.id} message={message} index={index} />
            ))}
            {isLoading && (
              <div className="flex items-center gap-4 px-4 py-6">
                <div className="h-8 w-8 rounded-md bg-muted animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                  <div className="h-4 w-64 rounded bg-muted animate-pulse" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t bg-card p-4">
        <ChatInput />
        <div className="mt-2 text-center text-xs text-muted-foreground">
          <p>Vex AI may produce inaccurate information about people, places, or facts.</p>
        </div>
      </div>
    </div>
  )
}
