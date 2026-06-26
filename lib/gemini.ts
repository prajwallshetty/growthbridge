import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";

export const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function generateTextWithGemini(prompt: string): Promise<string> {
  if (!genAI) {
    return "Gemini API key is not configured. Please add GEMINI_API_KEY to your .env.local file.";
  }
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return `AI Generation failed: ${error?.message || "Unknown error"}`;
  }
}
