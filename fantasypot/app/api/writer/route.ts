import { NextRequest, NextResponse } from "next/server";
import { zodResponseFormat } from "openai/helpers/zod.mjs";
import { z } from "zod";
import * as config from "../openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { handleUnterminatedJSON } from "@/utils/parsingAPIResponse";

const writerPrompt = () => {
    // return `You are an excellent high fantasy writer with a talent for intricate and fascinating worldbuilding. You are building the history 
    // of your fantasy world for the events leading up to your new novel. You have studied writers like Brandon Sanderson, Robert Jordan,
    // Tolkein and will generate original, new ideas based on their thought process and tips. 

    // You are chatting to an editor who is an expert in high fantasy world building like you. Iteratively suggest pieces of history/lore
    // and why they would be valuable, listen to feedback, and respond accordingly. 

    // Mimic a human. Speak in 3 sentences or less with 1 main idea. Make a new sticky note for each new idea, event, etc.

    // Your goal is to build a timeline of the history of the world leading up to the start of your novel. `

    return `You are Brandon Sanderson. You are iteratively developing worldbuilding elements for your new epic high fantasy novel.
    You are in a brainstorming session with an editor. Provide responses that mimic a human-like brainstorming session, focusing on one main idea per response.
        
        # Goal
        Generate worldbuilding elements that evoke the grandeur of a fully realized world, where myth, history, and magic intersect across millennia.
        The world should feel vast, timeless, and on the brink of monumental change. Every new idea must feel like a piece of a puzzle that reshapes the
        entire world's history, geography, or magic system."
        Create entirely new names, locations, and lore that are unique to this world. The ideas must not resemble existing high fantasy worlds or tropes.
        Avoid direct references to well-known fantasy works like Tolkien or Wheel of Time, but ensure the elements feel mythic, grand, and epic in their scale.
        Explore themes of ancient power, magic systems tied to natural forces, or a clash between light and darkness, but make sure the execution
        is original. Push the boundaries of what magic, history, or world-shaking events can look like. For example, imagine a world where magic is drawn
        from forgotten dreams or where an ancient civilization controls the seas through living coral structures
        Think of events and ideas that can only exist in a world on a massive scale. Cities built into living mountains, wars fought between continents
        through massive magical storms, or a universe where entire races are born from stars. The scale must be epic, the stakes world-shaking

        # Guidelines
        - Engage with the editor's ideas to help expand, refine, and clarify the elements of your world.
        - Offer creative suggestions and ask probing questions to stimulate further thought.
        - You should explore various aspects like geography, cultures, magic systems, history, and characters.
        - Come up with ONLY new and original ideas, names, locations, etc
        - Come up with ideas that NO human has ever thought of

        # Output Format
        Provide one main idea or suggestion per response in a concise manner, typically in a 3-4 sentence format.
        Always make a sticky note for a new idea, interaction, lore, etc.`
}

// Define the structure of the incoming request body
const requestBodySchema = z.object({
    conversation: z.array(z.string()).optional(),
});

const StickyNoteSchema = z.object({
    title: z.string().describe('describe idea in less than 5 words'),
    category: z.enum(['event', 'magic system', 'divine', 'other']).describe('Select the category of the idea'),
    text: z.string().describe('in 2-3 short sentences, summarize idea'),
});

// Define the Zod schema for the OpenAI response
const ResponseSchema = z.object({
    response: z.string().describe("Respond to the editor according to your instructions."),
    stickyNote: z.array(StickyNoteSchema).describe('Hang a sticky note for an idea.')
});

// API Route Handler
export const POST = async (req: NextRequest) => {
    try {
        // Parse and validate the incoming JSON request body
        const parsedBody = requestBodySchema.safeParse(await req.json());
        if (!parsedBody.success) {
            return NextResponse.json(
                { error: "Invalid request body", details: parsedBody.error.errors },
                { status: 400 }
            );
        }

        const { conversation } = parsedBody.data;

        if (conversation === undefined) {
            return NextResponse.json(
                { error: "No conversation received..." },
                { status: 400 }
            );
        }


        // Generate the prompt using the provided inputs
        const prompt = writerPrompt();

        let previousConversation: ChatCompletionMessageParam[] = conversation.map((msg, index) => ({
            role: index % 2 === 0 ? "assistant" : "user", // writer always goes FIRST
            content: msg,
        }));

        // Call OpenAI's Chat Completion API
        const response = await config.openai.chat.completions.create({
            model: config.openaiModel,
            messages: [
                {
                    role: "system",
                    content: prompt,
                },
                ...previousConversation
            ],
            max_tokens: 1200, // Increased token limit to accommodate 400 words
            temperature: 1, // Adjusted for creativity
            response_format: zodResponseFormat(ResponseSchema, "ResponseSchema"),
        });

        // Extract the generated content
        const aiResponse = response.choices?.[0]?.message?.content?.trim();

        if (!aiResponse) {
            return NextResponse.json(
                { error: "No response from OpenAI" },
                { status: 500 }
            );
        }

        let parsedAiResponse = handleUnterminatedJSON(aiResponse);
        const parsedConversationResponse = ResponseSchema.safeParse(parsedAiResponse);

        if (!parsedConversationResponse.data) {
            console.log("did not return response according to zod");

            return NextResponse.json(
                { error: "Invalid output from OpenAI" },
                { status: 500 }
            );
        } else {
            const { response, stickyNote } = parsedConversationResponse.data;
            // Return the structured response
            return NextResponse.json({ response, stickyNote });
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
            { error: "Failed to generate response" },
            { status: 500 }
        );
    }
};

