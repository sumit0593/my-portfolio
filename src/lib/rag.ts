import { getPortfolioIndex, PORTFOLIO_NAMESPACE, ensureIndex } from "./pinecone";
import { generateEmbeddings, chunkText } from "./embeddings";



interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface RetrievedChunk {
  text: string;
  score: number;
  source: string;
}



const MAX_MEMORY_MESSAGES = 20; // Store last 20 messages (10 pairs)

class ConversationMemoryStore {
  private store: Map<string, ChatMessage[]> = new Map();

  /**
   * Get conversation history for a session.
   */
  getHistory(sessionId: string): ChatMessage[] {
    return this.store.get(sessionId) || [];
  }

  /**
   * Add a message to the conversation memory.
   * Automatically trims to keep the last MAX_MEMORY_MESSAGES messages.
   */
  addMessage(sessionId: string, message: ChatMessage): void {
    const history = this.store.get(sessionId) || [];
    history.push(message);

    // Trim to keep only the last N messages
    if (history.length > MAX_MEMORY_MESSAGES) {
      this.store.set(sessionId, history.slice(-MAX_MEMORY_MESSAGES));
    } else {
      this.store.set(sessionId, history);
    }
  }

  /**
   * Clear memory for a specific session.
   */
  clearSession(sessionId: string): void {
    this.store.delete(sessionId);
  }
}

// Singleton memory instance
export const conversationMemory = new ConversationMemoryStore();



/**
 * Chunks, embeds, and upserts a document into Pinecone.
 * Calls ensureIndex() first to guarantee the index exists with correct dimensions.
 */
export async function upsertDocument(text: string, title: string, source: string) {
  await ensureIndex();

  const index = getPortfolioIndex();
  const chunks = chunkText(text);

  if (chunks.length === 0) {
    throw new Error("No chunks generated from the input text.");
  }

  console.log(`[RAG] Generated ${chunks.length} semantic chunks from "${title}"`);

  const embeddings = await generateEmbeddings(chunks);

  const vectors = chunks.map((chunk, i) => ({
    id: `${source}-chunk-${i}`,
    values: embeddings[i],
    metadata: {
      text: chunk,
      title: title,
      source: source,
      chunkIndex: i,
    },
  }));

  const batchSize = 50;
  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize);
    await index.upsert({ records: batch as any, namespace: PORTFOLIO_NAMESPACE });
    console.log(`[RAG] Upserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(vectors.length / batchSize)}`);
  }

  return { success: true, chunksCount: chunks.length };
}



const RELEVANCE_THRESHOLD = 0.3; // Discard chunks with score below this

/**
 * Retrieve relevant context chunks from Pinecone for a query.
 * Applies a relevance score filter to avoid injecting irrelevant context.
 */
export async function retrieveContext(query: string, topK = 5): Promise<RetrievedChunk[]> {
  const index = getPortfolioIndex();
  const [queryEmbedding] = await generateEmbeddings([query]);

  const results = await index.query({
    vector: queryEmbedding,
    topK,
    includeMetadata: true,
    namespace: PORTFOLIO_NAMESPACE,
  });

  if (!results.matches || results.matches.length === 0) {
    console.log("[RAG] No matches found in Pinecone.");
    return [];
  }

  const relevantChunks = results.matches
    .filter((match) => (match.score ?? 0) >= RELEVANCE_THRESHOLD)
    .map((match) => ({
      text: match.metadata?.text as string,
      score: match.score ?? 0,
      source: match.metadata?.source as string,
    }))
    .filter((chunk) => chunk.text);

  console.log(
    `[RAG] Retrieved ${relevantChunks.length}/${results.matches.length} chunks above threshold ${RELEVANCE_THRESHOLD}`
  );

  return relevantChunks;
}



/**
 * Build a RAG prompt combining retrieved context, conversation history, and user query.
 */
export function buildRAGPrompt(
  retrievedChunks: RetrievedChunk[],
  conversationHistory: ChatMessage[],
  userQuery: string
): string {
  const contextSection =
    retrievedChunks.length > 0
      ? retrievedChunks
          .map(
            (chunk, i) =>
              `[Source ${i + 1} | Relevance: ${(chunk.score * 100).toFixed(1)}%]\n${chunk.text}`
          )
          .join("\n\n---\n\n")
      : "(No relevant portfolio data found for this query)";

  const memorySection =
    conversationHistory.length > 0
      ? conversationHistory
          .slice(-10) // Last 10 messages (5 pairs)
          .map((msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
          .join("\n")
      : "(No previous conversation)";

  return `You are "AskNova" — an intelligent AI assistant embedded in Sumit Kumar's portfolio website.
Your role is to answer questions about Sumit's professional background, skills, experience, projects, and education.

═══════════════════════════════════════════
RETRIEVED PORTFOLIO DATA (from vector search):
═══════════════════════════════════════════
${contextSection}

═══════════════════════════════════════════
CONVERSATION MEMORY (recent exchanges):
═══════════════════════════════════════════
${memorySection}

═══════════════════════════════════════════
CURRENT USER QUERY: ${userQuery}
═══════════════════════════════════════════

INSTRUCTIONS:
1. Answer ONLY based on the RETRIEVED PORTFOLIO DATA above. Do NOT hallucinate or invent information.
2. If the answer is NOT in the retrieved data, respond: "I don't have that information in the portfolio data."
3. Use the CONVERSATION MEMORY to understand follow-up questions and maintain context continuity.
4. Be professional, concise (3-5 sentences max), and recruiter-friendly.
5. For greetings, respond warmly: "Hello! I'm AskNova, Sumit's AI portfolio assistant. Ask me about his skills, experience, projects, or education!"
6. Format responses using markdown when listing skills, projects, or achievements.
7. Always be accurate — cite specific details from the data when possible.`;
}
