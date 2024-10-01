import { OpenAI } from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY
});

const openaiModel = process.env.OPENAI_MODEL ?? "gpt-4o-mini"

export {
    openai,
    openaiModel
};
