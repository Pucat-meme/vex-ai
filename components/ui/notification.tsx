"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface NotificationProps {
  title: string
  description?: string
  type?: "default" | "success" | "info" | "warning" | "error"
  duration?: number
  onClose?: () => void
}

export function Notification({ title, description, type = "default", duration = 5000, onClose }: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    if (duration === Number.POSITIVE_INFINITY) return

    const startTime = Date.now()
    const endTime = startTime + duration

    const timer = setInterval(() => {
      const now = Date.now()
      const remaining = endTime - now
      const percentage = (remaining / duration) * 100

      if (remaining <= 0) {
        clearInterval(timer)
        setIsVisible(false)
        setTimeout(() => onClose?.(), 300) // Allow time for exit animation
      } else {
        setProgress(percentage)
      }
    }, 100)

    return () => clearInterval(timer)
  }, [duration, onClose])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onClose?.(), 300) // Allow time for exit animation
  }

  const typeClasses = {
    default: "bg-secondary text-secondary-foreground",
    success: "bg-green-500/20 text-green-500 dark:bg-green-500/10",
    info: "bg-blue-500/20 text-blue-500 dark:bg-blue-500/10",
    warning: "bg-yellow-500/20 text-yellow-500 dark:bg-yellow-500/10",
    error: "bg-red-500/20 text-red-500 dark:bg-red-500/10",
  }

  const progressClasses = {
    default: "bg-primary/20",
    success: "bg-green-500/50",
    info: "bg-blue-500/50",
    warning: "bg-yellow-500/50",
    error: "bg-red-500/50",
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg p-4 shadow-lg",
        typeClasses[type],
        "transition-all duration-300 ease-in-out",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
        "animate-slide-in-up",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h4 className="font-medium">{title}</h4>
          {description && <p className="mt-1 text-sm opacity-90">{description}</p>}
        </div>
        <button onClick={handleClose} className="rounded-full p-1 hover:bg-background/10">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>

      {duration !== Number.POSITIVE_INFINITY && (
        <div className="absolute bottom-0 left-0 h-1 w-full bg-background/10">
          <div className={cn("h-full transition-all", progressClasses[type])} style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  )
}
