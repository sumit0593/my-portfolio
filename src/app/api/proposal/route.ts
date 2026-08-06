import { NextRequest, NextResponse } from "next/server";
import { generateProjectProposal } from "@/lib/agents/proposalGenerator";
import { getOrCreateSession } from "@/lib/session";
import { analyzeLimiter, getRateLimitToken } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting Check
    const token = getRateLimitToken(req);
    const { success: withinLimit } = analyzeLimiter.check(5, token);
    if (!withinLimit) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded. Please wait before generating another proposal." },
        { status: 429 }
      );
    }

    // 2. Load Session details if available
    const { dbSession } = await getOrCreateSession();
    const leadDetails = dbSession.leadDetails || {};

    // 3. Parse input overrides from request body
    const body = await req.json().catch(() => ({}));
    const clientName = body.clientName || leadDetails.clientName || "Valued Client";
    const company = body.company || leadDetails.company || "Enterprise Partner";
    const requirementsNote = body.requirementsNote || body.message || "Custom AI Architecture & Full Stack Platform Scope";

    const proposal = await generateProjectProposal({
      ...leadDetails,
      clientName,
      company,
      requirementsNote,
    });

    return NextResponse.json({
      success: true,
      proposalId: proposal.proposalId,
      date: proposal.date,
      clientName: proposal.clientName,
      companyName: proposal.companyName,
      projectTitle: proposal.projectTitle,
      executiveSummary: proposal.executiveSummary,
      recommendedStack: proposal.recommendedStack,
      milestones: proposal.milestones,
      totalInvestment: proposal.totalInvestment,
      paymentSchedule: proposal.paymentSchedule,
      htmlDocument: proposal.htmlDocument,
    });
  } catch (err: any) {
    console.error("[Proposal Generation Error]", err);
    return NextResponse.json(
      { success: false, error: "Failed to generate project proposal." },
      { status: 500 }
    );
  }
}
