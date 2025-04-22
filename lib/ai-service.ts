"use client"

import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

export async function generateAIResponse(messages: { role: string; content: string }[]) {
  try {
    const { text } = await generateText({
      model: groq("llama3-70b-8192"),
      messages: messages.map((msg) => ({
        role: msg.role as "user" | "assistant" | "system",
        content: msg.content,
      })),
      temperature: 0.7,
      maxTokens: 4096,
    })

    return { text }
  } catch (error) {
    console.error("Error generating AI response:", error)
    return {
      text: "I'm sorry, I encountered an error while processing your request. Please try again later.",
      error,
    }
  }
}
