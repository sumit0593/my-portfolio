"use client";

import { notFound, useParams } from "next/navigation";
import { Sparkles, Target, Linkedin, PenTool, TrendingUp, MessageSquare, Briefcase, Mail, Cpu, LucideIcon } from "lucide-react";
import ToolLayout from "@/components/ui/tool-layout";

// This file handles all AI tools EXCEPT resume-analyzer (which has its own folder)
const toolsData: Record<string, { title: string; description: string; icon: LucideIcon; iconColor: string; iconBg: string; placeholder: string; buttonText: string; buttonLoadingText: string }> = {
  "resume-builder": {
    title: "AI Resume Builder",
    description: "Optimize your resume points for a specific role or industry.",
    icon: Sparkles,
    iconColor: "text-purple-500",
    iconBg: "bg-purple-500/10",
    placeholder: "E.g., Senior Frontend Engineer at a Fintech startup...",
    buttonText: "Optimize Resume",
    buttonLoadingText: "Optimizing..."
  },
  "jd-matcher": {
    title: "JD Matcher",
    description: "Detailed compatibility matrix between your profile and a JD.",
    icon: Target,
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-500/10",
    placeholder: "Paste the Job Description here...",
    buttonText: "Generate Matrix",
    buttonLoadingText: "Analyzing..."
  },
  "linkedin-summary": {
    title: "LinkedIn Summary Gen",
    description: "Generate professional and story-driven LinkedIn About sections.",
    icon: Linkedin,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-600/10",
    placeholder: "Any specific tone you want? (Optional)",
    buttonText: "Generate Summaries",
    buttonLoadingText: "Generating..."
  },
  "cover-letter": {
    title: "Cover Letter Generator",
    description: "Write highly targeted cover letters based on your resume.",
    icon: PenTool,
    iconColor: "text-amber-500",
    iconBg: "bg-amber-500/10",
    placeholder: "Paste the Job Description or company details here...",
    buttonText: "Draft Cover Letter",
    buttonLoadingText: "Drafting..."
  },
  "skill-gap": {
    title: "Skill Gap Analyzer",
    description: "Identify missing skills for a target role and get learning resources.",
    icon: TrendingUp,
    iconColor: "text-red-500",
    iconBg: "bg-red-500/10",
    placeholder: "Paste the target Job Description here...",
    buttonText: "Analyze Gaps",
    buttonLoadingText: "Analyzing..."
  },
  "interview-prep": {
    title: "Interview Q&A Generator",
    description: "Get technical and behavioral questions tailored to a job post.",
    icon: MessageSquare,
    iconColor: "text-cyan-500",
    iconBg: "bg-cyan-500/10",
    placeholder: "Paste the Job Description here...",
    buttonText: "Generate Questions",
    buttonLoadingText: "Generating..."
  },
  "portfolio-content": {
    title: "Portfolio Content Gen",
    description: "Rewrite project descriptions to be punchy and impact-focused.",
    icon: Briefcase,
    iconColor: "text-indigo-500",
    iconBg: "bg-indigo-500/10",
    placeholder: "Any specific project you want to focus on? (Optional)",
    buttonText: "Enhance Portfolio",
    buttonLoadingText: "Enhancing..."
  },
  "cold-email": {
    title: "Cold Email Generator",
    description: "High-converting templates to reach out to hiring managers.",
    icon: Mail,
    iconColor: "text-orange-500",
    iconBg: "bg-orange-500/10",
    placeholder: "Paste the JD or Hiring Manager details here...",
    buttonText: "Draft Emails",
    buttonLoadingText: "Drafting..."
  },
  "prompt-generator": {
    title: "AI Prompt Generator",
    description: "Custom ChatGPT/Gemini prompts to accelerate your job search.",
    icon: Cpu,
    iconColor: "text-slate-500",
    iconBg: "bg-slate-500/10",
    placeholder: "Paste the Job Description you are targeting...",
    buttonText: "Generate Prompts",
    buttonLoadingText: "Generating..."
  }
};

export default function DynamicToolPage() {
  const params = useParams();
  const toolId = params.toolId as string;

  if (!toolId || !toolsData[toolId]) {
    notFound();
  }

  const data = toolsData[toolId];

  return (
    <ToolLayout
      title={data.title}
      description={data.description}
      icon={data.icon}
      iconColor={data.iconColor}
      iconBg={data.iconBg}
      placeholder={data.placeholder}
      toolId={toolId}
      buttonText={data.buttonText}
      buttonLoadingText={data.buttonLoadingText}
    />
  );
}
