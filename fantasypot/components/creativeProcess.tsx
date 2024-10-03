import { BarChart, HelpCircle, Cloud, BookOpen } from "lucide-react"
import { EditableCard } from "./EditableCard"
import { EditableListCard } from "./EditableListCard"
import MarkdownDisplay from "./MarkdownDisplay"
import OptionCard from "./option-card"
import { Button } from "./ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card"
import { Skeleton } from "./ui/skeleton"
import { UserSpecifications, WorldLore, CharacterBackground, CharacterArc, StoryText, LoadingComponent, GeneratedText } from "./StoryTypes"
import { Dispatch, SetStateAction, useState } from "react"




type Props = {
    userInputs: UserSpecifications,
    worldLore: WorldLore,
    characterBackground: CharacterBackground,
    characterArc: CharacterArc,
    generatedStory: StoryText,
    selectedOption: string | null,
    setSelectedOption: (option: string | null) => void,
  handleEdit: (key: keyof UserSpecifications, value: string[] | string) => void
  setGeneratedStory: Dispatch<SetStateAction<StoryText>>,
  setWorldLore: Dispatch<SetStateAction<WorldLore>>,
  setCharacterBackground: Dispatch<SetStateAction<CharacterBackground>>,
  setCharacterArc: Dispatch<SetStateAction<CharacterArc>>
  }

export function CreativeProcessContent({
    userInputs,
    worldLore,
    characterBackground,
    characterArc,
    generatedStory,
    selectedOption,
    setSelectedOption,
    handleEdit,
    setGeneratedStory,
    setWorldLore,
    setCharacterBackground,
    setCharacterArc
  }: Props) {
    const [loading, setLoading] = useState<LoadingComponent>(LoadingComponent.NOTHING);

    const fetchStory = async (selectedChapter: number) => {
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
            previousChapters: generatedStory.chapters.slice(0, selectedChapter).map((text) => text.text),
            userPickedOption: selectedOption ?? ''
          }),
        });
    
        const data = await response.json();
    
        if (data.story){
          setGeneratedStory((prevState) => ({
            ...prevState,
            chapters: [...prevState.chapters.slice(0, selectedChapter), {
              text: data.story ?? "Failed to generate story...",
              options: data.questions ?? ["Failed to generate options..."]
            }, ...prevState.chapters.slice(selectedChapter+1)]
          }))
        } else {
          setGeneratedStory(prevState => ({
            ...prevState,
            chapters: [...prevState.chapters.slice(0, selectedChapter), {
              text: "Failed to generate story...",
              options: ["Failed to generate options..."]
            }, ...prevState.chapters.slice(selectedChapter+1)]
          }))
        }
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
        setCharacterArc({
          arc: (data.arc) ?? "Failed to generate story...",
        });
      }
    
    
      const handleGenerateNonStoryOutput = async (asyncFunc: () => Promise<void>, loading: LoadingComponent) => {
        setLoading(loading);
        await asyncFunc();
        setLoading(LoadingComponent.NOTHING);
      }

      const handleGenerateStoryOutput = async (asyncFunc: (number: number) => Promise<void>, number: number) => {
        setLoading(LoadingComponent.STORY);
        await asyncFunc(number);
        setLoading(LoadingComponent.NOTHING);
      }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EditableCard
            icon={<BarChart className="w-5 h-5 text-blue-400" />}
            title="Mood Type"
            value={userInputs.moodType}
            onChange={(value) => handleEdit("moodType", value)}
            loading={false}
          />
          <EditableListCard
            icon={<HelpCircle className="w-5 h-5" />}
            title="Philosophical Questions"
            items={userInputs.philosophicalQuestions}
            onChange={(value) => handleEdit("philosophicalQuestions", value)}
            loading={false}
          />
        </div>
  
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
        <Button
            onClick={() => handleGenerateNonStoryOutput(fetchWorldLore, LoadingComponent.WORLD_LORE)}
            disabled={loading !== LoadingComponent.NOTHING}
            className="w-full bg-teal-500 hover:bg-teal-600 text-slate-900 font-bold py-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-lg"
          >
            {loading !== LoadingComponent.NOTHING ? "Generating..." : "Start cooking a story"}
          </Button>
  
        {worldLore.magicSystem.length !== 0 && (
          <>
            <Card className="bg-white/10 border-none">
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center gap-2 text-teal-300">
                  <BookOpen className="w-5 h-5" />
                  Magic System
                </CardTitle>
              </CardHeader>
              <CardContent>
                { loading === LoadingComponent.WORLD_LORE ? (
                  <Skeleton className="w-full h-[300px] bg-white/10" />
                ) : (
                  <div className="h-[300px] w-full rounded-md border border-slate-700 bg-transparent p-4 text-sm leading-relaxed text-slate-300 overflow-auto mb-1rem">
                    <MarkdownDisplay markdown={worldLore.magicSystem} />
                  </div>
                )}
              </CardContent>
            </Card>
            <Button
              onClick={() => handleGenerateNonStoryOutput(fetchCharacterBackground, LoadingComponent.CHARACTER_BACKGROUND)}
              disabled={loading !== LoadingComponent.NOTHING}
              className="w-full bg-teal-500 hover:bg-teal-600 text-slate-900 font-bold py-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-lg"
            >
              Generate Character Background
            </Button>
          </>
        )}
  
        {characterBackground.background.length !== 0 && (
          <>
            <Card className="bg-white/10 border-none">
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center gap-2 text-teal-300">
                  <BookOpen className="w-5 h-5" />
                  Character Background
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading === LoadingComponent.CHARACTER_BACKGROUND ? (
                  <Skeleton className="w-full h-[300px] bg-white/10" />
                ) : (
                  <div className="h-[300px] w-full rounded-md border border-slate-700 bg-transparent p-4 text-sm leading-relaxed text-slate-300 overflow-auto mb-1rem">
                    <MarkdownDisplay markdown={characterBackground.background} />
                  </div>
                )}
              </CardContent>
            </Card>
            <Button
              onClick={() => handleGenerateNonStoryOutput(fetchCharacterArc, LoadingComponent.CHARACTER_ARC)}
              disabled={loading !== LoadingComponent.NOTHING}
              className="w-full bg-teal-500 hover:bg-teal-600 text-slate-900 font-bold py-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-lg"
            >
              Generate Character Arc
            </Button>
          </>
        )}
  
        {characterArc.arc.length !== 0 && (
          <>
            <Card className="bg-white/10 border-none">
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center gap-2 text-teal-300">
                  <BookOpen className="w-5 h-5" />
                  Character Arc
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading === LoadingComponent.CHARACTER_ARC ? (
                  <Skeleton className="w-full h-[300px] bg-white/10" />
                ) : (
                  <div className="h-[300px] w-full rounded-md border border-slate-700 bg-transparent p-4 text-sm leading-relaxed text-slate-300 overflow-auto mb-1rem">
                    <MarkdownDisplay markdown={characterArc.arc} />
                  </div>
                )}
              </CardContent>
            </Card>
            <Button
              onClick={() => handleGenerateStoryOutput(fetchStory, 0)} // bug - what if user clicks this button more than once? 
              disabled={loading !== LoadingComponent.NOTHING}
              className="w-full bg-teal-500 hover:bg-teal-600 text-slate-900 font-bold py-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-lg"
            >
              Generate Chapter 1
            </Button>
          </>
        )}
  
        {generatedStory.chapters.map((chapter, idx) => (
          loading === LoadingComponent.STORY || chapter.text.length !== 0 ? (
            <div key={idx}>
              <Card className="bg-white/10 border-none">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold flex items-center gap-2 text-teal-300">
                    <BookOpen className="w-5 h-5" />
                    Chapter {idx + 1}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading === LoadingComponent.STORY && chapter.text.length === 0 ? (
                    <Skeleton className="w-full h-[300px] bg-white/10" />
                  ) : (
                    <div className="h-[300px] w-full rounded-md border border-slate-700 bg-transparent p-4 text-sm leading-relaxed text-slate-300 overflow-auto mb-1rem">
                      <MarkdownDisplay markdown={chapter.text} />
                    </div>
                  )}
                </CardContent>
              </Card>
              <div className="flex flex-wrap justify-center">
                <OptionCard items={chapter.options} selectedOption={selectedOption} setSelectedOption={setSelectedOption} />
              </div>
              <Button
                onClick={() => handleGenerateStoryOutput(fetchStory, idx + 1)}
                disabled={loading !== LoadingComponent.NOTHING || !isOptionForClickedChapterSelected(chapter, selectedOption) || !isValidOptionList(chapter)}
                className="w-full bg-teal-500 hover:bg-teal-600 text-slate-900 font-bold py-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-lg"
              >
                Continue to Chapter {idx + 2}
              </Button>
            </div>
          ) : null
        ))}
      </div>
    )
  }

  

  function isValidOptionList(chapter: GeneratedText){
    return !chapter.options.includes('Failed to generate options...');
  }
  
  function isOptionForClickedChapterSelected(chapter: GeneratedText, selectedOption: string | null){
    return selectedOption !== null && chapter.options !== null
    && chapter.options.includes(selectedOption);
  }