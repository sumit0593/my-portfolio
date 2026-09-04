import { getPortfolioIndex, PORTFOLIO_NAMESPACE, PineconeMetadata } from "../pinecone";
import { generateEmbeddings } from "../embeddings";
import { minisearchManager } from "../search/minisearch";
import { classifyQuery, QueryIntent } from "../router/queryClassifier";
import { globalCache } from "../cache";
import { LRUCache } from "lru-cache";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const MAX_MEMORY_MESSAGES = 20;

class ConversationMemoryStore {
  // M-04: Bounded LRU store to prevent memory exhaustion from unbounded sessions
  private store = new LRUCache<string, ChatMessage[]>({
    max: 1000,                   // Max 1000 concurrent sessions
    ttl: 1000 * 60 * 60,        // 1 hour TTL per session
  });

  getHistory(sessionId: string): ChatMessage[] {
    return this.store.get(sessionId) || [];
  }

  addMessage(sessionId: string, message: ChatMessage): void {
    const history = this.store.get(sessionId) || [];
    history.push(message);
    if (history.length > MAX_MEMORY_MESSAGES) {
      this.store.set(sessionId, history.slice(-MAX_MEMORY_MESSAGES));
    } else {
      this.store.set(sessionId, history);
    }
  }

  clearSession(sessionId: string): void {
    this.store.delete(sessionId);
  }
}

export const conversationMemory = new ConversationMemoryStore();

export interface RetrievedChunk {
  id: string;
  text: string;
  score: number;
  source: string;
  metadata?: PineconeMetadata;
}

const K = 60; // RRF Constant

/**
 * Computes Reciprocal Rank Fusion score.
 */
function computeRRF(rankPinecone: number, rankBM25: number): number {
  const pScore = rankPinecone > 0 ? 1 / (K + rankPinecone) : 0;
  const bScore = rankBM25 > 0 ? 1 / (K + rankBM25) : 0;
  return pScore + bScore;
}

/**
 * Apply metadata boosting based on query classification.
 */
function applyMetadataBoost(chunk: RetrievedChunk, intent: QueryIntent): number {
  let boost = 0;
  const metadata = chunk.metadata || ({} as PineconeMetadata);

  // Boost based on priority score
  if (metadata.priority_score) {
    boost += (metadata.priority_score / 100);
  }

  // Boost projects if project query
  if (intent === "project_query" && metadata.type === "project") {
    boost += 0.1;
  }

  // Boost skills if skill query
  if (intent === "skill_query" && metadata.section === "skills") {
    boost += 0.15;
  }

  // Boost AI/Architecture tags
  if (intent === "architecture_query" || intent === "ai_query") {
    if (metadata.architecture_tags || metadata.ai_specializations) {
      boost += 0.1;
    }
  }

  return chunk.score + boost;
}

/**
 * Perform hybrid retrieval (Pinecone + MiniSearch) with RRF and Metadata Boosting.
 *
 * Latency model (cold path):
 *   BM25 (~5ms, sync) fires first — does NOT block embedding.
 *   Embedding cache check → API call (150–250ms) if miss.
 *   Pinecone query (80–120ms) runs after embedding resolves.
 *
 * Two-level cache:
 *   L1 retrievalCache HIT  → full retrieval result,  ≈ 1–5ms
 *   L2 embeddingCache HIT  → skips Gemini API,       ≈ 80–130ms (still needs Pinecone)
 *   Cold                   → full pipeline,           ≈ 230–370ms
 */
export async function retrieveHybridContext(query: string, topK = 5): Promise<{ chunks: RetrievedChunk[], intent: QueryIntent }> {
  const t0 = Date.now();

  // ── L1: RAG result cache ───────────────────────────────────────────────────
  const cacheKey = `hybrid-${query}`;
  const cached = globalCache.retrievalCache.get(cacheKey);
  if (cached) {
    if (process.env.NODE_ENV === "development") {
      console.debug("[RAG]", { ragCacheHit: true, retrievalMs: Date.now() - t0 });
    }
    return cached;
  }

  const classification = classifyQuery(query);
  const { intent } = classification;

  // ── Stage 1a: BM25 (sync, ~5ms) — fire before awaiting anything ───────────
  // Runs synchronously here so it doesn't sit on the critical path behind
  // the embedding API. The ~5ms saving is modest but architecturally correct.
  const t1 = Date.now();
  const bm25Results = minisearchManager.search(query, {
    boost: { recruiter_keywords: 2, title: 1.5, semantic_tags: 1.5, text: 1 },
    fuzzy: 0.2,
    prefix: true,
  });
  const bm25Ms = Date.now() - t1;

  // ── Stage 1b: Embedding (async, 0ms cache hit or ~150–250ms API call) ──────
  const t2 = Date.now();
  const embeddingCacheKey = `emb-${query}`;
  const cachedEmbedding = globalCache.embeddingCache.get(embeddingCacheKey);
  let queryEmbedding: number[];
  if (cachedEmbedding) {
    queryEmbedding = cachedEmbedding;
  } else {
    [queryEmbedding] = await generateEmbeddings([query]);
    globalCache.embeddingCache.set(embeddingCacheKey, queryEmbedding);
  }
  const embeddingMs = Date.now() - t2;

  // ── Stage 2: Vector search (Pinecone, ~80–120ms) ───────────────────────────
  const t3 = Date.now();
  const index = getPortfolioIndex();
  const pineconeResults = await index.query({
    vector: queryEmbedding,
    topK: 10,
    includeMetadata: true,
    namespace: PORTFOLIO_NAMESPACE,
  });
  const pineconeMs = Date.now() - t3;

  // ── Stage 3: RRF Fusion ────────────────────────────────────────────────────
  const t4 = Date.now();
  const fusionMap = new Map<string, { chunk: RetrievedChunk; rankP: number; rankB: number }>();

  // Map Pinecone results
  (pineconeResults.matches || []).forEach((match, idx) => {
    fusionMap.set(match.id, {
      chunk: {
        id: match.id,
        text: match.metadata?.text as string,
        score: match.score || 0,
        source: match.metadata?.source as string,
        metadata: match.metadata as PineconeMetadata,
      },
      rankP: idx + 1,
      rankB: 0,
    });
  });

  // Map BM25 results
  bm25Results.slice(0, 10).forEach((match, idx) => {
    if (fusionMap.has(match.id)) {
      fusionMap.get(match.id)!.rankB = idx + 1;
    } else {
      fusionMap.set(match.id, {
        chunk: {
          id: match.id,
          text: match.text,
          score: match.score || 0,
          source: match.source,
          metadata: match as unknown as PineconeMetadata,
        },
        rankP: 0,
        rankB: idx + 1,
      });
    }
  });

  // Calculate final scores with metadata boost
  const fusedChunks = Array.from(fusionMap.values()).map((item) => {
    const rrfScore = computeRRF(item.rankP, item.rankB);
    item.chunk.score = applyMetadataBoost({ ...item.chunk, score: rrfScore }, intent);
    return item.chunk;
  });

  fusedChunks.sort((a, b) => b.score - a.score);
  const finalChunks = fusedChunks.slice(0, topK);
  const fusionMs = Date.now() - t4;

  // ── Structured instrumentation (dev only) ──────────────────────────────────
  if (process.env.NODE_ENV === "development") {
    console.debug("[RAG]", {
      ragCacheHit: false,
      embCacheHit: !!cachedEmbedding,
      bm25Ms,
      embeddingMs,
      pineconeMs,
      fusionMs,
      retrievalMs: Date.now() - t0,
      chunks: finalChunks.length,
    });
  }

  const result = { chunks: finalChunks, intent };
  globalCache.retrievalCache.set(cacheKey, result);
  return result;
}


export function buildOrchestratedPrompt(
  retrievedChunks: RetrievedChunk[],
  conversationHistory: ChatMessage[],
  userQuery: string,
  intent: QueryIntent
): string {
  const contextSection =
    retrievedChunks.length > 0
      ? retrievedChunks
        .map(
          (chunk) =>
            `[Source: ${chunk.source} | Score: ${(chunk.score * 100).toFixed(1)}]\n${chunk.text}`
        )
        .join("\n\n---\n\n")
      : "(No highly relevant portfolio data found for this exact query)";

  const memorySection =
    conversationHistory.length > 0
      ? conversationHistory
        .slice(-6)
        .map((msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
        .join("\n")
      : "(No previous conversation)";

  let intentInstructions = "";
  if (intent === "recruiter_query") {
    intentInstructions = "Focus on presenting Sumit as a strong candidate. Highlight impact metrics and enterprise experience.";
  } else if (intent === "skill_query") {
    intentInstructions = "List specific tools, frameworks, and deployment platforms relevant to the skill query. Be concise and accurate.";
  } else if (intent === "project_query") {
    intentInstructions = "Highlight the technical architecture, business impact, and AI capabilities of the projects mentioned.";
  } else if (intent === "contact_query") {
    intentInstructions = "Provide contact information ONLY from the retrieved context above. Include LinkedIn and GitHub links if available in the data.";
  }

  return `You are Nova — Sumit Kumar's personal AI career assistant, embedded directly in his portfolio.
You speak with warmth, precision, and a touch of personality. You are knowledgeable, calm, and genuinely helpful — like a great recruiter who also happens to understand code deeply.

Your sole purpose is to help visitors — recruiters, engineers, and collaborators — understand Sumit's work, skills, and background through the portfolio data retrieved below.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PORTFOLIO CONTEXT (Hybrid Retrieval: Pinecone + BM25)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${contextSection}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONVERSATION HISTORY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${memorySection}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CURRENT QUERY: ${userQuery}
INTENT: ${intent}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RESPONSE GUIDELINES:

1. **Ground every answer in the retrieved context.** Do not invent details, metrics, or experiences not present above.

2. **Tone:** Conversational but professional. Write like a thoughtful human, not a list-generator. Avoid robotic phrasing like "Based on the retrieved data..." — just answer naturally.

3. **When you don't have the answer:** Say something like — "That's not something I have details on in Sumit's portfolio right now, but I can tell you about his [relevant alternative — e.g., RAG projects / GenAI expertise / enterprise experience] if that helps."

4. **Format smartly:** Use markdown lists or headers only when they genuinely improve clarity (e.g., listing multiple skills or projects). For short answers, plain prose is better.

5. **${intentInstructions}**

6. **End with a natural follow-up** when appropriate — offer to go deeper on a topic, suggest a related area, or ask if they'd like the resume.

7. **Resume:** If the user asks for Sumit's resume, CV, or download link — provide both:
   [Download Resume (PDF)](/resume/Sumit_Kumar_GenAI_Full_Stack.pdf)
   [Download Resume (DOCX)](/resume/Sumit_Kumar_GenAI_Full_Stack.docx)

8. **Do not infer years of experience** unless explicitly stated in the retrieved data.
`;
}

