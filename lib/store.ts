"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Chat, Message, UserSettings } from "./types"
import { generateId } from "./utils"

interface ChatState {
  chats: Chat[]
  currentChatId: string | null
  userSettings: UserSettings
  isLoading: boolean
  isSidebarOpen: boolean

  // Actions
  createChat: () => string
  setCurrentChat: (chatId: string) => void
  addMessage: (chatId: string, message: Omit<Message, "id" | "createdAt">) => void
  updateChatTitle: (chatId: string, title: string) => void
  deleteChat: (chatId: string) => void
  clearChats: () => void
  updateUserSettings: (settings: Partial<UserSettings>) => void
  setLoading: (isLoading: boolean) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
}

export const useStore = create<ChatState>()(
  persist(
    (set, get) => ({
      chats: [],
      currentChatId: null,
      userSettings: {
        theme: "dark",
        fontSize: "medium",
        showTimestamps: true,
      },
      isLoading: false,
      isSidebarOpen: true,

      createChat: () => {
        const newChat: Chat = {
          id: generateId(),
          title: "New Chat",
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        set((state) => ({
          chats: [newChat, ...state.chats],
          currentChatId: newChat.id,
        }))

        return newChat.id
      },

      setCurrentChat: (chatId) => {
        set({ currentChatId: chatId })
      },

      addMessage: (chatId, messageData) => {
        const message: Message = {
          id: generateId(),
          ...messageData,
          createdAt: new Date(),
        }

        set((state) => {
          const updatedChats = state.chats.map((chat) => {
            if (chat.id === chatId) {
              // Update chat title if it's the first user message and title is still default
              let title = chat.title
              if (chat.title === "New Chat" && messageData.role === "user" && chat.messages.length === 0) {
                title = messageData.content.slice(0, 30)
                if (messageData.content.length > 30) title += "..."
              }

              return {
                ...chat,
                title,
                messages: [...chat.messages, message],
                updatedAt: new Date(),
              }
            }
            return chat
          })

          return { chats: updatedChats }
        })
      },

      updateChatTitle: (chatId, title) => {
        set((state) => ({
          chats: state.chats.map((chat) => (chat.id === chatId ? { ...chat, title } : chat)),
        }))
      },

      deleteChat: (chatId) => {
        set((state) => {
          const filteredChats = state.chats.filter((chat) => chat.id !== chatId)
          const newCurrentChatId =
            state.currentChatId === chatId
              ? filteredChats.length > 0
                ? filteredChats[0].id
                : null
              : state.currentChatId

          return {
            chats: filteredChats,
            currentChatId: newCurrentChatId,
          }
        })
      },

      clearChats: () => {
        set({ chats: [], currentChatId: null })
      },

      updateUserSettings: (settings) => {
        set((state) => ({
          userSettings: { ...state.userSettings, ...settings },
        }))
      },

      setLoading: (isLoading) => {
        set({ isLoading })
      },

      toggleSidebar: () => {
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen }))
      },

      setSidebarOpen: (open: boolean) => {
        set({ isSidebarOpen: open })
      },
    }),
    {
      name: "vex-ai-storage",
    },
  ),
)
