"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, BookOpen, Cloud } from "lucide-react"

type Props = {
    items: string[],
    selectedOption: string | null,
    setSelectedOption: (value: string | null) => void,
}

const icons = [
  (key: number) => <Cloud className="w-5 h-5" key={key} />,
  (key: number) => <BookOpen className="w-5 h-5" key={key} />,
  (key: number) => <Sparkles className="w-5 h-5" key={key} />
]

export default function Component({ items, selectedOption, setSelectedOption }: Props) {
  const handleOptionClick = (value: string) => {
    setSelectedOption(value === selectedOption ? null : value)
  }

  return (
    <Card className="w-full bg-white/5 backdrop-blur-lg border-none text-slate-100">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-teal-300">Choose an Option</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {items && items.map((item, idx) => (
          <Button
            key={item}
            onClick={() => handleOptionClick(item)}
            className={`flex items-center justify-start p-4 h-auto text-left ${
                selectedOption === item
                  ? "bg-teal-500 text-slate-900 hover:bg-slate-800 hover:text-teal-300"
                  : "bg-white/10 hover:bg-white/20"
              }`}
          >
            <div className="mr-4">{icons[Math.floor(Math.random() * icons.length)](idx)}</div>
            <div className="text-wrap">
              <h3 className="font-semibold">{"Option " + (idx+1)}</h3>
              <p className="text-sm mt-1 opacity-90">{item}</p>
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}