"use client"

import { useState } from "react"
import { Card, CardContent, } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StoryText, UserSpecifications, CharacterBackground, CharacterArc, WorldLore, StoryOutline, } from "./StoryTypes"
import { AIBrainstorming } from "./aiBrainstorming"
import { CreativeProcessContent } from "./creativeProcess"
import { Sparkles, BookOpen, } from "lucide-react"
import { BrainstormingBoard } from "./BrainstormingBoard"



export function ChatGptOutput() {
  const [generatedStory, setGeneratedStory] = useState<StoryText>({ chapters: [] });
  const [userInputs, setUserInputs] = useState<UserSpecifications>(
    {
      moodType: 'carefree and lighthearted',
      philosophicalQuestions: ['free will vs destiny'],
      historicalEvents: ['atlantis sudden disappearance', 'norse ragnorok']
    });
  const [characterBackground, setCharacterBackground] = useState<CharacterBackground>({ background: "" });
  const [characterArc, setCharacterArc] = useState<CharacterArc>({ arc: "" });
  const [worldLore, setWorldLore] = useState<WorldLore>({ magicSystem: "" });
  
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("process");

  



  const handleEdit = (key: keyof UserSpecifications, value: string[] | string) => {
    setUserInputs(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col">
      <header className="bg-slate-800 py-4 px-6 shadow-md">
        <h1 className="text-3xl font-bold text-center text-teal-300">High Fantasy Cookpot</h1>
      </header>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col">
        <TabsList className="bg-slate-800 p-4 flex justify-center pb-8">
          <TabsTrigger value="process" className="data-[state=active]:bg-teal-500 data-[state=active]:text-slate-900">
            <Sparkles className="w-5 h-5 mr-2" />
            Creative Process
          </TabsTrigger>
          <TabsTrigger value="outline" className="data-[state=active]:bg-teal-500 data-[state=active]:text-slate-900">
            <BookOpen className="w-5 h-5 mr-2" />
            Story Outline
          </TabsTrigger>
        </TabsList>
        <div className="flex-grow overflow-auto p-6">
        <TabsContent value="process" className="mt-4">
        <Card className="bg-white/5 backdrop-blur-lg border-none text-slate-100 max-w-4xl mx-auto">
                       <CardContent className="p-6">
              <CreativeProcessContent
                userInputs={userInputs}
                handleEdit={handleEdit}
                worldLore={worldLore}
                characterBackground={characterBackground}
                characterArc={characterArc}
                generatedStory={generatedStory}
                selectedOption={selectedOption}
                setSelectedOption={setSelectedOption}
                setGeneratedStory={setGeneratedStory}
              setWorldLore={setWorldLore}
              setCharacterBackground={setCharacterBackground}
              setCharacterArc={setCharacterArc}
              />
            </CardContent>
            </Card>
            </TabsContent>
            <TabsContent value="outline" className="mt-4">
              <BrainstormingBoard
              userInputs={userInputs}
              worldLore={worldLore}
              characterBackground={characterBackground}
              characterArc={characterArc}
              />
            </TabsContent>
      </div>
      </Tabs>
      </div>
      
)}
