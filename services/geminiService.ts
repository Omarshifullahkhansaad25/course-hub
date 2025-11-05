
import { GoogleGenAI, Chat } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. AI features will be disabled.");
}

const getAiInstance = () => {
    if (!API_KEY) {
        throw new Error("Gemini API key not found. AI features are disabled.");
    }
    return new GoogleGenAI({ apiKey: API_KEY });
}

export const getAIAssistance = async (prompt: string): Promise<string> => {
  if (!API_KEY) {
    return "AI features are currently unavailable. Please configure an API key.";
  }
  try {
    const ai = getAiInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Sorry, I couldn't get a response from the AI assistant. Please try again later.";
  }
};

export const createChat = (isThinkingMode: boolean): Chat => {
    const ai = getAiInstance();
    const model = isThinkingMode ? 'gemini-2.5-pro' : 'gemini-2.5-flash-lite'; // flash-lite for low latency streaming
    
    return ai.chats.create({
        model,
        config: isThinkingMode ? {
            thinkingConfig: {
                thinkingBudget: 32768,
            }
        } : undefined,
    });
};
