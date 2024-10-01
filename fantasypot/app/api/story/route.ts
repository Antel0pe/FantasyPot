import { NextRequest, NextResponse } from "next/server";
import { zodResponseFormat } from "openai/helpers/zod.mjs";
import { z } from "zod";
import * as config from "../openai";

const generateStoryPrompt = (mythologicalEvents: string, philosopicalQuestions: string, moodType: string,
    magicSystem: string, characterBackground: string, characterArc: string, previousChapters: string, userPickedOption: string) => {
    let prompt = `Compose the chapter ${previousChapters.length + 1} of a high fantasy story (250-400 words) that captivates from the first line. The narrative should: 
    1. Writing Style: Be written in rich, descriptive prose like J.R.R. Tolkien, capturing the grandeur of the world, with intricate magic systems and dynamic character development akin to Brandon Sanderson.
    2. Historical and Mythological Inspiration: Draw inspiration from a fusion of ${mythologicalEvents}, forging new and unexpected world features, societies, or conflicts.
    4. Characters: Include complex, morally ambiguous characters with relatable motivations and personal growth arcs, facing internal and external conflicts that reflect the themes.
    5. Themes and Philosophical Questions: Naturally weave in universal themes such as ${philosopicalQuestions} into the narrative and character interactions.
    6. World-Building: Build a diverse world with cultures steeped in political intrigue, where profound history shapes current events.
    7. Mood and Tone: Set a tone that is ${moodType}, using vivid sensory details to immerse the reader.
    8. Plot Structure: Start with a compelling hook introducing the central conflict or mystery, incorporating foreshadowing, subverted expectations, and satisfying payoffs.
    9. Originality: Avoid overused fantasy clichés; strive for originality in characters, plot devices, and world-building elements.
    10. Emotional Impact: Evoke strong emotions—be it awe, tension, empathy, or excitement—to make the narrative impossible to put down.
    11. Prose and Pacing: Use accessible yet evocative prose, balancing description with action and dialogue for engaging pacing that builds tension.
    12. Make sure to tailor the story to the user. Include 3 options (the user can select one) about where the story can go. The user cannot respond, only select an option. Include the options separetely in the json.
    13. Make sure to stay consistent with established magic system, character info, previous chapters - all info given below.

    Magic System: ${magicSystem}
    Character Background: ${characterBackground}
    Character Arc: ${characterArc}

    ${previousChapters.length !== 0 ? `The previous is: ${previousChapters}\n` : ''}
    ${userPickedOption.length !== 0? `Continue the story with this option ${userPickedOption}\n` : ''}`;

    return prompt;
}

// Define the structure of the incoming request body
const StoryRequestBodySchema = z.object({
    historicalEvents: z.array(z.string()).nonempty(),
    philosophicalQuestions: z.array(z.string()).nonempty(),
    moodType: z.string().min(1),
    worldLore: z.string(),
    characterBackground: z.string(),
    characterArc: z.string(),
    previousChapters: z.string().optional(),
    userPickedOption: z.string().optional(),
});

// Define the Zod schema for the OpenAI response
const UserDirectedFantasyStory = z.object({
    story: z.string().describe("Generate a story according to the instructions"),
    questions: z.array(z.string()).describe("Propose 3 options for where the story can go."),
});

// API Route Handler
export const POST = async (req: NextRequest) => {
    try {
        // Parse and validate the incoming JSON request body
        const parsedBody = StoryRequestBodySchema.safeParse(await req.json());
        if (!parsedBody.success) {
            return NextResponse.json(
                { error: "Invalid request body", details: parsedBody.error.errors },
                { status: 400 }
            );
        }

        const { historicalEvents, philosophicalQuestions, moodType, worldLore, characterBackground, characterArc, previousChapters, userPickedOption } = parsedBody.data;

        // Generate the prompt using the provided inputs
        const prompt = generateStoryPrompt(
            historicalEvents.join(", "),
            philosophicalQuestions.join(", "),
            moodType,
            worldLore,
            characterBackground,
            characterArc,
            previousChapters ?? "",
            userPickedOption ?? ""
        );

        // Call OpenAI's Chat Completion API
        const response = await config.openai.chat.completions.create({
            model: config.openaiModel,
            messages: [
                {
                    role: "system",
                    content: prompt,
                },
            ],
            max_tokens: 1000, // Increased token limit to accommodate 400 words
            temperature: 0.7, // Adjusted for creativity
            response_format: zodResponseFormat(UserDirectedFantasyStory, "UserDirectedFantasyStory"),
        });

        // Extract the generated content
        const aiResponse = response.choices?.[0]?.message?.content?.trim();

        if (!aiResponse) {
            return NextResponse.json(
                { error: "No response from OpenAI" },
                { status: 500 }
            );
        }

        // Parse and validate the OpenAI response using Zod
        const parsedAIResponse = UserDirectedFantasyStory.safeParse(JSON.parse(aiResponse));

        if (!parsedAIResponse.data) {
            console.log("did not return response according to zod");

            return NextResponse.json(
                { error: "Invalid output from OpenAI" },
                { status: 500 }
            );
        } else {
            const { story, questions } = parsedAIResponse.data;
            // Return the structured response
            return NextResponse.json({ story, questions });
        }


    } catch (error: any) {
        console.error("Error generating story:", error);

        // Handle specific OpenAI errors if needed
        if (error.response) {
            console.error("OpenAI API error:", error.response.status, error.response.data);
            return NextResponse.json(
                { error: "OpenAI API error", details: error.response.data },
                { status: error.response.status }
            );
        }

        // Handle JSON parse errors
        if (error instanceof SyntaxError && error.message.includes("JSON")) {
            return NextResponse.json(
                { error: "Failed to parse JSON response from OpenAI" },
                { status: 500 }
            );
        }

        // General error response
        return NextResponse.json(
            { error: "Failed to generate story" },
            { status: 500 }
        );
    }
};

