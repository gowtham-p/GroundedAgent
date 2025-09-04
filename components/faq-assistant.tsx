"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Shield, Send, Bot, User, Sparkles, Lock, Key, Database, Network } from "lucide-react"

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
}

const exampleQuestions = [
  {
    icon: Lock,
    question: "How do I set up two-factor authentication?",
    category: "Authentication",
  },
  {
    icon: Key,
    question: "What makes a password secure?",
    category: "Passwords",
  },
  {
    icon: Database,
    question: "How should I backup my sensitive data?",
    category: "Data Protection",
  },
  {
    icon: Network,
    question: "Is my network properly secured?",
    category: "Network Security",
  },
]

// Simulated AI response generator - replace with real AI integration
const generateResponse = async (question: string): Promise<string> => {
  const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
  const res = await fetch(`${base}/api/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  const data = await res.json();
  return data.answer ?? "No answer returned.";
};

if (!process.env.NEXT_PUBLIC_API_BASE) {
  console.warn("NEXT_PUBLIC_API_BASE is not set; using default http://127.0.0.1:8000");
}


export function FAQAssistant() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (question: string) => {
    if (!question.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: question,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await generateResponse(question)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "I apologize, but I'm experiencing technical difficulties. Please try again in a moment.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleExampleClick = (question: string) => {
    setInput(question)
    inputRef.current?.focus()
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSubmit(input)
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 p-6 border-b bg-gradient-to-r from-slate-50 to-blue-50">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Security Assistant</h1>
          <p className="text-sm text-slate-600">Get expert guidance on security best practices</p>
        </div>
        <div className="ml-auto">
          <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
            <Sparkles className="w-3 h-3 mr-1" />
            AI-Powered
          </Badge>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-h-0">
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-6">
          {messages.length === 0 ? (
            <div className="space-y-8">
              {/* Welcome Message */}
              <div className="text-center space-y-4 py-8">
                <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900 mb-2">Welcome to Security Assistant</h2>
                  <p className="text-slate-600 max-w-md mx-auto">
                    I'm here to help you strengthen your security posture with expert guidance and best practices.
                  </p>
                </div>
              </div>

              {/* Example Questions */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-900 text-center">Popular Security Questions</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {exampleQuestions.map((example, index) => (
                    <Card
                      key={index}
                      className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] border-slate-200 hover:border-blue-300"
                      onClick={() => handleExampleClick(example.question)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100">
                            <example.icon className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <Badge variant="outline" className="text-xs mb-2 border-slate-300 text-slate-600">
                              {example.category}
                            </Badge>
                            <p className="text-sm font-medium text-slate-900 leading-relaxed">{example.question}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.type === "assistant" && (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 shadow-sm flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}

                  <div className={`max-w-[80%] ${message.type === "user" ? "order-first" : ""}`}>
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        message.type === "user"
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white ml-auto"
                          : "bg-white border border-slate-200 shadow-sm"
                      }`}
                    >
                      <p
                        className={`text-sm leading-relaxed whitespace-pre-wrap ${
                          message.type === "user" ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {message.content}
                      </p>
                    </div>
                    <p
                      className={`text-xs text-slate-500 mt-1 ${message.type === "user" ? "text-right" : "text-left"}`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  {message.type === "user" && (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 flex-shrink-0">
                      <User className="w-4 h-4 text-slate-600" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 shadow-sm">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white border border-slate-200 shadow-sm rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div
                          className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        />
                        <div
                          className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        />
                        <div
                          className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        />
                      </div>
                      <span className="text-sm text-slate-500">Analyzing your question...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t bg-white p-4">
          <form onSubmit={handleFormSubmit} className="flex gap-3">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about security best practices..."
                disabled={isLoading}
                className="pr-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
              />
              {input && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-slate-400 hover:text-slate-600"
                  onClick={() => setInput("")}
                >
                  ×
                </Button>
              )}
            </div>
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>
          <p className="text-xs text-slate-500 mt-2 text-center">Get expert security guidance powered by AI</p>
        </div>
      </div>
    </div>
  )
}

