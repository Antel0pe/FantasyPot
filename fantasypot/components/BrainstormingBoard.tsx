import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { UserSpecifications, WorldLore, CharacterBackground, CharacterArc } from "./StoryTypes"
import { ChatWindow } from './ChatWindow'

export type BrainstormingNote = {
  id: string
  title: string
  content: string
  color: string
}

type BrainstormingBoardProps = {
}


export function BrainstormingBoard(props: BrainstormingBoardProps) {
  const [notes, setNotes] = useState<BrainstormingNote[]>([]);
  const colors = ['bg-yellow-200', 'bg-green-200', 'bg-blue-200', 'bg-purple-200', 'bg-pink-200', 'bg-orange-200']

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {notes.map((note) => (
        <motion.div
          key={note.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: Number(note.id) * 0.1 }}
        >
          <Card className={`${colors[Math.floor(Math.random() * colors.length)]} text-slate-800 transform rotate-${Math.floor(Math.random() * 5) - 2} hover:rotate-0 transition-transform duration-200 shadow-lg hover:shadow-xl`}>
            <CardHeader>
              <CardTitle className="text-lg font-bold">{note.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{note.content}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}

      <ChatWindow setBrainstormNotes={setNotes} />
    </div>
  )
}