
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI | null = null;

if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  console.error("API_KEY for Gemini is not set in environment variables. Translation functionality will be disabled.");
}

export const translatePromptToEnglish = async (
  indonesianPrompt: string,
  spokenLines: string
): Promise<string> => {
  if (!ai) {
    throw new Error("Gemini API client is not initialized. Check API_KEY.");
  }

  let systemInstruction = `You are an expert multilingual translator specializing in crafting vivid video production prompts.
Translate the provided Indonesian video prompt into a creative, detailed, and fluent English video prompt.
The English prompt should be highly descriptive and suitable for an advanced text-to-video generation model like Veo or Sora.
Retain all specific details: subject, action, expression, setting, time, camera movements, lighting, video style, and mood.
Amplify the imagery and narrative potential in the English version, making it more evocative and imaginative, while strictly adhering to the core elements of the original Indonesian prompt.`;

  // The Indonesian prompt already contains the spoken lines, structured like: "...[Subject] mengucapkan: \"[Dialog]\"..."
  // The LLM should be able to identify this pattern. We will add an extra emphasis for the spoken lines.
  if (spokenLines && spokenLines.trim() !== "") {
    systemInstruction += `

IMPORTANT INSTRUCTION ON DIALOGUE:
The Indonesian prompt contains spoken dialogue. This dialogue MUST NOT BE TRANSLATED.
It must be preserved verbatim in its original language (Indonesian or as provided) and seamlessly integrated into the final English prompt.
The dialogue to preserve is: "${spokenLines}"
Ensure this untranslated dialogue appears naturally within the English narrative.`;
  }

  const userPrompt = `Indonesian Video Prompt:\n\`\`\`text\n${indonesianPrompt}\n\`\`\`

Translate this into a detailed and creative English video prompt, following all instructions.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.75, // Balance creativity with faithfulness
        topP: 0.95,
        topK: 40,
      }
    });

    const translatedText = response.text;
    if (!translatedText || translatedText.trim() === "") {
      console.warn("Gemini API returned empty or whitespace-only translation for: ", indonesianPrompt);
      throw new Error("Received an empty translation from the API. The model might not have understood the request or the content was problematic.");
    }
    return translatedText.trim();
  } catch (error) {
    console.error("Error translating prompt with Gemini:", error);
    if (error instanceof Error) {
        // Check for specific Gemini errors if available, otherwise general message
        if (error.message.includes("API key not valid")) {
             throw new Error("Invalid Gemini API Key. Please check your configuration.");
        }
        throw new Error(`Failed to translate prompt: ${error.message}`);
    }
    throw new Error("Failed to translate prompt due to an unknown error with the Gemini API.");
  }
};
