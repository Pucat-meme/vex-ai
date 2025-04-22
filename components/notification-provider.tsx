"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"
import { Notification } from "@/components/ui/notification"

type NotificationType = "default" | "success" | "info" | "warning" | "error"

interface NotificationItem {
  id: string
  title: string
  description?: string
  type: NotificationType
  duration: number
}

interface NotificationContextType {
  notifications: NotificationItem[]
  showNotification: (title: string, description?: string, type?: NotificationType, duration?: number) => string
  dismissNotification: (id: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])

  const showNotification = useCallback(
    (title: string, description?: string, type: NotificationType = "default", duration = 5000) => {
      const id = Math.random().toString(36).substring(2, 9)

      setNotifications((prev) => [...prev, { id, title, description, type, duration }])

      return id
    },
    [],
  )

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }, [])

  return (
    <NotificationContext.Provider value={{ notifications, showNotification, dismissNotification }}>
      {children}
      <div className="fixed bottom-0 right-0 z-50 flex max-h-screen w-full max-w-sm flex-col gap-2 p-4 overflow-hidden">
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            title={notification.title}
            description={notification.description}
            type={notification.type}
            duration={notification.duration}
            onClose={() => dismissNotification(notification.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)

  if (context === undefined) {
    throw new Error("useNotification must be used within a NotificationProvider")
  }

  return context
}
