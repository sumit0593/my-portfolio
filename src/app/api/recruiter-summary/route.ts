import { NextResponse } from "next/server";
import { globalCache } from "@/lib/cache";
import { ai, CHAT_MODEL } from "@/lib/gemini";
import fs from "fs";
import path from "path";

// Predefined roles we can precompute/cache
const PRECOMPUTED_ROLES = ["ai engineer", "full stack engineer", "genai engineer", "freelancer"];

async function getBaseContext() {
  const metaPath = path.join(process.cwd(), "data", "metadata", "metadata.json");
  if (fs.existsSync(metaPath)) {
    return fs.readFileSync(metaPath, "utf-8");
  }
  return "";
}

export async function POST(req: Request) {
  try {
    const { role, customJD } = await req.json();

    const roleKey = role?.toLowerCase() || "general";
    const cacheKey = `summary-${roleKey}-${customJD ? "custom" : "standard"}`;

    const cached = globalCache.summaryCache.get(cacheKey);
    if (cached) {
      return NextResponse.json({ success: true, summary: cached, cached: true });
    }

    const context = await getBaseContext();

    const prompt = `You are generating a Recruiter Candidate Summary for Sumit Kumar.
Based on this portfolio metadata:
${context}

Generate a concise, professional, highly convincing candidate summary.
Target Role/Focus: ${role || "General AI/Full Stack Engineer"}
${customJD ? `Custom Job Description / Requirements to align with:\n${customJD}` : ""}

Keep it to 3-4 short paragraphs. Highlight specific impact metrics and top matching projects.`;

    const response = await ai.models.generateContent({
      model: CHAT_MODEL,
      contents: prompt,
      config: { temperature: 0.2, maxOutputTokens: 512 }
    });

    const summary = response.text;
    if (summary) {
      globalCache.summaryCache.set(cacheKey, summary);
    }

    return NextResponse.json({ success: true, summary, cached: false });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to generate summary." }, { status: 500 });
  }
}
