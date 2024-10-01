"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Clock, BarChart, BookOpen, HelpCircle, Cloud, Edit2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import OptionCard from "./option-card"
import MarkdownDisplay from "./MarkdownDisplay"
import { preprocessMarkdown } from "@/utils/markdownPreprocessor"

type GeneratedText = {
  text: string
  options: string[]
}

type WorldLore = {
  magicSystem: string
}

type CharacterBackground = {
  background: string
}

type CharacterArc = {
  arc: string
}

type StoryText = {
  chapter: GeneratedText
}

type UserSpecifications = {
  moodType: string
  philosophicalQuestions: string[]
  historicalEvents: string[]
}

enum LoadingComponent {
  WORLD_LORE,
  CHARACTER_BACKGROUND,
  CHARACTER_ARC,
  CH1,
  NOTHING,
}



export function ChatGptOutput() {
  const [fantasyText, setFantasyText] = useState<GeneratedText>({ text: "", options: [] })
  const [userInputs, setUserInputs] = useState<UserSpecifications>(
    {
      moodType: 'carefree and lighthearted',
      philosophicalQuestions: ['free will vs destiny'],
      historicalEvents: ['atlantis sudden disappearance', 'norse ragnorok']
    });
  const [characterBackground, setCharacterBackground] = useState<CharacterBackground>({ background: "" });
  const [characterArc, setCharacterArc] = useState<CharacterArc>({ arc: "" });
  const [worldLore, setWorldLore] = useState<WorldLore>({ magicSystem: "" });
  const [loading, setLoading] = useState<LoadingComponent>(LoadingComponent.NOTHING);

  const fetchStory = async () => {
    const response = await fetch('/api/story', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...userInputs,
        characterBackground: characterBackground.background,
        characterArc: characterArc.arc,
        worldLore: worldLore.magicSystem,
      }),
    });

    const data = await response.json();

    console.log(data)

    setFantasyText({
      text: (data.story) ?? "Failed to generate story...",
      options: data.questions
    });
  }

  const fetchWorldLore = async () => {
    const response = await fetch('/api/lore', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userInputs),
    });

    const data = await response.json();

    console.log(data)

    setWorldLore({
      magicSystem: (data.lore) ?? "Failed to generate lore...",
    });
  }

  const fetchCharacterBackground = async () => {
    const response = await fetch('/api/character/background', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userInputs),
    });

    const data = await response.json();

    console.log(data)

    setCharacterBackground({
      background: (data.background) ?? "Failed to generate background...",
    });
  }

  const fetchCharacterArc = async () => {
    const response = await fetch('/api/character/arc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        philosophicalQuestions: userInputs.philosophicalQuestions,
        characterBackground: characterBackground.background,
        magicSystem: worldLore.magicSystem,
      }),
    });

    const data = await response.json();

    console.log(data)

    setCharacterArc({
      arc: (data.arc) ?? "Failed to generate story...",
    });
  }

  

  const handleGenerateOutput = async (asyncFunc: () => Promise<void>, loading: LoadingComponent) => {
    setLoading(loading)
    await asyncFunc()
    setLoading(LoadingComponent.NOTHING)
  }

  const handleEdit = (key: keyof UserSpecifications, value: string[] | string) => {
    setUserInputs(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8 flex flex-col items-center justify-center">
      <Card className="w-full max-w-4xl bg-white/5 backdrop-blur-lg border-none text-slate-100">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-teal-300">High Fantasy Cookpot</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button
            onClick={() => handleGenerateOutput(fetchWorldLore, LoadingComponent.WORLD_LORE)}
            disabled={loading !== LoadingComponent.NOTHING}
            className="w-full bg-teal-500 hover:bg-teal-600 text-slate-900 font-bold py-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-lg"
          >
            {loading !== LoadingComponent.NOTHING ? "Generating..." : "Start cooking a story"}
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(
              <EditableCard
                icon={<BarChart className="w-5 h-5 text-blue-400" />}
                title="Mood Type"
                value={userInputs.moodType}
                onChange={(value) => handleEdit("moodType", value)}
                loading={false}
              />
            )}
            {(
              <EditableListCard
                icon={<HelpCircle className="w-5 h-5" />}
                title="Philosophical Questions"
                items={userInputs.philosophicalQuestions}
                onChange={(value) => handleEdit("philosophicalQuestions", value)}
                loading={false}
              />
            )}
          </div>



          {(
            <EditableListCard
              icon={<Cloud className="w-5 h-5" />}
              title="Historical/Mythological Events to use as inspiration"
              items={userInputs.historicalEvents}
              onChange={(value) => handleEdit("historicalEvents", value)}
              loading={false}
              renderItems={(items) => (
                <div className="flex flex-wrap gap-2">
                  {items.map((word, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-white/20 rounded-full text-sm"
                      style={{ color: `hsl(${Math.random() * 360}, 70%, 80%)` }}
                    >
                      {word}
                    </span>
                  ))}
                </div>
              )}
            />
          )}

          
          {(worldLore.magicSystem.length !== 0) && (
            <>
              <Card className="bg-white/10 border-none">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold flex items-center gap-2 text-teal-300">
                    <BookOpen className="w-5 h-5" />
                    Magic System
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading && worldLore.magicSystem.length === 0 ? (
                    <Skeleton className="w-full h-[300px] bg-white/10" />
                  ) : (
                      <div className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">

                        <div className="h-[300px] w-full rounded-md border border-slate-700 bg-transparent p-4 text-sm leading-relaxed text-slate-300 overflow-auto mb-1rem">
                          <MarkdownDisplay markdown={worldLore.magicSystem} />
                        </div>
                      </div>
                  )}
                  
                </CardContent>
              </Card>
              <Button
                onClick={() => handleGenerateOutput(fetchCharacterBackground, LoadingComponent.CHARACTER_BACKGROUND)}
                disabled={loading !== LoadingComponent.NOTHING}
                className="w-full bg-teal-500 hover:bg-teal-600 text-slate-900 font-bold py-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-lg"
              >
                { "Generate Character Background"}
              </Button>
            </>
          )}

          {(characterBackground.background.length !== 0) && (
            <>
              <Card className="bg-white/10 border-none">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold flex items-center gap-2 text-teal-300">
                    <BookOpen className="w-5 h-5" />
                    Character Background
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading && characterBackground.background.length === 0 ? (
                    <Skeleton className="w-full h-[300px] bg-white/10" />
                  ) : (
                    <div className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">

                        <div className="h-[300px] w-full rounded-md border border-slate-700 bg-transparent p-4 text-sm leading-relaxed text-slate-300 overflow-auto mb-1rem">
                          <MarkdownDisplay markdown={characterBackground.background} />
                        </div>
                      </div>
                  )}
                </CardContent>
              </Card>
              <Button
                onClick={() => handleGenerateOutput(fetchCharacterArc, LoadingComponent.CHARACTER_ARC)}
                disabled={loading !== LoadingComponent.NOTHING}
                className="w-full bg-teal-500 hover:bg-teal-600 text-slate-900 font-bold py-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-lg"
              >
                {"Generate Character Arc"}
              </Button>
            </>
          )}

          {(characterArc.arc.length !== 0) && (
            <>
              <Card className="bg-white/10 border-none">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold flex items-center gap-2 text-teal-300">
                    <BookOpen className="w-5 h-5" />
                    Character Arc
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading && characterArc.arc.length === 0 ? (
                    <Skeleton className="w-full h-[300px] bg-white/10" />
                  ) : (
                    <div className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">

                        <div className="h-[300px] w-full rounded-md border border-slate-700 bg-transparent p-4 text-sm leading-relaxed text-slate-300 overflow-auto mb-1rem">
                          <MarkdownDisplay markdown={characterArc.arc} />
                        </div>
                      </div>
                  )}
                </CardContent>
              </Card>
              <Button
                onClick={() => handleGenerateOutput(fetchStory, LoadingComponent.CH1)}
                disabled={loading !== LoadingComponent.NOTHING}
                className="w-full bg-teal-500 hover:bg-teal-600 text-slate-900 font-bold py-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-lg"
              >
                {"Generate Story"}
              </Button>
            </>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(loading === LoadingComponent.CH1 || fantasyText.text.length !== 0) && (
              <EditableCard
                icon={<BookOpen className="w-5 h-5 text-green-400" />}
                title="Word Count"
                value={fantasyText.text.split(" ").length.toString()}
                onChange={() => { }}
                loading={loading === LoadingComponent.CH1 && fantasyText.text.length === 0}
              />
            )}
            {(loading === LoadingComponent.CH1 || fantasyText.text.length !== 0) && (
              <EditableCard
                icon={<Clock className="w-5 h-5 text-purple-400" />}
                title="Reading Time"
                value={Math.ceil(fantasyText.text.split(" ").length / 200).toString() + " mins"} // Assuming 200 words per minute reading speed
                onChange={() => { }} // No need to change reading time as it's calculated dynamically
                loading={loading === LoadingComponent.CH1 && fantasyText.text.length === 0}
              />
            )}
          </div>


          {(loading === LoadingComponent.CH1 || fantasyText.text.length !== 0) && (
            <>
              <Card className="bg-white/10 border-none">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold flex items-center gap-2 text-teal-300">
                    <BookOpen className="w-5 h-5" />
                    Chapter 1
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading && fantasyText.text.length === 0 ? (
                    <Skeleton className="w-full h-[300px] bg-white/10" />
                  ) : (
                    <div className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">

                        <div className="h-[300px] w-full rounded-md border border-slate-700 bg-transparent p-4 text-sm leading-relaxed text-slate-300 overflow-auto mb-1rem">
                          <MarkdownDisplay markdown={fantasyText.text} />
                        </div>
                      </div>
                  )}
                </CardContent>
              </Card>
              <OptionCard items={fantasyText.options} />
              <Button
                onClick={() => {}}
                disabled={loading !== LoadingComponent.NOTHING}
                className="w-full bg-teal-500 hover:bg-teal-600 text-slate-900 font-bold py-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-lg"
              >
                { "Continue - Not Working lol"}
              </Button>
            </>
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