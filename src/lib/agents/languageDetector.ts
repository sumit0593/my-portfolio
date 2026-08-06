/**
 * Multi-Language Detector Engine for AI Client Communication
 * Detects incoming message language and generates natural language instructions.
 */

export type SupportedLanguage = 
  | "English"
  | "Hindi"
  | "Spanish"
  | "French"
  | "German"
  | "Japanese"
  | "Arabic";

interface LanguageProfile {
  name: SupportedLanguage;
  nativeName: string;
  code: string;
  patterns: RegExp[];
}

const LANGUAGE_PROFILES: LanguageProfile[] = [
  {
    name: "Hindi",
    nativeName: "हिन्दी",
    code: "hi",
    patterns: [
      /[\u0900-\u097F]/, // Devanagari script
      /\b(kya|kaise|aap|namaste|mujhe|chahiye|karo|batao|kya hai|karna|haiai|ji)\b/i,
    ],
  },
  {
    name: "Spanish",
    nativeName: "Español",
    code: "es",
    patterns: [
      /\b(hola|buenos|días|tardes|por favor|gracias|proyecto|desarrollo|precio|cuánto|presupuesto|necesito|puedes)\b/i,
    ],
  },
  {
    name: "French",
    nativeName: "Français",
    code: "fr",
    patterns: [
      /\b(bonjour|salut|merci|s'il vous plaît|projet|développement|prix|combien|budget|besoin|pouvez-vous)\b/i,
    ],
  },
  {
    name: "German",
    nativeName: "Deutsch",
    code: "de",
    patterns: [
      /\b(hallo|guten tag|danke|bitte|projekt|entwicklung|preis|kosten|budget|benötige|können sie)\b/i,
    ],
  },
  {
    name: "Japanese",
    nativeName: "日本語",
    code: "ja",
    patterns: [
      /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/, // Hiragana, Katakana, Kanji
      /\b(こんにちは|ありがとう|プロジェクト|開発|見積もり|費用)\b/i,
    ],
  },
  {
    name: "Arabic",
    nativeName: "العربية",
    code: "ar",
    patterns: [
      /[\u0600-\u06FF]/, // Arabic script
      /\b(مرحبا|شكرا|مشروع|تطوير|سعر|تكلفة|ميزانية|تواصل)\b/i,
    ],
  },
  {
    name: "English",
    nativeName: "English",
    code: "en",
    patterns: [
      /\b(hello|hi|hey|thanks|project|build|cost|pricing|budget|hire|contract|schedule|demo|architecture)\b/i,
    ],
  },
];

/**
 * Detects language from incoming text prompt.
 */
export function detectLanguage(text: string): { language: SupportedLanguage; code: string; isNativeScript: boolean } {
  if (!text || text.trim().length === 0) {
    return { language: "English", code: "en", isNativeScript: false };
  }

  for (const profile of LANGUAGE_PROFILES) {
    if (profile.name === "English") continue; // Check non-English first

    for (const pattern of profile.patterns) {
      if (pattern.test(text)) {
        const isScript = /[\u0900-\u097F\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u0600-\u06FF]/.test(text);
        return {
          language: profile.name,
          code: profile.code,
          isNativeScript: isScript,
        };
      }
    }
  }

  return { language: "English", code: "en", isNativeScript: false };
}

/**
 * Generates system prompt instruction for multi-language response.
 */
export function buildLanguageInstruction(detected: { language: SupportedLanguage; isNativeScript: boolean }): string {
  if (detected.language === "English") {
    return "Respond in clear, professional English.";
  }

  return `LANGUAGE INSTRUCTION: The client is communicating in ${detected.language}.
You MUST generate your entire response fluently in ${detected.language}. Maintain natural phrasing, correct technical terminology, and professional client engagement in ${detected.language}.`;
}
