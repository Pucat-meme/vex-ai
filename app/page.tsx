"use client"

import { useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { ChatInterface } from "@/components/chat-interface"
import { NotificationProvider } from "@/components/notification-provider"
import { useStore } from "@/lib/store"

export default function Home() {
  const { isSidebarOpen, setSidebarOpen } = useStore()

  // Handle responsive sidebar behavior on initial load and resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true)
      } else {
        setSidebarOpen(false)
      }
    }

    // Set initial state
    handleResize()

    // Add event listener
    window.addEventListener("resize", handleResize)

    // Clean up
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [setSidebarOpen])

  return (
    <NotificationProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />

        <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "md:ml-72" : ""}`}>
          <ChatInterface />
        </main>
      </div>
    </NotificationProvider>
  )
}
