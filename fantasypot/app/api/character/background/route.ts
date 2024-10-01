import { NextRequest, NextResponse } from "next/server";
import { zodResponseFormat } from "openai/helpers/zod.mjs";
import { z } from "zod";
import * as config from "../../openai";


const generateCharacterBackgroundPrompt = (philosopicalQuestions: string, moodType: string) =>{
    return `You are Brandon Sanderson. Provide a brief character sketch of the protagonist, including their background, motivations, strengths, weaknesses,
    and internal conflicts related to ${philosopicalQuestions} and that feels ${moodType}. Limit the response to 150 words.`
}

// Define the structure of the incoming request body
const CharacterBackgroundRequestBodySchema = z.object({
    philosophicalQuestions: z.array(z.string()).nonempty(),
    moodType: z.string().min(1),
});

// Define the Zod schema for the OpenAI response
const UserDirectedCharacterBackground = z.object({
    background: z.string().describe("Generate a character background using Brandon Sanderson's techniques in less than 150 words."),
});

// API Route Handler
export const POST = async (req: NextRequest) => {
    try {
        // Parse and validate the incoming JSON request body
        const parsedBody = CharacterBackgroundRequestBodySchema.safeParse(await req.json());
        if (!parsedBody.success) {
            return NextResponse.json(
                { error: "Invalid request body", details: parsedBody.error.errors },
                { status: 400 }
            );
        }

        const { philosophicalQuestions, moodType } = parsedBody.data;

        // Generate the prompt using the provided inputs
        const prompt = generateCharacterBackgroundPrompt(
            philosophicalQuestions.join(", "),
            moodType
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
            response_format: zodResponseFormat(UserDirectedCharacterBackground, "UserDirectedCharacterBackground"),
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
        const parsedAIResponse = UserDirectedCharacterBackground.safeParse(JSON.parse(aiResponse));

        if (!parsedAIResponse.data) {
            console.log("did not return response according to zod");

            return NextResponse.json(
                { error: "Invalid output from OpenAI" },
                { status: 500 }
            );
        } else {
            const { background } = parsedAIResponse.data;
            // Return the structured response
            return NextResponse.json({ background });
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
