"use client";

import Link from "next/link";
import { FileSearch, Sparkles, Target, Linkedin, PenTool, TrendingUp, MessageSquare, Briefcase, Mail, Cpu } from "lucide-react";
import Navbar from "@/app/components/navbar";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const tools = [
  {
    id: "resume-analyzer",
    title: "Resume Analyzer",
    description: "Get an ATS score and match analysis against any job description.",
    icon: FileSearch,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    badge: "Popular"
  },
  {
    id: "resume-builder",
    title: "AI Resume Builder",
    description: "Optimize your resume points for a specific role or industry.",
    icon: Sparkles,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    badge: "New"
  },
  {
    id: "jd-matcher",
    title: "JD Matcher",
    description: "Detailed compatibility matrix between your profile and a JD.",
    icon: Target,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10"
  },
  {
    id: "linkedin-summary",
    title: "LinkedIn Summary Gen",
    description: "Generate professional and story-driven LinkedIn About sections.",
    icon: Linkedin,
    color: "text-blue-600",
    bg: "bg-blue-600/10"
  },
  {
    id: "cover-letter",
    title: "Cover Letter Generator",
    description: "Write highly targeted cover letters based on your resume.",
    icon: PenTool,
    color: "text-amber-500",
    bg: "bg-amber-500/10"
  },
  {
    id: "skill-gap",
    title: "Skill Gap Analyzer",
    description: "Identify missing skills for a target role and get learning resources.",
    icon: TrendingUp,
    color: "text-red-500",
    bg: "bg-red-500/10"
  },
  {
    id: "interview-prep",
    title: "Interview Q&A Generator",
    description: "Get technical and behavioral questions tailored to a job post.",
    icon: MessageSquare,
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
    badge: "Hot"
  },
  {
    id: "portfolio-content",
    title: "Portfolio Content Gen",
    description: "Rewrite project descriptions to be punchy and impact-focused.",
    icon: Briefcase,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10"
  },
  {
    id: "cold-email",
    title: "Cold Email Generator",
    description: "High-converting templates to reach out to hiring managers.",
    icon: Mail,
    color: "text-orange-500",
    bg: "bg-orange-500/10"
  },
  {
    id: "prompt-generator",
    title: "AI Prompt Generator",
    description: "Custom ChatGPT/Gemini prompts to accelerate your job search.",
    icon: Cpu,
    color: "text-slate-500",
    bg: "bg-slate-500/10"
  }
];

export default function ToolsMarketplace() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background pt-24 pb-16">
        <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-primary/5 to-background pointer-events-none -z-10" />
        
        <Container>
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              AI Tools <span className="text-gradient">Marketplace</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              A suite of AI-powered tools designed to optimize your job search, refine your personal brand, and prepare you for your next big role.
            </p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {tools.map((tool) => (
              <motion.div key={tool.id} variants={itemVariants}>
                <Link href={`/tools/${tool.id}`} className="block h-full">
                  <Card className="h-full hover:border-primary/50 transition-all hover:shadow-md hover:-translate-y-1 group bg-card/50 glass">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-4">
                        <div className={`w-12 h-12 rounded-xl ${tool.bg} ${tool.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <tool.icon className="w-6 h-6" />
                        </div>
                        {tool.badge && (
                          <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                            {tool.badge}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl group-hover:text-primary transition-colors">{tool.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm text-foreground/70 leading-relaxed">
                        {tool.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </div>
    </>
  );
}
