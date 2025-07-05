require("dotenv").config();
// import { GoogleGenAI } from "@google/genai";
const { GoogleGenAI } = require("@google/genai");
const { json } = require("express");
// Initialize Gemini client (ensure your API key is set)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function generateItinerary(address) {
  // Compose the user prompt based on the address
  const prompt = `
Given the following location:
Name: ${address.name}
State: ${address.state}
Country: ${address.country}

Generate a JSON object with:
- foods: 3 culturally appropriate foods (each with name and description)
- destinations: 3 unique, not obvious places to visit (each with name and description)
- sentances: translations for "hello", "thankyou", and "nice" in the local language in english alphabets always, and specify the language
- pokemon: a Pokémon that would spawn in this location, with name and a description relating it to the region

Strictly return only the following JSON format:

{
  foods: [
    { name: "...", description: "..." }
  ],
  destinations: [
    { name: "...", description: "..." }
  ],
  sentances: {
    localLanguage: "...",
    hello: "...",
    thankyou: "...",
    nice: "..."
  },
  pokemon: {
    name: "...",
    description: "..."
  }
}
`;

  // System instruction to enforce format and persona
  const systemInstruction = `
You are an expert travel assistant AI. Always respond in the exact JSON format provided, with no extra text.Do not include markdown, code blocks. Use the most culturally accurate and region-specific information. For the Pokémon, choose one that fits the location and explain the connection.
`;

  // Call Gemini API
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction,
    },
  });

  // Parse and return the JSON result
  try {
    // Remove any code block formatting if present
    // const text = response.text.replace(/``````/g, "").trim();
    const raw = response.text.trim();

    // Try to extract JSON from code block if present
    let jsonString = raw;
    const codeBlockMatch = raw.match(/``````/i);
    if (codeBlockMatch) {
      jsonString = codeBlockMatch[1];
    }

    console.log(response.text);
    console.log(jsonString);

    return JSON.parse(jsonString);
  } catch (err) {
    throw new Error("Failed to parse Gemini response as JSON.");
  }
}

module.exports = { generateItinerary };
