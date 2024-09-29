"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sparkles, Clock, BarChart, BookOpen, Brain, HelpCircle, Cloud, Edit2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"

type CardData = {
  summary: string
  sentiment: string
  wordCount: number
  readingTime: string
  keyPoints: string[]
  potentialQuestions: string[]
  wordCloud: string[]
  fullText: string
}

export function ChatGptOutput() {
  const [loading, setLoading] = useState(false)
  const [cardData, setCardData] = useState<Partial<CardData>>({})

  const simulateApiCall = (delay: number) => new Promise(resolve => setTimeout(resolve, delay))

  const fetchCardData = async () => {
    const data: CardData = {
      summary: "",
      sentiment: "",
      wordCount: 0,
      readingTime: "",
      keyPoints: [],
      potentialQuestions: [],
      wordCloud: [],
      fullText: ""
    }

    // Simulate fetching data with different delays
    await simulateApiCall(1000)
    setCardData(prev => ({ ...prev, summary: "A brief summary of the generated text..." }))

    await simulateApiCall(500)
    setCardData(prev => ({ ...prev, sentiment: "Positive" }))

    await simulateApiCall(800)
    setCardData(prev => ({ ...prev, wordCount: 500 }))

    await simulateApiCall(300)
    setCardData(prev => ({ ...prev, readingTime: "2 minutes" }))

    await simulateApiCall(1500)
    setCardData(prev => ({ ...prev, keyPoints: [
      "Main idea 1",
      "Important concept 2",
      "Critical point 3",
      "Significant detail 4"
    ]}))

    await simulateApiCall(1200)
    setCardData(prev => ({ ...prev, potentialQuestions: [
      "What are the implications of X?",
      "How does Y relate to Z?",
      "Can you elaborate on the concept of A?",
      "What evidence supports claim B?"
    ]}))

    await simulateApiCall(700)
    setCardData(prev => ({ ...prev, wordCloud: [
      "AI", "Technology", "Innovation", "Ethics", "Future", "Data", "Learning", "Algorithms", "Neural Networks", "Robotics"
    ]}))

    await simulateApiCall(2000)
    setCardData(prev => ({ ...prev, fullText: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, vitae aliquam nisl nunc vitae nisl. ".repeat(20) }))

    return data
  }

  const handleGenerateOutput = async () => {
    setLoading(true)
    setCardData({})
    await fetchCardData()
    setLoading(false)
  }

  const handleEdit = (key: keyof CardData, value: any) => {
    setCardData(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8 flex flex-col items-center justify-center">
      <Card className="w-full max-w-4xl bg-white/5 backdrop-blur-lg border-none text-slate-100">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-teal-300">ChatGPT Output Visualizer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button
            onClick={handleGenerateOutput}
            disabled={loading}
            className="w-full bg-teal-500 hover:bg-teal-600 text-slate-900 font-bold py-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-lg"
          >
            {loading ? "Generating..." : "Generate ChatGPT Output"}
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(loading || cardData.summary !== undefined) && (
              <EditableCard
                icon={<Sparkles className="w-5 h-5 text-yellow-400" />}
                title="Summary"
                value={cardData.summary}
                onChange={(value) => handleEdit("summary", value)}
                loading={loading && cardData.summary === undefined}
              />
            )}
            {(loading || cardData.sentiment !== undefined) && (
              <EditableCard
                icon={<BarChart className="w-5 h-5 text-blue-400" />}
                title="Sentiment"
                value={cardData.sentiment}
                onChange={(value) => handleEdit("sentiment", value)}
                loading={loading && cardData.sentiment === undefined}
              />
            )}
            {(loading || cardData.wordCount !== undefined) && (
              <EditableCard
                icon={<BookOpen className="w-5 h-5 text-green-400" />}
                title="Word Count"
                value={cardData.wordCount?.toString()}
                onChange={(value) => handleEdit("wordCount", parseInt(value) || 0)}
                loading={loading && cardData.wordCount === undefined}
              />
            )}
            {(loading || cardData.readingTime !== undefined) && (
              <EditableCard
                icon={<Clock className="w-5 h-5 text-purple-400" />}
                title="Reading Time"
                value={cardData.readingTime}
                onChange={(value) => handleEdit("readingTime", value)}
                loading={loading && cardData.readingTime === undefined}
              />
            )}
          </div>

          {(loading || cardData.keyPoints !== undefined) && (
            <EditableListCard
              icon={<Brain className="w-5 h-5" />}
              title="Key Points Considered"
              items={cardData.keyPoints || []}
              onChange={(value) => handleEdit("keyPoints", value)}
              loading={loading && cardData.keyPoints === undefined}
            />
          )}

          {(loading || cardData.potentialQuestions !== undefined) && (
            <EditableListCard
              icon={<HelpCircle className="w-5 h-5" />}
              title="Potential Questions"
              items={cardData.potentialQuestions || []}
              onChange={(value) => handleEdit("potentialQuestions", value)}
              loading={loading && cardData.potentialQuestions === undefined}
            />
          )}

          {(loading || cardData.wordCloud !== undefined) && (
            <EditableListCard
              icon={<Cloud className="w-5 h-5" />}
              title="Word Cloud"
              items={cardData.wordCloud || []}
              onChange={(value) => handleEdit("wordCloud", value)}
              loading={loading && cardData.wordCloud === undefined}
              renderItems={(items) => (
                <div className="flex flex-wrap gap-2">
                  {items.map((word, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-white/20 rounded-full text-sm"
                      style={{ fontSize: `${Math.random() * 0.5 + 0.75}rem`, color: `hsl(${Math.random() * 360}, 70%, 80%)` }}
                    >
                      {word}
                    </span>
                  ))}
                </div>
              )}
            />
          )}

          {(loading || cardData.fullText !== undefined) && (
            <Card className="bg-white/10 border-none">
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center gap-2 text-teal-300">
                  <BookOpen className="w-5 h-5" />
                  Full Text Output
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading && cardData.fullText === undefined ? (
                  <Skeleton className="w-full h-[300px] bg-white/10" />
                ) : (
                  <Textarea
                    className="h-[300px] w-full rounded-md border border-slate-700 bg-transparent p-4 text-sm leading-relaxed text-slate-300"
                    value={cardData.fullText}
                    onChange={(e) => handleEdit("fullText", e.target.value)}
                  />
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function EditableCard({ icon, title, value, onChange, loading }: {
  icon: React.ReactNode
  title: string
  value?: string
  onChange: (value: string) => void
  loading: boolean
}) {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <Card className="bg-white/10 border-none">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-teal-300">
          {icon}
          {title}
        </CardTitle>
        {!loading && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsEditing(!isEditing)}
            className="hover:bg-teal-500/20"
          >
            <Edit2 className="h-5 w-5 text-teal-300" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="w-full h-8 bg-white/10" />
        ) : isEditing ? (
          <Input
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="bg-transparent border-slate-700 text-slate-100"
          />
        ) : (
          <p className="text-2xl font-bold text-slate-100">{value}</p>
        )}
      </CardContent>
    </Card>
  )
}

function EditableListCard({ icon, title, items, onChange, loading, renderItems }: {
  icon: React.ReactNode
  title: string
  items: string[]
  onChange: (items: string[]) => void
  loading: boolean
  renderItems?: (items: string[]) => React.ReactNode
}) {
  const [isEditing, setIsEditing] = useState(false)

  const handleItemChange = (index: number, value: string) => {
    const newItems = [...items]
    newItems[index] = value
    onChange(newItems)
  }

  const handleAddItem = () => {
    onChange([...items, ""])
  }

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index)
    onChange(newItems)
  }

  return (
    <Card className="bg-white/10 border-none">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-semibold flex items-center gap-2 text-teal-300">
          {icon}
          {title}
        </CardTitle>
        {!loading && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsEditing(!isEditing)}
            className="hover:bg-teal-500/20"
          >
            <Edit2 className="h-5 w-5 text-teal-300" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="w-full h-[100px] bg-white/10" />
        ) : isEditing ? (
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={item}
                  onChange={(e) => handleItemChange(index, e.target.value)}
                  className="bg-transparent border-slate-700 text-slate-100"
                />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleRemoveItem(index)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleAddItem}
              className="text-teal-300 border-teal-300 hover:bg-teal-500/20"
            >
              Add Item
            </Button>
          </div>
        ) : renderItems ? (
          renderItems(items)
        ) : (
          <ul className="list-disc list-inside space-y-1">
            {items.map((item, index) => (
              <li key={index} className="text-sm text-slate-300">{item}</li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}