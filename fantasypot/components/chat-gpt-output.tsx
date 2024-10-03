"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { EditableCard } from "./EditableCard"
import { EditableListCard } from "./EditableListCard"
import { StoryText, GeneratedText, UserSpecifications, CharacterBackground, CharacterArc, WorldLore, StoryOutline, LoadingComponent } from "./StoryTypes"
import { AIBrainstorming } from "./aiBrainstorming"
import { CreativeProcessContent } from "./creativeProcess"
import { preprocessMarkdown } from "@/utils/markdownPreprocessor"
import { Sparkles, BookOpen, Clock, BarChart, HelpCircle, Cloud, Edit2, Feather, Scroll } from "lucide-react"
import { Input } from "postcss"
import { Button } from "./ui/button"
import { Skeleton } from "./ui/skeleton"
import { Textarea } from "./ui/textarea"



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
  const [storyOutline, setStoryOutline] = useState<StoryOutline | null>(null);
  
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
              <AIBrainstorming
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



{/* <Card className="w-full max-w-4xl bg-white/5 backdrop-blur-lg border-none text-slate-100">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-teal-300">High Fantasy Cookpot</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6"> */}
          {/* <Button
            onClick={() => handleGenerateNonStoryOutput(fetchWorldLore, LoadingComponent.WORLD_LORE)}
            disabled={loading !== LoadingComponent.NOTHING}
            className="w-full bg-teal-500 hover:bg-teal-600 text-slate-900 font-bold py-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-lg"
          >
            {loading !== LoadingComponent.NOTHING ? "Generating..." : "Start cooking a story"}
          </Button> */}
{/* <div className="flex-grow overflow-auto p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="process">Creative Process</TabsTrigger>
              <TabsTrigger value="outline">Story Outline</TabsTrigger>
            </TabsList>
            <TabsContent value="process" className="mt-4">
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
            </TabsContent>
            <TabsContent value="outline" className="mt-4">
              <AIBrainstorming
              userInputs={userInputs}
              worldLore={worldLore}
              characterBackground={characterBackground}
              characterArc={characterArc}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div> */}
  // )





// "use client"

// import { useState } from "react"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Skeleton } from "@/components/ui/skeleton"
// import { Clock, BarChart, BookOpen, HelpCircle, Cloud, Edit2, Feather, Scroll, Sparkles } from "lucide-react"
// import { Textarea } from "@/components/ui/textarea"
// import { Input } from "@/components/ui/input"
// import OptionCard from "./option-card"
// import MarkdownDisplay from "./MarkdownDisplay"
// import { preprocessMarkdown } from "@/utils/markdownPreprocessor"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Badge } from "@/components/ui/badge"
// import { EditableCard } from "./EditableCard"
// import { EditableListCard } from "./EditableListCard"
// import { StoryText, GeneratedText, UserSpecifications, CharacterBackground, CharacterArc, WorldLore, StoryOutline, LoadingComponent } from "./StoryTypes"
// import { AIBrainstorming } from "./aiBrainstorming"
// import { CreativeProcessContent } from "./creativeProcess"

// export function ChatGptOutput() {
//   const [generatedStory, setGeneratedStory] = useState<StoryText>({ chapters: [] });
//   const [userInputs, setUserInputs] = useState<UserSpecifications>(
//     {
//       moodType: 'carefree and lighthearted',
//       philosophicalQuestions: ['free will vs destiny'],
//       historicalEvents: ['atlantis sudden disappearance', 'norse ragnorok']
//     });
//   const [characterBackground, setCharacterBackground] = useState<CharacterBackground>({ background: "" });
//   const [characterArc, setCharacterArc] = useState<CharacterArc>({ arc: "" });
//   const [worldLore, setWorldLore] = useState<WorldLore>({ magicSystem: "" });
//   const [storyOutline, setStoryOutline] = useState<StoryOutline | null>(null);
  
//   const [selectedOption, setSelectedOption] = useState<string | null>(null);
//   const [activeTab, setActiveTab] = useState("process");

//   const handleEdit = (key: keyof UserSpecifications, value: string[] | string) => {
//     setUserInputs(prev => ({ ...prev, [key]: value }))
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col">
//       <header className="bg-slate-800 py-4 px-6 shadow-md">
//         <h1 className="text-3xl font-bold text-center text-teal-300">High Fantasy Cookpot</h1>
//       </header>
//       <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col">
//         <TabsList className="bg-slate-800 p-2 flex justify-center">
//           <TabsTrigger value="process" className="data-[state=active]:bg-teal-500 data-[state=active]:text-slate-900">
//             <Sparkles className="w-5 h-5 mr-2" />
//             Creative Process
//           </TabsTrigger>
//           <TabsTrigger value="outline" className="data-[state=active]:bg-teal-500 data-[state=active]:text-slate-900">
//             <BookOpen className="w-5 h-5 mr-2" />
//             Story Outline
//           </TabsTrigger>
//         </TabsList>
//         <div className="flex-grow overflow-auto p-6">
//           <TabsContent value="process" className="mt-0">
//             <Card className="bg-white/5 backdrop-blur-lg border-none text-slate-100 max-w-4xl mx-auto">
//               <CardContent className="p-6">
//                 <CreativeProcessContent
//                   userInputs={userInputs}
//                   handleEdit={handleEdit}
//                   worldLore={worldLore}
//                   characterBackground={characterBackground}
//                   characterArc={characterArc}
//                   generatedStory={generatedStory}
//                   selectedOption={selectedOption}
//                   setSelectedOption={setSelectedOption}
//                   setGeneratedStory={setGeneratedStory}
//                   setWorldLore={setWorldLore}
//                   setCharacterBackground={setCharacterBackground}
//                   setCharacterArc={setCharacterArc}
//                 />
//               </CardContent>
//             </Card>
//           </TabsContent>
//           <TabsContent value="outline" className="mt-0">
//             <Card className="bg-white/5 backdrop-blur-lg border-none text-slate-100 max-w-4xl mx-auto">
//               <CardContent className="p-6">
//                 <AIBrainstorming
//                   userInputs={userInputs}
//                   worldLore={worldLore}
//                   characterBackground={characterBackground}
//                   characterArc={characterArc}
//                 />
//               </CardContent>
//             </Card>
//           </TabsContent>
//         </div>
//       </Tabs>
//     </div>
//   )
// }