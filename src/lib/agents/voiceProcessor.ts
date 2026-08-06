/**
 * Voice Message & Speech-to-Text Processing Engine
 * Converts incoming client audio messages (.webm, .wav, .mp3, .ogg, .m4a)
 * into transcribed text and generates structured voice response metadata.
 */

import { ai, CHAT_MODEL } from "@/lib/gemini";

export interface VoiceProcessingResult {
  filename: string;
  mimeType: string;
  transcript: string;
  detectedTone: string;
  languageDetected: string;
  summary: string;
}

/**
 * Processes audio buffer via Gemini Multimodal Speech-to-Text.
 */
export async function processVoiceMessage(
  audioBuffer: Buffer,
  mimeType: string,
  filename = "voice_message.webm"
): Promise<VoiceProcessingResult> {
  const base64Audio = audioBuffer.toString("base64");

  // Normalize mime type for Gemini
  let validMime = mimeType;
  if (mimeType.includes("webm")) validMime = "audio/webm";
  else if (mimeType.includes("mp3")) validMime = "audio/mp3";
  else if (mimeType.includes("wav")) validMime = "audio/wav";
  else if (mimeType.includes("ogg")) validMime = "audio/ogg";

  const response = await ai.models.generateContent({
    model: CHAT_MODEL,
    contents: [
      {
        inlineData: {
          data: base64Audio,
          mimeType: validMime,
        },
      },
      `You are a Speech-to-Text Engine. 
1. Transcribe the audio message verbatim in its original language.
2. Identify the emotional tone (e.g. Enthusiastic, Inquiring, Professional, Urgent).
3. Identify the spoken language.
Format output strictly as JSON:
{
  "transcript": "...",
  "detectedTone": "...",
  "languageDetected": "..."
}`,
    ],
  });

  let transcript = "Voice message received.";
  let detectedTone = "Professional";
  let languageDetected = "English";

  try {
    const rawText = response.text || "{}";
    const cleanedJson = rawText.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleanedJson);
    transcript = parsed.transcript || transcript;
    detectedTone = parsed.detectedTone || detectedTone;
    languageDetected = parsed.languageDetected || languageDetected;
  } catch {
    transcript = response.text || transcript;
  }

  return {
    filename,
    mimeType: validMime,
    transcript,
    detectedTone,
    languageDetected,
    summary: `Voice Note (${detectedTone} tone in ${languageDetected}): "${transcript.slice(0, 150)}..."`,
  };
}
