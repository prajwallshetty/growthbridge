"use server";

import { generateTextWithGemini } from "@/lib/gemini";
import { getSessionUser } from "@/lib/actions/cms";

export async function generateCopy(prompt: string): Promise<string> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    const response = await generateTextWithGemini(prompt);
    return response;
  } catch (error: any) {
    console.error("AI Action Error:", error);
    return `AI Generation failed: ${error?.message || "Unknown error"}`;
  }
}
