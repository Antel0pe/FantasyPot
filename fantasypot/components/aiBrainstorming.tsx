import { useState } from "react";
import { Button } from "./ui/button";
import { UserSpecifications, WorldLore, CharacterBackground, CharacterArc, StoryText } from "./StoryTypes";

type Props = {
    userInputs: UserSpecifications,
    worldLore: WorldLore,
    characterBackground: CharacterBackground,
    characterArc: CharacterArc,
  }

  type StoryOutline = {
    title: string
    summary: string
    themes: string[]
    mainCharacters: { name: string; description: string }[]
    plotPoints: string[]
  }

  

export function AIBrainstorming({ userInputs, worldLore, characterBackground, characterArc }: Props) {
    const [storyOutline, setStoryOutline] = useState<StoryOutline | null>(null);

    const fetchStoryOutline = async () => {
        const response = await fetch('/api/story-outline', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...userInputs,
            worldLore: worldLore.magicSystem,
            characterBackground: characterBackground.background,
            characterArc: characterArc.arc,
          }),
        });
    
        const data = await response.json();
        setStoryOutline(data.outline ?? null);
      }

    if (!storyOutline) {
      return (
        <div className="flex flex-col items-center justify-center space-y-4">
          <p className="text-slate-300">No story outline generated yet.</p>
          <Button
            onClick={fetchStoryOutline}
            className="bg-teal-500 hover:bg-teal-600 text-slate-900 font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Generate Story Outline
          </Button>
        </div>
      )
    }
}