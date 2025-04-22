"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import type { Message } from "@/lib/types"
import { formatDate } from "@/lib/utils"
import { Copy, CheckCheck } from "lucide-react"
import { useStore } from "@/lib/store"
import { useNotification } from "@/components/notification-provider"
import { cn } from "@/lib/utils"

interface ChatMessageProps {
  message: Message
  index: number
}

export function ChatMessage({ message, index }: ChatMessageProps) {
  const [copied, setCopied] = useState(false)
  const { userSettings } = useStore()
  const { showNotification } = useNotification()

  const isUser = message.role === "user"

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    showNotification("Copied to clipboard", "Message content copied", "success")

    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  return (
    <div
      className={cn("group flex gap-4 px-4 py-6", isUser ? "bg-muted/50" : "bg-background", "message-appear")}
      style={{ "--index": index } as React.CSSProperties}
    >
      {/* Avatar */}
      <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-md">
        {isUser ? (
          <div className="flex h-full w-full items-center justify-center gradient-primary text-primary-foreground">
            <span className="text-sm font-semibold">U</span>
          </div>
        ) : (
          <div className="gradient-primary rounded-md">
            <Image src="/vexai.svg" alt="Vex AI" width={32} height={32} className="object-cover" />
          </div>
        )}
      </div>

      {/* Message content */}
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-medium">{isUser ? "You" : "Vex AI"}</span>
          {userSettings.showTimestamps && (
            <span className="text-xs text-muted-foreground">{formatDate(new Date(message.createdAt))}</span>
          )}
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none">
          {message.content.split("\n").map((line, i) => (
            <p key={i} className={line.trim() === "" ? "h-4" : ""}>
              {line}
            </p>
          ))}
        </div>
      </div>

      {/* Actions */}
      <button
        onClick={copyToClipboard}
        className="mt-1 h-8 w-8 shrink-0 rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground group-hover:opacity-100"
      >
        {copied ? <CheckCheck className="h-full w-full" /> : <Copy className="h-full w-full" />}
        <span className="sr-only">Copy message</span>
      </button>
    </div>
  )
}
