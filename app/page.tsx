"use client"
import { FAQAssistant } from "@/components/faq-assistant"

interface Question {
  id: string
  question: string
  answer: string
  timestamp: Date
}

function AppSidebar({
  questions,
  onQuestionSelect,
}: { questions: Question[]; onQuestionSelect: (question: Question) => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="container mx-auto h-screen flex flex-col">
        <FAQAssistant />
      </div>
    </div>
  )
}

export default function SecurityFAQApp() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="container mx-auto h-screen flex flex-col">
        <FAQAssistant />
      </div>
    </div>
  )
}
