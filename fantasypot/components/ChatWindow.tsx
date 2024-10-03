import React, { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, Send, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type Message = {
  id: number
  text: string
  sender: 'user' | 'ai'
}

type User = {
  name: string
  avatar: string
}

const user: User = {
  name: "Bob",
  avatar: "/placeholder.svg?height=32&width=32"
}

const aiAssistant: User = {
  name: "Flob",
  avatar: "/placeholder.svg?height=32&width=32"
}

export function ChatWindow() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { id: Date.now(), text: input, sender: 'user' }])
      setInput('')
      // Simulate AI response
      setTimeout(() => {
        setMessages(prev => [...prev, { id: Date.now(), text: "I'm Lorekeeper, your AI assistant. How can I help you with your story?", sender: 'ai' }])
      }, 1000)
    }
  }

  return (
    <>
      {!isOpen && (
        <Button
          className="fixed bottom-4 right-4 rounded-full p-4 bg-teal-500 hover:bg-teal-600 text-white"
          onClick={() => setIsOpen(true)}
        >
          <MessageCircle size={24} />
        </Button>
      )}
      {isOpen && (
        <Card className="fixed bottom-4 right-4 w-96 h-[500px] flex flex-col bg-black backdrop-blur-lg border-none text-slate-100">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Chat Assistant</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex-grow overflow-hidden">
            <ScrollArea className="h-full pr-8">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-4 flex ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.sender === 'ai' && (
                    <Avatar className="w-8 h-8 mr-2">
                      <AvatarImage src={aiAssistant.avatar} alt={aiAssistant.name} />
                      <AvatarFallback>{aiAssistant.name[0]}</AvatarFallback>
                    </Avatar>
                  )}
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400 mb-1">
                      {message.sender === 'user' ? user.name : aiAssistant.name}
                    </span>
                    <span
                      className={`inline-block p-2 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-slate-700 text-slate-100'
                          : 'bg-slate-700 text-slate-100'
                      }`}
                    >
                      {message.text}
                    </span>
                  </div>
                  {message.sender === 'user' && (
                    <Avatar className="w-8 h-8 ml-2">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
            </ScrollArea>
          </CardContent>
          <CardFooter>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="flex w-full gap-2"
            >
              <Input
                type="text"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-grow bg-transparent border-slate-700 text-slate-100"
              />
              <Button type="submit" size="icon" className="bg-teal-500 hover:bg-teal-600">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
    </>
  )
}