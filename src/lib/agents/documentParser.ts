/**
 * Multi-Modal Document & File Parser Engine
 * Handles client uploaded files: PDF, DOCX, TXT, MD, Images (Screenshots), and Code Snippets.
 * Extracts technical specs, requirements, and background context for AI conversation engine.
 */

import { ai, CHAT_MODEL } from "@/lib/gemini";

export interface DocumentAnalysisResult {
  filename: string;
  fileType: string;
  fileSizeBytes: number;
  extractedText: string;
  technicalRequirements: string[];
  summary: string;
}

/**
 * Parses uploaded document file buffer and returns structured analysis.
 */
export async function parseUploadedDocument(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<DocumentAnalysisResult> {
  const fileSizeBytes = buffer.length;
  let extractedText = "";

  // 1. Text-based files
  if (
    mimeType.startsWith("text/") ||
    filename.endsWith(".txt") ||
    filename.endsWith(".md") ||
    filename.endsWith(".json")
  ) {
    extractedText = buffer.toString("utf-8");
  } else if (mimeType.startsWith("image/")) {
    // 2. Image files (OCR / Multimodal Analysis)
    const base64Data = buffer.toString("base64");
    const response = await ai.models.generateContent({
      model: CHAT_MODEL,
      contents: [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        },
        "Extract all readable text, system diagrams, technical requirements, or mockups shown in this image. Provide a detailed transcription.",
      ],
    });
    extractedText = response.text || "Image provided, but no text could be extracted.";
  } else {
    // 3. Fallback for binary / document formats
    extractedText = buffer.toString("utf-8", 0, Math.min(buffer.length, 10000));
  }

  // Summarize and extract technical requirements using Gemini
  const summaryResponse = await ai.models.generateContent({
    model: CHAT_MODEL,
    contents: `Analyze the following document provided by a client:
Filename: ${filename}
Extracted Content:
${extractedText.slice(0, 4000)}

Instructions:
1. Provide a concise 2-3 sentence executive summary of the document.
2. Extract bullet points of key technical requirements, budget mentions, or project goals.
Format response strictly as JSON:
{
  "summary": "...",
  "technicalRequirements": ["req 1", "req 2"]
}`,
  });

  let summary = "Client document attached for review.";
  let technicalRequirements: string[] = [];

  try {
    const rawText = summaryResponse.text || "{}";
    const cleanedJson = rawText.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleanedJson);
    summary = parsed.summary || summary;
    technicalRequirements = parsed.technicalRequirements || [];
  } catch {
    summary = summaryResponse.text?.slice(0, 300) || summary;
  }

  return {
    filename,
    fileType: mimeType,
    fileSizeBytes,
    extractedText,
    technicalRequirements,
    summary,
  };
}
