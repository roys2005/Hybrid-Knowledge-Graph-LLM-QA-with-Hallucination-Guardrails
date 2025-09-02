
import { GoogleGenAI } from "@google/genai";
import { KGResult } from "../types";

// Ensure the API key is available
if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateSparqlQuery = async (userQuestion: string): Promise<string> => {
    const prompt = `You are an expert in SPARQL and DBpedia. 
Your task is to convert a user's natural language question into a valid SPARQL query to retrieve relevant facts from DBpedia.
Use relevant prefixes like 'dbo:', 'dbp:', and 'rdfs:'.
Only return the SPARQL query code itself, with no explanations, markdown formatting, or any other text.

The user's question is: "${userQuestion}"`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.1
            }
        });
        const text = response.text.trim();
        // Clean up potential markdown code fences
        return text.replace(/^```sparql\s*|```\s*$/g, '').trim();
    } catch (error) {
        console.error("Error generating SPARQL query:", error);
        throw new Error("Failed to generate SPARQL query from Gemini API.");
    }
};

export const generateAnswerFromFacts = async (userQuestion: string, kgData: KGResult): Promise<string> => {
    const facts = JSON.stringify(kgData.results.bindings);
    if (kgData.results.bindings.length === 0) {
        return "I couldn't find any specific facts in the knowledge graph for your question. I'll try to answer based on my general knowledge, but it might not be precise. \n\nLet me try: ";
    }
    
    const prompt = `You are a helpful Q&A assistant.
Your task is to provide a clear, concise, and natural language answer to the user's question based *only* on the factual data provided from a knowledge graph.
Do not add any information that is not present in the provided data.
If the data is insufficient to answer the question, state that you cannot answer with the given facts.

User's original question: "${userQuestion}"

Factual data:
${facts}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
             config: {
                temperature: 0.5
            }
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating final answer:", error);
        throw new Error("Failed to generate final answer from Gemini API.");
    }
};

// A fallback function in case KG pipeline fails
export const generateGeneralAnswer = async (userQuestion: string): Promise<string> => {
     try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userQuestion,
        });
        return `The knowledge graph query failed. Here is a general answer from the LLM, which may be less factually grounded:\n\n${response.text.trim()}`;
    } catch (error) {
        console.error("Error generating general answer:", error);
        throw new Error("Failed to generate an answer from Gemini API.");
    }
}
