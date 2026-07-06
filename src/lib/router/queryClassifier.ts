export type QueryIntent = 
  | "recruiter_query"
  | "skill_query"
  | "project_query"
  | "architecture_query"
  | "hiring_query"
  | "service_query"
  | "contact_query"
  | "ai_query"
  | "general";

export interface QueryClassification {
  intent: QueryIntent;
  keywords: string[];
  requiresSummary: boolean;
}

const INTENT_PATTERNS: Record<QueryIntent, RegExp[]> = {
  recruiter_query: [/hire/i, /recruit/i, /candidate/i, /resume/i, /cv/i, /background/i],
  skill_query: [/skills?/i, /tech/i, /stack/i, /know/i, /proficient/i, /experience with/i],
  project_query: [/projects?/i, /portfolio/i, /build/i, /built/i, /work/i],
  architecture_query: [/architecture/i, /system design/i, /scalability/i, /microservices/i, /scale/i],
  hiring_query: [/hire/i, /available/i, /freelance/i, /contract/i, /full-time/i, /job/i],
  service_query: [/services?/i, /offer/i, /consulting/i, /can you build/i, /help me/i],
  contact_query: [/contact/i, /email/i, /phone/i, /reach/i, /linkedin/i, /github/i, /number/i, /mobile/i, /call/i, /whatsapp/i, /telegram/i, /\+91/],
  ai_query: [/ai/i, /llm/i, /rag/i, /agent/i, /prompt/i, /gemini/i, /pinecone/i, /vector/i],
  general: []
};

/**
 * Classify a user query to determine routing and metadata filters.
 */
export function classifyQuery(query: string): QueryClassification {
  let matchedIntent: QueryIntent = "general";
  const words = query.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/);

  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
    if (patterns.some(pattern => pattern.test(query))) {
      matchedIntent = intent as QueryIntent;
      break;
    }
  }

  // If asking for a general overview, it might require a summary
  const requiresSummary = matchedIntent === "recruiter_query" && 
    words.some(w => ["summary", "overview", "brief", "profile"].includes(w));

  return {
    intent: matchedIntent,
    keywords: words,
    requiresSummary
  };
}
