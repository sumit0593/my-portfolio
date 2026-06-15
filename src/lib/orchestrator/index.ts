import { getPortfolioIndex, PORTFOLIO_NAMESPACE, PineconeMetadata } from "../pinecone";
import { generateEmbeddings } from "../embeddings";
import { minisearchManager } from "../search/minisearch";
import { classifyQuery, QueryIntent } from "../router/queryClassifier";
import { globalCache } from "../cache";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const MAX_MEMORY_MESSAGES = 20;

class ConversationMemoryStore {
  private store: Map<string, ChatMessage[]> = new Map();

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
 */
export async function retrieveHybridContext(query: string, topK = 5): Promise<{ chunks: RetrievedChunk[], intent: QueryIntent }> {
  // Check cache first
  const cacheKey = `hybrid-${query}`;
  const cached = globalCache.retrievalCache.get(cacheKey);
  if (cached) return cached;

  const classification = classifyQuery(query);
  const { intent } = classification;

  // 1. Semantic Search (Pinecone)
  const index = getPortfolioIndex();
  const [queryEmbedding] = await generateEmbeddings([query]);

  const pineconeResults = await index.query({
    vector: queryEmbedding,
    topK: 10,
    includeMetadata: true,
    namespace: PORTFOLIO_NAMESPACE,
  });

  // 2. Keyword Search (MiniSearch)
  const bm25Results = minisearchManager.search(query, {
    boost: { recruiter_keywords: 2, title: 1.5, semantic_tags: 1.5, text: 1 },
    fuzzy: 0.2,
    prefix: true
  });

  // 3. Reciprocal Rank Fusion
  const fusionMap = new Map<string, { chunk: RetrievedChunk, rankP: number, rankB: number }>();

  // Map Pinecone results
  (pineconeResults.matches || []).forEach((match, index) => {
    fusionMap.set(match.id, {
      chunk: {
        id: match.id,
        text: match.metadata?.text as string,
        score: match.score || 0, // Temporary score
        source: match.metadata?.source as string,
        metadata: match.metadata as PineconeMetadata
      },
      rankP: index + 1,
      rankB: 0
    });
  });

  // Map BM25 results
  bm25Results.slice(0, 10).forEach((match, index) => {
    if (fusionMap.has(match.id)) {
      fusionMap.get(match.id)!.rankB = index + 1;
    } else {
      fusionMap.set(match.id, {
        chunk: {
          id: match.id,
          text: match.text,
          score: match.score || 0,
          source: match.source,
          metadata: match as unknown as PineconeMetadata
        },
        rankP: 0,
        rankB: index + 1
      });
    }
  });

  // 4. Calculate Final Scores and apply boosts
  const fusedChunks = Array.from(fusionMap.values()).map(item => {
    const rrfScore = computeRRF(item.rankP, item.rankB);
    item.chunk.score = applyMetadataBoost({ ...item.chunk, score: rrfScore }, intent);
    return item.chunk;
  });

  // 5. Sort by score and take Top K
  fusedChunks.sort((a, b) => b.score - a.score);
  const finalChunks = fusedChunks.slice(0, topK);

  const result = { chunks: finalChunks, intent };
  
  // Cache result
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
    intentInstructions = "Provide his email (sumitsumitsumit163@gmail.com), phone (7011676185), and LinkedIn/GitHub links.";
  }

  return `You are "Nova" — a Recruiter-Grade AI Assistant embedded in Sumit Kumar's portfolio.
Your purpose is to answer questions strictly about Sumit's background, skills, and projects based on the provided metadata context.

═══════════════════════════════════════════
HYBRID RETRIEVED CONTEXT (Pinecone + BM25):
═══════════════════════════════════════════
${contextSection}

═══════════════════════════════════════════
CONVERSATION MEMORY:
═══════════════════════════════════════════
${memorySection}

═══════════════════════════════════════════
CURRENT USER QUERY: ${userQuery}
CLASSIFIED INTENT: ${intent}
═══════════════════════════════════════════

STRICT SYSTEM RULES:
1. Answer ONLY based on the RETRIEVED CONTEXT above. Do NOT hallucinate or invent information.
2. If the answer is NOT in the retrieved data, say exactly: "I don't have that information in the portfolio data, but I'd be happy to discuss his GenAI projects, enterprise React experience, or RAG architectures."
3. Do not infer years of experience unless explicitly stated in the metrics.
4. Keep responses professional, recruiter-friendly, and concise. 
5. ${intentInstructions}
6. Always format responses clearly using markdown when listing items.
`;
}
