// Parse and validate the OpenAI response using Zod
export function handleUnterminatedJSON(aiResponse: string) {
    let parsedAiResponse;
    try {
        parsedAiResponse = JSON.parse(aiResponse);
    } catch (error) {
        if (error instanceof SyntaxError && error.message.includes("Unterminated string in JSON")) {
            const correctedAiResponse = aiResponse + '"]}';
            parsedAiResponse = JSON.parse(correctedAiResponse);
        }
    }

    return parsedAiResponse;
}
