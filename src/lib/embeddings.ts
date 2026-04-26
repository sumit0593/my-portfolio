import { ai, EMBEDDING_MODEL } from "./gemini";

/**
 * Generate embeddings for an array of text strings.
 * Filters empty strings to prevent API errors.
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {

  const validTexts = texts.filter((t) => t.trim().length > 0);

  if (validTexts.length === 0) {
    throw new Error("No valid (non-empty) text strings to embed.");
  }

  const embeddings = await Promise.all(
    validTexts.map(async (text) => {

      const cleanText = text.replace(/\n/g, " ").replace(/\s+/g, " ").trim();

      const response = await ai.models.embedContent({
        model: EMBEDDING_MODEL,
        contents: cleanText,
      });

      return response.embeddings?.[0]?.values ?? [];
    })
  );

  return embeddings;
}

/**
 * Section headers used to detect semantic boundaries in resume text.
 */
const SECTION_HEADERS = [
  "PROFILE SUMMARY",
  "TECHNICAL SKILLS",
  "PROFESSIONAL EXPERIENCE",
  "PROJECTS",
  "KEY ACHIEVEMENTS",
  "EDUCATION",
  "CERTIFICATIONS & TRAINING",
  "CERTIFICATIONS",
];

/**
 * Semantically chunk text by splitting on known headers first,
 * then further splitting large sections into overlapping chunks.
 */
export function chunkText(text: string, chunkSize = 300, overlap = 50): string[] {
  const chunks: string[] = [];


  const headerPattern = new RegExp(
    `(?=^(?:${SECTION_HEADERS.join("|")})\\s*$)`,
    "mi"
  );


  const sections = text.split(headerPattern).filter((s) => s.trim().length > 0);

  for (const section of sections) {
    const trimmed = section.trim();
    const words = trimmed.split(/\s+/);

    if (words.length <= chunkSize) {

      chunks.push(trimmed);
    } else {

      for (let i = 0; i < words.length; i += chunkSize - overlap) {
        const chunk = words.slice(i, i + chunkSize).join(" ");
        if (chunk.trim().length > 0) {
          chunks.push(chunk);
        }
      }
    }
  }

  return chunks.filter((chunk) => chunk.trim().length > 0);
}
