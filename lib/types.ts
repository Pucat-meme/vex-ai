export interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  createdAt: Date
}

export interface Chat {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

export interface UserSettings {
  theme: "light" | "dark" | "system"
  fontSize: "small" | "medium" | "large"
  showTimestamps: boolean
}
