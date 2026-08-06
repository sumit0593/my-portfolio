"use client";

import { useState } from "react";
import { StitchCard, StitchCardHeader, StitchCardTitle, StitchCardContent, StitchCardFooter } from "@/components/stitch/stitch-card";
import { StitchBadge } from "@/components/stitch/stitch-badge";
import { Button } from "@/components/ui/button";
import { Bot, Code, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const SERVICE_PACKAGES = [
  {
    id: "genai",
    category: "AI & GenAI Solutions",
    icon: Bot,
    glow: "indigo" as const,
    badge: "Most Requested",
    description: "Production-grade GenAI architectures, multi-agent frameworks, and vector search systems.",
    offerings: [
      {
        title: "Autonomous Multi-Agent Systems",
        summary: "Collaborative multi-agent workflows using LangChain, CrewAI, AutoGen, and FastMCP tool-calling servers.",
        delivery: "2-4 Weeks",
        tech: ["CrewAI", "LangGraph", "FastAPI"],
      },
      {
        title: "Enterprise RAG Pipelines",
        summary: "Semantic document search, hybrid retrieval, and secure vector database integrations with Pinecone/Chroma.",
        delivery: "1-3 Weeks",
        tech: ["Pinecone", "LlamaIndex", "FastAPI"],
      },
      {
        title: "Custom LLM Fine-Tuning",
        summary: "Domain-adapted language models fine-tuned on custom datasets for enterprise brand voice.",
        delivery: "3-5 Weeks",
        tech: ["Transformers", "Hugging Face", "PyTorch"],
      },
    ],
  },
  {
    id: "fullstack",
    category: "Full Stack & Microservices",
    icon: Code,
    glow: "emerald" as const,
    badge: "Enterprise Scale",
    description: "High-performance Next.js SaaS platforms, serverless APIs, and legacy-to-cloud migrations.",
    offerings: [
      {
        title: "Enterprise SaaS Web Apps",
        summary: "End-to-end full-stack web platforms with Next.js App Router, React 19, TypeScript, and modern UI.",
        delivery: "3-6 Weeks",
        tech: ["Next.js", "React", "Node.js"],
      },
      {
        title: "High-Concurrency REST & GraphQL APIs",
        summary: "Scalable API design with JWT/OAuth2 RBAC, AWS Lambda, DynamoDB, and PostgreSQL.",
        delivery: "1-3 Weeks",
        tech: ["Express", "FastAPI", "AWS Lambda"],
      },
      {
        title: "Legacy Monolith Modernization",
        summary: "Migrate legacy codebases to modular microservices with modern CI/CD testing pipelines.",
        delivery: "Custom Scope",
        tech: ["TypeScript", "Docker", "Playwright"],
      },
    ],
  },
];

export function ServicesPortal() {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  return (
    <div className="space-y-12 w-full">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <StitchBadge variant="primary" className="py-1 px-4">
          <Sparkles className="w-4 h-4 mr-1.5" /> Client Engineering &amp; Services Portal
        </StitchBadge>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Enterprise <span className="text-gradient">Freelance Offerings</span>
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
          Select a specialized service package below to request custom architectural scoping, timeline estimates, and project booking.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {SERVICE_PACKAGES.map((pkg) => {
          const Icon = pkg.icon;
          return (
            <StitchCard key={pkg.id} glowColor={pkg.glow} className="flex flex-col">
              <StitchCardHeader>
                <div className="flex items-center justify-between gap-4 mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <Icon className="w-6 h-6" />
                  </div>
                  <StitchBadge variant={pkg.glow === "indigo" ? "primary" : "emerald"}>{pkg.badge}</StitchBadge>
                </div>
                <StitchCardTitle>{pkg.category}</StitchCardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">{pkg.description}</p>
              </StitchCardHeader>

              <StitchCardContent className="space-y-6">
                {pkg.offerings.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-muted/20 border border-border/30 space-y-2.5 hover:border-primary/30 transition-all">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                        {item.title}
                      </h4>
                      <StitchBadge variant="outline" className="text-[10px] shrink-0">{item.delivery}</StitchBadge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.summary}</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {item.tech.map((t) => (
                        <StitchBadge key={t} variant="outline" className="text-[10px]">{t}</StitchBadge>
                      ))}
                    </div>
                  </div>
                ))}
              </StitchCardContent>

              <StitchCardFooter>
                <Button
                  className="w-full gap-2 font-semibold"
                  onClick={() => {
                    setSelectedPackage(pkg.category);
                    document.getElementById("consultation-section")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Request Scope &amp; Consultation <ArrowRight className="w-4 h-4" />
                </Button>
              </StitchCardFooter>
            </StitchCard>
          );
        })}
      </div>
    </div>
  );
}
