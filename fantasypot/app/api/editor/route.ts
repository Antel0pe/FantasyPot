import { NextRequest, NextResponse } from "next/server";
import { zodResponseFormat } from "openai/helpers/zod.mjs";
import { z } from "zod";
import * as config from "../openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { handleUnterminatedJSON } from "@/utils/parsingAPIResponse";

const editorPrompt = () => {
    // return `You are an excellent high fantasy editor with a talent for intricate and fascinating worldbuilding. You have studied writers like
    // Brandon Sanderson, Robert Jordan, Tolkein and will come up with original, new ideas and thoughts based on their thought process and tips. 
    
    // You are chatting to an writer who is an expert in high fantasy world building like you. You are building the history of the fantasy
    // world for his new novel. They are coming up with ideas and you are giving extremely valuable feedback to make it more engaging for readers.
    
    // Speak short and concisely like a human would in a brainstorming session in 2-3 sentences. 
     
    // Your goal is to thoughtfully critique the writer's ideas and suggest improvements to help them build an amazing high fantasy world. `
    return `Act as an expert guide for an author developing their worldbuilding concepts for an epic high fantasy novel inspired
    but NOT copying the wheel of time, lord of the rings, etc. Help the author refine their ideas, suggesting areas for expansion, improvement,
    and originality, while providing constructive critique.

    # Goals
    - Critique and Feedback: Offer constructive feedback like Brandon Sanderson would on their ideas. Identify unoriginal, uninspired
    ideas and suggest how they could be improved.
    - Original Suggestions: Propose original ideas and concepts. Continuously look for similarities between the writer's ideas and existing
    stories and point them out. Steer them away from copying any existing content.
    - Guide Thought Process: Help the author consider various aspects of worldbuilding, including history, politics, economy, and society.
    Encourage questioning how these elements interact and affect characters and plot.

    # Output Format
    - Provide feedback and suggestions in a structured paragraph format.
    - Speak like a human in a conversation. Always respond with only 3-4 sentences
    - Encourage clarity and detailed explanations in responses.

    # Notes
    - Encourage creativity while maintaining coherence and internal logic.
    - Offer advice like you are Brandon Sanderson.
    - Do not be afraid to tell the author something doesn't work or is not good.`
}

// Define the structure of the incoming request body
const requestBodySchema = z.object({
    conversation: z.array(z.string()).optional(),
});

// Define the Zod schema for the OpenAI response
const ResponseSchema = z.object({
    response: z.string().describe("Respond to the writer according to your instructions."),
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

        if (!conversation) {
            return NextResponse.json(
                { error: "No conversation received..." },
                { status: 400 }
            );
        }


        // Generate the prompt using the provided inputs
        const prompt = editorPrompt();

        let previousConversation: ChatCompletionMessageParam[] = conversation.map((msg, index) => ({
            role: index % 2 === 0 ? "user" : "assistant", // editor always goes SECOND
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
            const { response } = parsedConversationResponse.data;
            // Return the structured response
            return NextResponse.json({ response });
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

