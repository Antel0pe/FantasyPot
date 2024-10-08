import React, { Dispatch, SetStateAction, useState } from 'react';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Minus, Maximize } from "lucide-react"; // Import additional icons
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import { v4 as uuidv4 } from 'uuid'; // Ensure uuid is installed: npm install uuid
import { BrainstormingNote } from './BrainstormingBoard';

type Message = {
    id: string;
    text: string;
    sender: Sender;
};

enum Sender {
    WRITER,
    EDITOR,
}

type User = {
    name: string;
    avatar: string;
    type: Sender;
};

const user: User = {
    name: "AI Writer",
    avatar: "/placeholder.svg?height=32&width=32",
    type: Sender.WRITER,
};

const aiAssistant: User = {
    name: "AI Editor",
    avatar: "/placeholder.svg?height=32&width=32",
    type: Sender.EDITOR,
};

type WriterResponse = {
    response: string,
    stickyNote: [{ title: string, category: string, text: string }],
};


type Props = {
    addNote: (title: string, text: string) => void
}

export function ChatWindow({ addNote }: Props) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isMinimized, setIsMinimized] = useState(false); // State to track minimization

    // API call to Writer
    const sendToWriterAPI = async (conversation: string[]): Promise<WriterResponse> => {
        const response = await fetch('/api/writer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ conversation }),
        });

        if (!response.ok) {
            throw new Error('Failed to send message to writer API');
        }

        const data = await response.json();

        return {
            response: data.response,
            stickyNote: data.stickyNote ?? []
        };
    };

    // API call to Editor
    const sendToEditorAPI = async (conversation: string[]): Promise<string> => {
        const response = await fetch('/api/editor', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ conversation }),
        });

        if (!response.ok) {
            throw new Error('Failed to send message to editor API');
        }

        const data = await response.json();
        return data.response;
    };

    const handleStickyNote = (stickyNote: [{ title: string, category: string, text: string }]) => {
        // Check if the response is a sticky note
        if (stickyNote) {
            stickyNote.forEach(note => {
                addNote(note.title, note.text);
            });
        }
    };

    const startBrainstorm = async () => {
        // Initialize conversation with current messages
        let conversation = messages.map(message => message.text);

        for (let i = 0; i < 2; i++) { // Adjust the number of iterations as needed
            try {
                // Send to Writer API
                const writerResponse = await sendToWriterAPI(conversation);
                const newWriterMessage: Message = {
                    id: uuidv4(),
                    text: writerResponse.response,
                    sender: Sender.WRITER,
                };

                setMessages(prevMessages => [...prevMessages, newWriterMessage]);
                conversation.push(writerResponse.response); // Update conversation
                handleStickyNote(writerResponse.stickyNote)

                // Wait for 2 seconds
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Send to Editor API with updated conversation
                const editorResponse = await sendToEditorAPI(conversation);
                const newEditorMessage: Message = {
                    id: uuidv4(),
                    text: editorResponse,
                    sender: Sender.EDITOR,
                };

                setMessages(prevMessages => [...prevMessages, newEditorMessage]);
                conversation.push(editorResponse); // Update conversation

                // Wait for another 2 seconds
                await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (error) {
                console.error(`Error in iteration ${i + 1}:`, error);
                // Optional: Implement retry logic or notify the user
            }
        }
    };

    const handleSendMessage = () => {
        if (input.trim() === '') return;

        const newMessage: Message = {
            id: uuidv4(),
            text: input.trim(),
            sender: Sender.WRITER,
        };

        setMessages(prevMessages => [...prevMessages, newMessage]);
        setInput('');

        // Optional: Trigger AI assistant response immediately after user sends a message
        // You can call a function here to send the updated conversation to the APIs
    };

    if (isMinimized) {
        // Render only the restore button when minimized
        return (
            <Button
                onClick={() => setIsMinimized(false)}
                className="fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-600 z-40"
                aria-label="Restore Chat Window"
            >
                <Maximize className="h-6 w-6" />
            </Button>
        );
    }

    return (
        <>
            <Card className="fixed bottom-4 right-4 w-96 h-[500px] flex flex-col bg-black backdrop-blur-lg border-none text-slate-100 z-30">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Chat Assistant</CardTitle>
                    <div className="flex space-x-2">
                        {/* Minimize Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsMinimized(true)}
                            aria-label="Minimize Chat Window"
                        >
                            <Minus className="h-4 w-4" />
                        </Button>

                    </div>
                </CardHeader>
                <CardContent className="flex-grow overflow-hidden">
                    <ScrollArea className="h-full pr-8">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`mb-4 flex ${message.sender === Sender.WRITER
                                        ? 'justify-end'
                                        : 'justify-start'
                                    }`}
                            >
                                {message.sender === Sender.EDITOR && (
                                    <Avatar className="w-8 h-8 mr-2">
                                        <AvatarImage
                                            src={aiAssistant.avatar}
                                            alt={aiAssistant.name}
                                        />
                                        <AvatarFallback>
                                            {aiAssistant.name[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                )}
                                <div className="flex flex-col">
                                    <span className="text-xs text-slate-400 mb-1">
                                        {message.sender === Sender.WRITER
                                            ? user.name
                                            : aiAssistant.name}
                                    </span>
                                    <span
                                        className={`inline-block p-2 rounded-lg ${message.sender === Sender.WRITER
                                                ? 'bg-slate-700 text-slate-100'
                                                : 'bg-slate-700 text-slate-100'
                                            }`}
                                    >
                                        {message.text}
                                    </span>
                                </div>
                                {message.sender === Sender.WRITER && (
                                    <Avatar className="w-8 h-8 ml-2">
                                        <AvatarImage src={user.avatar} alt={user.name} />
                                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))}
                    </ScrollArea>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2">
                    {/* Uncomment and use the input if needed */}
                    {/* 
                    <Input
                        placeholder="Type your message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSendMessage();
                            }
                        }}
                        className="mb-2"
                    />
                    <div className="flex space-x-2">
                        <Button
                            onClick={handleSendMessage}
                            className="bg-teal-500 hover:bg-teal-600 flex-1"
                        >
                            Send
                        </Button>
                    </div> 
                    */}
                    <Button
                        onClick={startBrainstorm}
                        className="bg-green-500 hover:bg-green-600 flex-1"
                    >
                        { messages.length === 0 ? 'Start Conversation' : 'Continue' }
                    </Button>
                </CardFooter>
            </Card>
        </>
    );
}
