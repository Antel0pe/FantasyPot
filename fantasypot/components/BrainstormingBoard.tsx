import React, { useState, useRef } from 'react';
import { ChatWindow } from './ChatWindow';
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Trash, RefreshCw, Save } from "lucide-react"; // Imported additional icons
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid'; // Ensure you install uuid: npm install uuid

export type BrainstormingNote = {
  id: string;
  title: string;
  content: string;
  color: string;
  topics: string[]; // Updated to an array of topics
}

type BrainstormingBoardProps = {}

export function BrainstormingBoard(props: BrainstormingBoardProps) {
  const [notes, setNotes] = useState<BrainstormingNote[]>([]);
  const colors = ['bg-yellow-200', 'bg-green-200', 'bg-blue-200', 'bg-purple-200', 'bg-pink-200', 'bg-orange-200'];
  const boardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const addNote = (title: string = 'New Note', text: string = 'Your content here') => {
    const newNote: BrainstormingNote = {
      id: uuidv4(),
      title: title,
      content: text,
      color: colors[Math.floor(Math.random() * colors.length)],
      topics: [] // Initially no topics
    };
    console.log("Adding note:", newNote);
    setNotes(prevNotes => [...prevNotes, newNote]);
  };

  const updateNote = (id: string, title: string, content: string) => {
    setNotes(prevNotes => prevNotes.map(note => 
      note.id === id ? { ...note, title, content } : note
    ));
  };

  const deleteNote = (id: string) => {
    setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
    toast({
      title: "Note deleted",
      description: "Your idea has been removed from the board.",
    });
  };

  const clearBoard = () => {
    setNotes([]);
    toast({
      title: "Board cleared",
      description: "All notes have been removed from the board.",
    });
  };

  const saveBoard = () => {
    const dataStr = JSON.stringify(notes, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'brainstorming_board.json';
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Board saved",
      description: "Your board has been saved as a JSON file.",
    });
  };

  const organizeNotes = async () => {
    try {
      const response = await fetch('/api/notes/organize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notes })
      });
      if (!response.ok) throw new Error('Failed to organize notes');

      // Define the expected structure of organizedNotes
      const { organizedNotes }: { organizedNotes: { id: string; title: string; content: string; category: string[] }[] } = await response.json();

      // Map 'category' to 'topics' and preserve 'color'
      const updatedNotes: BrainstormingNote[] = organizedNotes.map(organizedNote => {
        const existingNote = notes.find(note => note.id === organizedNote.id);
        let topics: string[] = [];

        if (organizedNote.category) {
          topics = organizedNote.category;
        } else {
          topics = ["Uncategorized"];
        }

        return {
          id: organizedNote.id,
          title: organizedNote.title,
          content: organizedNote.content,
          color: existingNote?.color || colors[Math.floor(Math.random() * colors.length)],
          topics: topics
        };
      });

      setNotes(updatedNotes);
      toast({
        title: "Notes Organized",
        description: "Your notes have been organized by topics.",
      });
    } catch (error) {
      console.error("Error organizing notes:", error);
      toast({
        title: "Error",
        description: "Unable to organize notes. Please try again.",
      });
    }
  };

  // Group notes by topics
  const groupedNotes = notes.reduce((groups, note) => {
    const topics: string[] = note.topics.length > 0 ? note.topics : ["Uncategorized"];

    topics.forEach((t) => {
      if (!groups[t]) {
        groups[t] = [];
      }
      groups[t].push(note);
    });

    return groups;
  }, {} as Record<string, BrainstormingNote[]>);

  // Sort the topics, ensuring "Uncategorized" is first
  const sortedTopics = () => {
    let sortedTopics= Object.entries(groupedNotes);

    // Ensure "Uncategorized" is present
    if (!sortedTopics.some((t) => t[0] === 'Uncategorized')) {
      sortedTopics.push(['Uncategorized', []])
    }

    // Sort topics with "Uncategorized" first, then alphabetically
    sortedTopics.sort((a, b) => {
      if (a[0] === "Uncategorized") return -1;
      if (b[0] === "Uncategorized") return 1;
      return a[0].localeCompare(b[0]);
    });

    return sortedTopics;
  };

  return (
    <div 
      ref={boardRef} 
      className="relative min-h-[600px] bg-slate-100 p-8 rounded-lg shadow-inner overflow-auto"
    >
      {/* Background Image */}
      <div className="absolute inset-0 bg-[url('/cork-board.jpg')] bg-cover bg-center opacity-50 pointer-events-none"></div>

      {/* Toolbar */}
      <div className="fixed left-1/2 transform -translate-x-1/2 flex space-x-2 bg-white bg-opacity-80 p-2 rounded shadow-md z-30 max-w-4xl">
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
        <Button
          variant="default"
          size="sm"
          className="flex items-center"
          onClick={organizeNotes}
          aria-label="Organize Notes"
        >
          <RefreshCw className="h-4 w-4 mr-1" /> Organize Notes
        </Button>
        {/* Add more toolbar buttons here as needed */}
      </div>

      {/* Notes Organized by Topics */}
      <div className="relative z-10 pt-20"> {/* Added top padding to prevent overlap with fixed toolbar */}
        {sortedTopics().length > 0 ? (
          sortedTopics().map((topic) => (
            <div key={topic[0]} className="mb-6">
              <h3 className="text-2xl font-semibold mb-4">{topic[0]}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {topic[1].map(note => (
                  <div 
                    key={note.id}
                    className={`${note.color} p-4 rounded-lg shadow-md transition-all duration-200 hover:shadow-xl`}
                    style={{
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
                      transform: 'none' // Removed rotation as per original code
                    }}
                  >
                    {note.topics.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-1">
                        {note.topics.map((t, index) => (
                          <span key={index} className="text-xs font-semibold bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                    <input
                      className="text-lg font-bold mb-2 text-slate-800 bg-transparent border-b-2 border-gray-300 focus:outline-none w-full"
                      value={note.title}
                      onChange={(e) => updateNote(note.id, e.target.value, note.content)}
                      placeholder="Title"
                      aria-label="Note Title"
                    />
                    <textarea
                      className="text-sm text-slate-700 bg-transparent border-none focus:outline-none w-full resize-none"
                      value={note.content}
                      onChange={(e) => updateNote(note.id, e.target.value, note.content)}
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
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 mt-10">
            No notes available. Click &quot;Add Note&quot; to get started!
          </div>
        )}
      </div>

      {/* Chat Window */}
      <div className="absolute bottom-4 right-4">
        <ChatWindow addNote={addNote} />
      </div>
    </div>
  );
}
