import { ai, EMBEDDING_MODEL } from "./gemini";

/**
 * Generate embeddings for an array of text strings.
 * Processes in batches to avoid rate limits or large payload issues.
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const validTexts = texts.filter((t) => t.trim().length > 0);

  if (validTexts.length === 0) {
    throw new Error("No valid (non-empty) text strings to embed.");
  }

  const allEmbeddings: number[][] = [];
  const batchSize = 20;

  for (let i = 0; i < validTexts.length; i += batchSize) {
    const batch = validTexts.slice(i, i + batchSize);
    
    // Process batch in parallel
    const embeddingsBatch = await Promise.all(
      batch.map(async (text) => {
        const cleanText = text.replace(/\n/g, " ").replace(/\s+/g, " ").trim();
        const response = await ai.models.embedContent({
          model: EMBEDDING_MODEL,
          contents: cleanText,
        });
        return response.embeddings?.[0]?.values ?? [];
      })
    );
    
    allEmbeddings.push(...embeddingsBatch);
  }

  return allEmbeddings;
}

/**
 * Determine chunk size dynamically based on section type.
 */
function getChunkConfig(sectionType?: string) {
  switch (sectionType) {
    case "skills":
    case "recruiter_keywords":
      return { size: 150, overlap: 20 };
    case "projects":
    case "experience":
      return { size: 400, overlap: 50 };
    case "architecture":
    case "ai_expertise":
      return { size: 700, overlap: 100 };
    case "achievements":
    case "services":
      return { size: 250, overlap: 30 };
    default:
      return { size: 300, overlap: 50 };
  }
}

/**
 * Semantically chunk text by splitting on known headers first,
 * then further splitting large sections into overlapping chunks.
 */
export function chunkText(text: string, sectionType?: string): string[] {
  const { size: chunkSize, overlap } = getChunkConfig(sectionType);
  const chunks: string[] = [];

  const sections = text.split(/(?=\n[A-Z\s]+\n)/).filter((s) => s.trim().length > 0);

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
