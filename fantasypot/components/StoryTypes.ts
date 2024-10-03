export type GeneratedText = {
    text: string
    options: string[]
  }
  
  export type WorldLore = {
    magicSystem: string
  }
  
  export type CharacterBackground = {
    background: string
  }
  
  export type CharacterArc = {
    arc: string
  }
  
  export type StoryText = {
    chapters: GeneratedText[]
  }
  
  export type UserSpecifications = {
    moodType: string
    philosophicalQuestions: string[]
    historicalEvents: string[]
  }

  
  
  export type StoryOutline = {
    title: string
    summary: string
    themes: string[]
    mainCharacters: { name: string; description: string }[]
    plotPoints: string[]
  }
  
  export enum LoadingComponent {
    WORLD_LORE,
    CHARACTER_BACKGROUND,
    CHARACTER_ARC,
    STORY,
    STORY_OUTLINE,
    NOTHING,
  }