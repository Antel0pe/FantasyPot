import React, { useState, useRef, useEffect } from 'react'
import { motion } from "framer-motion"
import { ChatWindow } from './ChatWindow'
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Trash, RefreshCw, Save } from "lucide-react" // Imported additional icons
import { useToast } from "@/hooks/use-toast"
import { v4 as uuidv4 } from 'uuid' // Ensure you install uuid: npm install uuid

export type BrainstormingNote = {
  id: string
  title: string
  content: string
  color: string
  x: number
  y: number
  zIndex: number
  rotation: number
}

type BrainstormingBoardProps = {}

export function BrainstormingBoard(props: BrainstormingBoardProps) {
  const [notes, setNotes] = useState<BrainstormingNote[]>([]);
  const colors = ['bg-yellow-200', 'bg-green-200', 'bg-blue-200', 'bg-purple-200', 'bg-pink-200', 'bg-orange-200']
  const boardRef = useRef<HTMLDivElement>(null)
  const [boardSize, setBoardSize] = useState({ width: 800, height: 600 }) // Provide default sizes
  const { toast } = useToast()
  const [zCounter, setZCounter] = useState(1) // To manage zIndex

  useEffect(() => {
    const updateBoardSize = () => {
      if (boardRef.current) {
        setBoardSize({
          width: boardRef.current.offsetWidth,
          height: boardRef.current.offsetHeight
        })
      }
    }

    updateBoardSize()
    window.addEventListener('resize', updateBoardSize)
    return () => window.removeEventListener('resize', updateBoardSize)
  }, [])

  const addNote = (title: string = 'New Note', text: string = 'Your content here') => {
    setNotes(prevNotes => {
      const newNote: BrainstormingNote = {
        id: uuidv4(),
        title: title,
        content: text,
        color: colors[Math.floor(Math.random() * colors.length)],
        x: Math.random() * (boardSize.width - 300) || 0, // Adjusted to maxWidth of 300px
        y: Math.random() * (boardSize.height - 200) || 0,
        zIndex: zCounter,
        rotation: (Math.floor(Math.random() * 3) - 1) * 5 // Rotations: -5°, 0°, +5°
      }
      setZCounter(prev => prev + 1)
      console.log(prevNotes, newNote)
      return [...prevNotes, newNote]
    })
  }

  const updateNote = (id: string, title: string, content: string) => {
    setNotes(prevNotes => prevNotes.map(note => 
      note.id === id ? { ...note, title, content } : note
    ))
  }

  const deleteNote = (id: string) => {
    setNotes(prevNotes => prevNotes.filter(note => note.id !== id))
    toast({
      title: "Note deleted",
      description: "Your idea has been removed from the board.",
    })
  }

  const clearBoard = () => {
    setNotes([])
    toast({
      title: "Board cleared",
      description: "All notes have been removed from the board.",
    })
  }

  const saveBoard = () => {
    const dataStr = JSON.stringify(notes, null, 2)
    const blob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'brainstorming_board.json'
    a.click()
    URL.revokeObjectURL(url)
    toast({
      title: "Board saved",
      description: "Your board has been saved as a JSON file.",
    })
  }

  const bringToFront = (id: string) => {
    setNotes(prevNotes => prevNotes.map(note => 
      note.id === id ? { ...note, zIndex: zCounter } : note
    ))
    setZCounter(prev => prev + 1)
  }

  return (
    <div 
      ref={boardRef} 
      className="relative min-h-[600px] bg-slate-100 p-8 rounded-lg shadow-inner overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0 bg-[url('/cork-board.jpg')] bg-cover bg-center opacity-50"></div>

      {/* Toolbar */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-white bg-opacity-80 p-2 rounded shadow-md z-10">
        <Button
          variant="default"
          size="sm"
          className="flex items-center"
          onClick={() => addNote()}
          aria-label="Add Note"
        >
          <Plus className="h-4 w-4 mr-1" /> Add Note
        </Button>
        <Button
          variant="default"
          size="sm"
          className="flex items-center"
          onClick={clearBoard}
          aria-label="Clear Board"
        >
          <Trash className="h-4 w-4 mr-1" /> Clear Board
        </Button>
        <Button
          variant="default"
          size="sm"
          className="flex items-center"
          onClick={saveBoard}
          aria-label="Save Board"
        >
          <Save className="h-4 w-4 mr-1" /> Save Board
        </Button>
        {/* Add more toolbar buttons here as needed */}
      </div>

      {/* Notes Container */}
      <div className="relative h-full">
        {notes.map((note) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, x: note.x, y: note.y }}
            transition={{ duration: 0.3 }}
            drag
            dragConstraints={boardRef}
            dragElastic={0.1}
            onDragEnd={(_, info) => {
              if (boardRef.current) {
                const boardRect = boardRef.current.getBoundingClientRect()
                const newX = info.point.x - boardRect.left - 150 // Half of maxWidth (300px / 2)
                const newY = info.point.y - boardRect.top - 100 // Half of maxHeight (200px / 2)
                setNotes(prevNotes => prevNotes.map(n => n.id === note.id ? { ...n, x: newX, y: newY } : n))
              }
            }}
            className="absolute cursor-move"
            style={{ zIndex: note.zIndex }}
            onMouseDown={() => bringToFront(note.id)}
          >
            <div 
              className={`${note.color} p-4 rounded-lg shadow-md transition-all duration-200 hover:shadow-xl max-w-xs`}
              style={{
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
                transform: `rotate(${note.rotation}deg)`,
                minWidth: '150px',
                maxWidth: '300px',
                minHeight: '100px'
              }}
            >
              <input
                className="text-lg font-bold mb-2 text-slate-800 bg-transparent border-none focus:outline-none w-full"
                value={note.title}
                onChange={(e) => updateNote(note.id, e.target.value, note.content)}
                placeholder="Title"
                aria-label="Note Title"
              />
              <textarea
                className="text-sm text-slate-700 bg-transparent border-none focus:outline-none w-full resize"
                value={note.content}
                onChange={(e) => updateNote(note.id, note.title, e.target.value)}
                rows={Math.max(3, Math.ceil(note.content.length / 40))}
                placeholder="Your ideas..."
                style={{ overflow: 'auto', resize: 'vertical' }}
                aria-label="Note Content"
              />
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-slate-600 hover:text-red-600"
                onClick={() => deleteNote(note.id)}
                aria-label="Delete Note"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Note Button (Optional: Remove if moving all buttons to toolbar) */}
      {/* <Button
        className="absolute bottom-4 left-4 bg-teal-500 hover:bg-teal-600 text-white flex items-center"
        onClick={() => addNote('New Note', 'Your content here')}
        aria-label="Add Note"
      >
        <Plus className="h-4 w-4 mr-2" /> Add Note
      </Button> */}

      {/* Chat Window */}
      <div className="absolute bottom-4 right-4">
        <ChatWindow addNote={addNote} />
      </div>
    </div>
  )
}
