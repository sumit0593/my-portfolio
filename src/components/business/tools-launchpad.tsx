"use client";

import Link from "next/link";
import { StitchCard, StitchCardHeader, StitchCardTitle, StitchCardContent, StitchCardFooter } from "@/components/stitch/stitch-card";
import { StitchBadge } from "@/components/stitch/stitch-badge";
import { Button } from "@/components/ui/button";
import { Bot, FileText, Sparkles, ArrowRight, Zap, Database } from "lucide-react";

const AI_TOOLS = [
  {
    id: "resume-analyzer",
    name: "AI Resume & ATS Optimizer",
    description: "Upload resume documents to receive instant ATS scoring, keyword matching, and AI-driven career suggestions.",
    icon: FileText,
    href: "/tools/resume-analyzer",
    glow: "indigo" as const,
    badge: "Popular Tool",
  },
  {
    id: "rag-sandbox",
    name: "RAG & Vector Search Sandbox",
    description: "Test semantic search retrieval and document embedding pipelines powered by Pinecone & Google GenAI.",
    icon: Database,
    href: "/tools",
    glow: "purple" as const,
    badge: "Interactive",
  },
  {
    id: "prompt-optimizer",
    name: "Prompt Engineering Studio",
    description: "Optimize zero-shot, few-shot, and Chain-of-Thought prompts with automatic token optimization.",
    icon: Zap,
    href: "/tools",
    glow: "emerald" as const,
    badge: "AI Utility",
  },
];

export function ToolsLaunchpad() {
  return (
    <div className="space-y-8 w-full">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider mb-1">
            <Bot className="w-4 h-4" /> AI Sandbox
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Interactive AI Tools Launchpad
          </h2>
        </div>
        <Button variant="outline" asChild className="gap-2">
          <Link href="/tools">
            Explore All Tools <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {AI_TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <StitchCard key={tool.id} glowColor={tool.glow} className="flex flex-col">
              <StitchCardHeader>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Icon className="w-5 h-5" />
                  </div>
                  <StitchBadge variant={tool.glow === "indigo" ? "primary" : tool.glow === "purple" ? "purple" : "emerald"}>
                    {tool.badge}
                  </StitchBadge>
                </div>
                <StitchCardTitle className="text-lg">{tool.name}</StitchCardTitle>
              </StitchCardHeader>
              <StitchCardContent className="flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {tool.description}
                </p>
              </StitchCardContent>
              <StitchCardFooter>
                <Button className="w-full gap-2 text-xs font-semibold" asChild>
                  <Link href={tool.href}>
                    Launch App <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </Button>
              </StitchCardFooter>
            </StitchCard>
          );
        })}
      </div>
    </div>
  );
}
