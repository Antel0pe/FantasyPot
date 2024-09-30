"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Clock, BarChart, BookOpen, Brain, HelpCircle, Cloud } from "lucide-react"



const icons = [
  <Cloud className="w-5 h-5" />,
  <BookOpen className="w-5 h-5" />,
  <Sparkles className="w-5 h-5" />
]

type Props = {
    items: string[]
}

export default function Component({ items }: Props) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)

  const handleOptionClick = (value: string) => {
    setSelectedOption(value === selectedOption ? null : value)
  }

  return (
    <Card className="w-full bg-white/5 backdrop-blur-lg border-none text-slate-100">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-teal-300">Choose an Option</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {items.map((item, idx) => (
          <Button
            key={item}
            onClick={() => handleOptionClick(item)}
            className={`flex items-center justify-start p-4 h-auto text-left ${
                selectedOption === item
                  ? "bg-teal-500 text-slate-900 hover:bg-slate-800 hover:text-teal-300"
                  : "bg-white/10 hover:bg-white/20"
              }`}
          >
            <div className="mr-4">{icons[Math.floor(Math.random() * icons.length)]}</div>
            <div>
              <h3 className="font-semibold">{"Option " + (idx+1)}</h3>
              <p className="text-sm mt-1 opacity-90">{item}</p>
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}