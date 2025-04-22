"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useStore } from "@/lib/store"
import { useNotification } from "@/components/notification-provider"
import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { PlusCircle, MessageSquare, Trash2, Settings, X, Moon, Sun, LogOut } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes"

export function Sidebar() {
  const { chats, currentChatId, createChat, setCurrentChat, deleteChat, isSidebarOpen, toggleSidebar, setSidebarOpen } =
    useStore()
  const { showNotification } = useNotification()
  const { theme, setTheme } = useTheme()
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // Fix for hydration issues with theme
  useEffect(() => {
    setMounted(true)
  }, [])

  // Detect mobile screen size with a proper hook
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  const handleCreateChat = () => {
    const newChatId = createChat()
    setCurrentChat(newChatId)
    if (isMobile) {
      setSidebarOpen(false)
    }
    showNotification("New chat created", "Start a new conversation", "success")
  }

  const handleSelectChat = (chatId: string) => {
    setCurrentChat(chatId)
    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  const handleDeleteChat = (chatId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    setIsDeleting(chatId)

    // Confirm deletion after a short delay to show the animation
    setTimeout(() => {
      deleteChat(chatId)
      setIsDeleting(null)
      showNotification("Chat deleted", "The chat has been permanently removed", "success")
    }, 300)
  }

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    showNotification(`${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} mode activated`, "", "info")
  }

  // Only render theme toggle if mounted (to prevent hydration mismatch)
  const themeToggle = mounted ? (
    <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
      {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  ) : (
    <div className="h-9 w-9"></div> // Placeholder with same dimensions
  )

  return (
    <>
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-72 flex-col border-r bg-card transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:z-0 md:translate-x-0`}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-8 w-8 overflow-hidden rounded-md">
              <Image src="/vexai.svg" alt="Vex AI Logo" width={32} height={32} className="object-cover" priority />
            </div>
            <span className="text-lg font-semibold aurora-text">Vex AI</span>
          </Link>

          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
            <X className="h-5 w-5" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        </div>

        {/* New chat button */}
        <div className="p-4">
          <Button onClick={handleCreateChat} className="w-full justify-start gap-2 aurora-button">
            <PlusCircle className="h-4 w-4" />
            New Chat
          </Button>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-auto p-2">
          {chats.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
              <MessageSquare className="mb-2 h-8 w-8" />
              <h3 className="text-sm font-medium aurora-text">No chats yet</h3>
              <p className="text-xs">Start a new conversation</p>
            </div>
          ) : (
            <ul className="space-y-1">
              {chats.map((chat) => (
                <li key={chat.id}>
                  <button
                    onClick={() => handleSelectChat(chat.id)}
                    className={`group relative flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                      chat.id === currentChatId ? "bg-primary/10 text-primary" : "hover:bg-muted"
                    } ${isDeleting === chat.id ? "animate-pulse opacity-50" : ""}`}
                  >
                    <MessageSquare className="h-4 w-4 shrink-0" />
                    <span className="line-clamp-1 flex-1">{chat.title}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(new Date(chat.updatedAt))}</span>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 h-6 w-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={(e) => handleDeleteChat(chat.id, e)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="sr-only">Delete chat</span>
                    </Button>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4">
          <div className="flex items-center justify-between">
            {themeToggle}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">Settings</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mt-4 text-center text-xs text-muted-foreground">
            <p>Powered by Groq & Aurora UI</p>
          </div>
        </div>
      </aside>
    </>
  )
}
