import { NextRequest, NextResponse } from "next/server";
import { zodResponseFormat } from "openai/helpers/zod.mjs";
import { z } from "zod";
import openai from "../openai";


const generateLoreSystemPrompt = (mythologicalEvents: string, philosopicalQuestions: string) =>{
    return `Briefly outline a unique magic system like Brandon Sanderson would. It should be inspired by ${mythologicalEvents} and ${philosopicalQuestions} and
    including its rules, limitations, and costs. Keep the description under 150 words.`
}

// Define the structure of the incoming request body
const LoreRequestBodySchema = z.object({
    historicalEvents: z.array(z.string()).nonempty(),
    philosophicalQuestions: z.array(z.string()).nonempty(),
});

// Define the Zod schema for the OpenAI response
const UserDirectedMagicSystem = z.object({
    lore: z.string().describe("Outline a magic system like Brandon Sanderson would in less than 150 words."),
});

// API Route Handler
export const POST = async (req: NextRequest) => {
    try {
        // Parse and validate the incoming JSON request body
        const parsedBody = LoreRequestBodySchema.safeParse(await req.json());
        if (!parsedBody.success) {
            return NextResponse.json(
                { error: "Invalid request body", details: parsedBody.error.errors },
                { status: 400 }
            );
        }

        const { historicalEvents, philosophicalQuestions } = parsedBody.data;

        // Generate the prompt using the provided inputs
        const prompt = generateLoreSystemPrompt(
            historicalEvents.join(", "),
            philosophicalQuestions.join(", "),
        );

        // Call OpenAI's Chat Completion API
        const response = await openai.chat.completions.create({
            // model: "gpt-4o-mini",
            model: "gpt-4o-2024-08-06",
            messages: [
                {
                    role: "system",
                    content: prompt,
                },
            ],
            max_tokens: 1000, // Increased token limit to accommodate 400 words
            temperature: 0.7, // Adjusted for creativity
            response_format: zodResponseFormat(UserDirectedMagicSystem, "UserDirectedMagicSystem"),
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
        const parsedAIResponse = UserDirectedMagicSystem.safeParse(JSON.parse(aiResponse));

        if (!parsedAIResponse.data) {
            console.log("did not return response according to zod");

            return NextResponse.json(
                { error: "Invalid output from OpenAI" },
                { status: 500 }
            );
        } else {
            const { lore } = parsedAIResponse.data;
            // Return the structured response
            return NextResponse.json({ lore });
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
