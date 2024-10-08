import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { handleUnterminatedJSON } from "@/utils/parsingAPIResponse";
import { zodResponseFormat } from "openai/helpers/zod.mjs";
import * as config from "../../openai";

const prompt = (notes: object) => {
    return `You are a writer for an epic high fantasy novel. You have brainstormed a list of ideas for the world, plot, magic, etc. You are now tasked
    with organizing them into categories.
    
    Possible categories include: magic, lore, geography, character, event.
    
    In addition you are to give specific categories relevant to the plot. 

    You are to return each individual note in JSON with id, title, content, and any categories. Only return notes that are included below.
    
    Input: ${notes}`
}

// Define the structure of the incoming request body
const requestBodySchema = z.object({
    notes: z.array(
        z.object({
            id: z.string(),
            title: z.string(),
            content: z.string(),
            category: z.string().optional()
        })
    ),
});

const Note = z.object({
    id: z.string(),
    title: z.string(),
    content: z.string(),
    category: z.array(z.string())
});

// Define the structure of the response body
const ResponseSchema = z.object({
    organizedNotes: z.array(Note)
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

        const { notes } = parsedBody.data;
        let categorizePrompt = prompt(notes);

        // Call OpenAI's Chat Completion API
        const response = await config.openai.chat.completions.create({
            model: config.openaiModel,
            messages: [
                {
                    role: "system",
                    content: categorizePrompt,
                },
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
            const { organizedNotes } = parsedConversationResponse.data;
            // Return the structured response
            return NextResponse.json({ organizedNotes });
        }
    } catch (error) {
        console.error("Error organizing notes:", error);

        // General error response
        return NextResponse.json(
            { error: "Failed to organize notes" },
            { status: 500 }
        );
    }
};