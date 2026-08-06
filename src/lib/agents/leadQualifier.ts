/**
 * Automated Lead Qualification Engine
 * Parses incoming messages to extract structured client lead intelligence:
 * - Budget Tier (<$5k, $5k-$15k, $15k-$30k, $30k+)
 * - Timeline (Urgent <2 wks, 1 Month, 2-3 Months, Flexible)
 * - Project Type (GenAI & RAG, Multi-Agent System, Full-Stack SaaS, Code Audit)
 * - Calculated Lead Quality Score (High | Medium | Low)
 */

export interface LeadQualificationResult {
  clientName?: string;
  company?: string;
  budgetRange?: string;
  timeline?: string;
  projectType?: string;
  requiredTech: string[];
  leadScore: "High" | "Medium" | "Low";
  scoreReasoning: string;
}

/**
 * Evaluates messages to extract lead details and compute Lead Score.
 */
export function extractLeadQualification(messages: Array<{ role: string; content: string }>): LeadQualificationResult {
  const fullConversation = messages.map((m) => m.content).join("\n").toLowerCase();

  let clientName: string | undefined = undefined;
  let company: string | undefined = undefined;
  let budgetRange: string | undefined = undefined;
  let timeline: string | undefined = undefined;
  let projectType: string | undefined = undefined;
  const requiredTech: string[] = [];

  // 1. Detect Budget Range
  if (/\b(30k|30,000|50k|enterprise|large budget)\b/i.test(fullConversation)) {
    budgetRange = "$30,000+ (Enterprise Tier)";
  } else if (/\b(15k|20k|25k|15,000|20,000)\b/i.test(fullConversation)) {
    budgetRange = "$15,000 - $30,000 (Custom Platform Tier)";
  } else if (/\b(5k|8k|10k|12k|5,000|10,000)\b/i.test(fullConversation)) {
    budgetRange = "$5,000 - $15,000 (RAG & Agent System Tier)";
  } else if (/\b(2.5k|3k|4k|2,500|small budget|mvp)\b/i.test(fullConversation)) {
    budgetRange = "<$5,000 (MVP / Tool Integration Tier)";
  }

  // 2. Detect Timeline
  if (/\b(asap|urgent|immediately|2 weeks|14 days)\b/i.test(fullConversation)) {
    timeline = "Urgent (< 2 weeks)";
  } else if (/\b(1 month|30 days|4 weeks)\b/i.test(fullConversation)) {
    timeline = "Standard (1 Month)";
  } else if (/\b(2 months|3 months|quarter)\b/i.test(fullConversation)) {
    timeline = "Medium Term (2-3 Months)";
  } else if (/\b(flexible|no rush|exploring)\b/i.test(fullConversation)) {
    timeline = "Flexible";
  }

  // 3. Detect Project Type
  if (/\b(rag|vector|embeddings|pinecone|document search)\b/i.test(fullConversation)) {
    projectType = "Enterprise RAG & Knowledge Engine";
  } else if (/\b(agent|multi-agent|langgraph|crewai|autogen|automation)\b/i.test(fullConversation)) {
    projectType = "Multi-Agent System & Automation";
  } else if (/\b(saas|full stack|nextjs|react|platform)\b/i.test(fullConversation)) {
    projectType = "Full-Stack Next.js AI SaaS";
  } else if (/\b(audit|refactor|migration|consultation)\b/i.test(fullConversation)) {
    projectType = "AI Architecture Audit & Consultation";
  }

  // 4. Detect Required Tech
  const techKeywords = [
    "next.js", "react", "python", "fastapi", "langchain", "langgraph",
    "pinecone", "chromadb", "gcp", "docker", "gemini", "openai", "claude"
  ];
  for (const tech of techKeywords) {
    if (fullConversation.includes(tech)) {
      requiredTech.push(tech.toUpperCase());
    }
  }

  // 5. Calculate Lead Score
  let scorePoints = 0;

  if (budgetRange?.includes("$30,000+") || budgetRange?.includes("$15,000")) scorePoints += 4;
  else if (budgetRange?.includes("$5,000")) scorePoints += 2;
  else if (budgetRange) scorePoints += 1;

  if (timeline?.includes("Urgent") || timeline?.includes("Standard")) scorePoints += 3;
  else if (timeline) scorePoints += 1;

  if (projectType) scorePoints += 2;
  if (requiredTech.length > 0) scorePoints += 1;

  let leadScore: "High" | "Medium" | "Low" = "Low";
  let scoreReasoning = "Early-stage inquiry or general portfolio exploration.";

  if (scorePoints >= 6) {
    leadScore = "High";
    scoreReasoning = "High-intent lead with defined budget, target timeline, and specific technical project scope.";
  } else if (scorePoints >= 3) {
    leadScore = "Medium";
    scoreReasoning = "Moderate-intent lead actively evaluating service tiers or technical capabilities.";
  }

  return {
    clientName,
    company,
    budgetRange,
    timeline,
    projectType,
    requiredTech,
    leadScore,
    scoreReasoning,
  };
}

/**
 * Builds lead qualification prompt injection for AI.
 */
export function buildLeadQualificationDirective(result: LeadQualificationResult): string {
  if (result.leadScore === "Low") {
    return `LEAD CONTEXT: The client is in early exploration phase. Smoothly inquire about their upcoming project goals, target timeline, or budget tier if relevant.`;
  }

  return `LEAD CONTEXT: Active Lead Identified!
- Calculated Lead Quality: ${result.leadScore} Priority
- Budget Scope: ${result.budgetRange || "To be confirmed"}
- Timeline: ${result.timeline || "To be confirmed"}
- Project Type: ${result.projectType || "General Engineering Scope"}
- Key Stack: ${result.requiredTech.join(", ") || "Full-Stack AI"}
Instruction: Maintain high conversion momentum. Offer to draft a preliminary project proposal or schedule a 1-on-1 architecture call.`;
}
