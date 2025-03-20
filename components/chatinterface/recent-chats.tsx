
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from "@/components/ui/button"

const questions = [
  "What is the main issue discussed in the text?",
  "Is the \"old implicit compact\" mentioned in the text?",
  "Who are the authors of the text?",
  "What is the goal of the authors?",
  "What is the role of leaders in addressing the issue?"
]

export default function RecentChats() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="w-[255px]">
      {/* Single container for both button and chat items */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden relative border">
        {/* Button to toggle the state */}
        <Button
          variant="default"
          className="relative z-10 justify-between bg-white font-rubik text-gray-900 text-md hover:bg-gray-50 h-[54px] px-6 w-full"
          onClick={() => setIsOpen(!isOpen)}
        >
          Recent Chat
          {isOpen ? (
            <ChevronUp className="icon p-1.5 rounded-lg bg-[#553C9A] text-white" />
          ) : (
            <ChevronDown className="icon p-1.5 rounded-lg bg-[#553C9A] text-white" />
          )}
        </Button>

        {/* Motion div for the content that expands and collapses */}
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: isOpen ? "auto" : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="overflow-hidden relative z-10"
        >
          <div className="p-4 space-y-3 border-black">
            {questions.map((question, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg hover:bg-[#e9e8e8] font-rubik text-gray-800`}
              >
                <p>
                  <span className="font-semibold">{index + 1}.</span> {question}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
