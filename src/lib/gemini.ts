import { GoogleGenAI, ApiError } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined.");
}

export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// Model IDs
export const EMBEDDING_MODEL = "gemini-embedding-001";
export const CHAT_MODEL = "gemini-3.5-flash";
export const FALLBACK_MODEL = "gemini-3.1-flash-lite";

// Helper to determine if an error is a 503 Service Unavailable
function is503Error(error: any): boolean {
  if (!error) return false;
  if (error instanceof ApiError && error.status === 503) {
    return true;
  }
  if (error.status === 503) {
    return true;
  }
  const msg = String(error.message || error).toLowerCase();
  return msg.includes("503") || msg.includes("service unavailable");
}

// Wrap generateContent to retry with FALLBACK_MODEL on 503
const originalGenerateContent = ai.models.generateContent.bind(ai.models);
(ai.models as any).generateContent = async function (params: any) {
  try {
    return await originalGenerateContent(params);
  } catch (error: any) {
    if (is503Error(error) && params?.model === CHAT_MODEL) {
      console.warn(`[Gemini Fallback] CHAT_MODEL (${CHAT_MODEL}) failed with 503. Retrying with ${FALLBACK_MODEL}...`);
      const fallbackParams = { ...params, model: FALLBACK_MODEL };
      return await originalGenerateContent(fallbackParams);
    }
    throw error;
  }
};

// Wrap generateContentStream to retry with FALLBACK_MODEL on 503
const originalGenerateContentStream = ai.models.generateContentStream.bind(ai.models);
(ai.models as any).generateContentStream = async function (params: any) {
  try {
    return await originalGenerateContentStream(params);
  } catch (error: any) {
    if (is503Error(error) && params?.model === CHAT_MODEL) {
      console.warn(`[Gemini Fallback] CHAT_MODEL (${CHAT_MODEL}) failed with 503. Retrying stream with ${FALLBACK_MODEL}...`);
      const fallbackParams = { ...params, model: FALLBACK_MODEL };
      return await originalGenerateContentStream(fallbackParams);
    }
    throw error;
  }
};

