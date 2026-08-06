/**
 * Proposal Generator Engine
 * Converts client requirements & lead qualification data into structured,
 * professional project proposals complete with milestone timelines, deliverables,
 * tech stack architecture, and printable HTML/CSS layouts.
 */

import { ai, CHAT_MODEL } from "@/lib/gemini";
import { LeadQualificationResult } from "./leadQualifier";

export interface ProposalData {
  proposalId: string;
  clientName: string;
  companyName: string;
  projectTitle: string;
  date: string;
  executiveSummary: string;
  recommendedStack: string[];
  architectureOverview: string;
  milestones: Array<{
    phase: string;
    title: string;
    duration: string;
    deliverables: string[];
  }>;
  deliverablesSummary: string[];
  totalInvestment: string;
  paymentSchedule: string[];
  htmlDocument: string;
}

/**
 * Generates structured proposal data and printable HTML document.
 */
export async function generateProjectProposal(
  leadDetails: Partial<LeadQualificationResult> & { clientName?: string; company?: string; requirementsNote?: string }
): Promise<ProposalData> {
  const proposalId = `PROP-${Date.now().toString(36).toUpperCase()}`;
  const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const clientName = leadDetails.clientName || "Valued Client";
  const companyName = leadDetails.company || "Enterprise Client";
  const projectTitle = leadDetails.projectType || "Enterprise AI Platform & Automation Scope";

  const prompt = `You are a Senior Technical Consultant and Proposal Architect.
Generate a structured project proposal for the following client inquiry:
- Client Name: ${clientName}
- Company: ${companyName}
- Project Type: ${projectTitle}
- Budget Tier: ${leadDetails.budgetRange || "$8,000 - $15,000"}
- Timeline: ${leadDetails.timeline || "1 Month"}
- Specific Requirements Note: "${leadDetails.requirementsNote || "Build production-grade GenAI solution with high accuracy and sub-100ms response latency."}"

Instructions:
Generate JSON output strictly matching this schema:
{
  "executiveSummary": "...",
  "recommendedStack": ["Next.js 16", "Python FastAPI", "Google Gemini 2.5", "Pinecone Vector DB", "LangGraph"],
  "architectureOverview": "...",
  "milestones": [
    {
      "phase": "Phase 1",
      "title": "Discovery & Architecture Blueprint",
      "duration": "Week 1",
      "deliverables": ["System Architecture Diagram", "Database Schema", "API Contract"]
    },
    {
      "phase": "Phase 2",
      "title": "Core AI Pipeline & Integration",
      "duration": "Weeks 2-3",
      "deliverables": ["RAG Vector Indexing", "Multi-Agent State Graph", "Next.js UI"]
    },
    {
      "phase": "Phase 3",
      "title": "Testing, Deployment & Handoff",
      "duration": "Week 4",
      "deliverables": ["Docker Containers", "Vercel / GCP Cloud Deployment", "Documentation & Training"]
    }
  ],
  "deliverablesSummary": ["Production Source Code", "CI/CD Deployment Pipelines", "Post-Launch Support"],
  "totalInvestment": "$12,500",
  "paymentSchedule": ["50% Deposit upon Signing", "25% Midway Demo Milestone", "25% Final Handoff"]
}`;

  const response = await ai.models.generateContent({
    model: CHAT_MODEL,
    contents: prompt,
  });

  let executiveSummary = "Comprehensive AI Engineering & SaaS Platform Proposal.";
  let recommendedStack: string[] = ["Next.js 16", "Python FastAPI", "Gemini 2.5", "Pinecone"];
  let architectureOverview = "High-performance hybrid RAG architecture with sub-100ms response latencies.";
  let milestones = [
    { phase: "Phase 1", title: "Architecture & Blueprint", duration: "Week 1", deliverables: ["Architecture Spec", "DB Schema"] },
    { phase: "Phase 2", title: "Core Implementation", duration: "Weeks 2-3", deliverables: ["RAG Engine", "Next.js Interface"] },
    { phase: "Phase 3", title: "Deployment & Delivery", duration: "Week 4", deliverables: ["Cloud Deployment", "Documentation"] },
  ];
  let deliverablesSummary = ["Production Codebase", "API Documentation", "Deployment Infrastructure"];
  let totalInvestment = leadDetails.budgetRange || "$12,500";
  let paymentSchedule = ["50% Deposit", "25% Midpoint Demo", "25% Delivery"];

  try {
    const rawText = response.text || "{}";
    const cleanedJson = rawText.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleanedJson);
    executiveSummary = parsed.executiveSummary || executiveSummary;
    recommendedStack = parsed.recommendedStack || recommendedStack;
    architectureOverview = parsed.architectureOverview || architectureOverview;
    milestones = parsed.milestones || milestones;
    deliverablesSummary = parsed.deliverablesSummary || deliverablesSummary;
    totalInvestment = parsed.totalInvestment || totalInvestment;
    paymentSchedule = parsed.paymentSchedule || paymentSchedule;
  } catch (err) {
    console.error("Proposal JSON Parse Warning:", err);
  }

  // Generate clean, printable HTML document with embedded styles
  const htmlDocument = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Proposal - ${projectTitle}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 800px; margin: 0 auto; padding: 40px 20px; background: #f8fafc; }
    .proposal-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #6366f1; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { font-size: 24px; color: #4338ca; margin: 0; }
    .header .meta { font-size: 13px; color: #64748b; text-align: right; }
    .section-title { font-size: 18px; font-weight: 700; color: #334155; border-left: 4px solid #6366f1; padding-left: 10px; margin-top: 30px; margin-bottom: 15px; }
    .badge { display: inline-block; background: #e0e7ff; color: #3730a3; font-weight: 600; font-size: 12px; padding: 4px 10px; border-radius: 20px; margin-right: 6px; margin-bottom: 6px; }
    .milestone-box { background: #f1f5f9; border-radius: 8px; padding: 15px; margin-bottom: 12px; border-left: 3px solid #4338ca; }
    .milestone-title { font-weight: 700; color: #1e293b; }
    .milestone-duration { font-size: 12px; color: #64748b; font-weight: 600; }
    .investment-box { background: #4338ca; color: #ffffff; padding: 25px; border-radius: 10px; text-align: center; margin-top: 30px; }
    .investment-amount { font-size: 32px; font-weight: 800; margin: 10px 0; }
    .footer { font-size: 12px; color: #94a3b8; text-align: center; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="proposal-card">
    <div class="header">
      <div>
        <h1>Project Architecture Proposal</h1>
        <div style="color: #64748b; font-size: 14px; margin-top: 4px;">Prepared for <strong>${clientName}</strong> (${companyName})</div>
      </div>
      <div class="meta">
        <div>Ref: <strong>${proposalId}</strong></div>
        <div>Date: ${dateStr}</div>
      </div>
    </div>

    <div class="section-title">Executive Summary</div>
    <p>${executiveSummary}</p>

    <div class="section-title">Recommended Technology Stack</div>
    <div>
      ${recommendedStack.map((tech) => `<span class="badge">${tech}</span>`).join("")}
    </div>

    <div class="section-title">System Architecture Overview</div>
    <p>${architectureOverview}</p>

    <div class="section-title">Implementation Milestones & Deliverables</div>
    ${milestones
      .map(
        (m) => `
      <div class="milestone-box">
        <div class="milestone-title">${m.phase}: ${m.title} <span class="milestone-duration">(${m.duration})</span></div>
        <ul style="margin: 8px 0 0 20px; padding: 0; font-size: 14px; color: #475569;">
          ${m.deliverables.map((d) => `<li>${d}</li>`).join("")}
        </ul>
      </div>
    `
      )
      .join("")}

    <div class="section-title">Final Key Deliverables</div>
    <ul>
      ${deliverablesSummary.map((item) => `<li>${item}</li>`).join("")}
    </ul>

    <div class="investment-box">
      <div style="font-size: 14px; text-transform: uppercase; tracking-wider: 1px;">Estimated Total Investment</div>
      <div class="investment-amount">${totalInvestment}</div>
      <div style="font-size: 13px; opacity: 0.9;">
        Schedule: ${paymentSchedule.join(" • ")}
      </div>
    </div>

    <div class="footer">
      Prepared by Sumit Kumar — Senior GenAI & Full-Stack Architect • Contact: sumit0593@gmail.com
    </div>
  </div>
</body>
</html>`;

  return {
    proposalId,
    clientName,
    companyName,
    projectTitle,
    date: dateStr,
    executiveSummary,
    recommendedStack,
    architectureOverview,
    milestones,
    deliverablesSummary,
    totalInvestment,
    paymentSchedule,
    htmlDocument,
  };
}
