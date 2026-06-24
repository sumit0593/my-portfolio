"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";
import { ExternalLink, Github, X, ChevronRight, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// High-performance background meteor animation from Aceternity UI
export const Meteors = ({ number = 20, className }: { number?: number; className?: string }) => {
  const [meteorStyles, setMeteorStyles] = useState<Array<React.CSSProperties>>([]);

  useEffect(() => {
    const styles = Array.from({ length: number }).map(() => ({
      top: -10,
      left: Math.floor(Math.random() * 800) - 400 + "px",
      animationDelay: Math.random() * (0.8 - 0.2) + 0.2 + "s",
      animationDuration: Math.floor(Math.random() * (10 - 2) + 2) + "s",
    }));
    setMeteorStyles(styles);
  }, [number]);

  return (
    <>
      {meteorStyles.map((style, idx) => (
        <span
          key={"meteor" + idx}
          className={cn(
            "animate-meteor absolute h-0.5 w-0.5 rounded-[9999px] bg-slate-500 shadow-[0_0_0_1px_#ffffff10] rotate-[215deg]",
            "before:content-[''] before:absolute before:top-1/2 before:-translate-y-[50%] before:w-[50px] before:h-[1px] before:bg-gradient-to-r before:from-indigo-500/40 before:to-transparent",
            className
          )}
          style={style}
        />
      ))}
    </>
  );
};

const PROJECTS = [
  {
    id: 1,
    title: "AI Loan Advisor Chatbot",
    subtitle: "Multi-Agent Lending Evaluation Platform",
    tech: ["LangGraph", "Gemini API", "FastAPI", "React 19", "Tailwind CSS 4", "Recharts 3", "SQLite"],
    color: "from-teal-500 to-emerald-400",
    description:
      "A full-stack intelligent lending evaluation application. It uses a multi-agent orchestration graph (built with LangGraph and the Gemini API) to assess borrower profiles, determine loan product eligibility, perform EMI/tenure repayment simulations, and verify lending compliance.",
    highlights: [
      "Multi-Agent Orchestration Graph built with LangGraph & Gemini API",
      "Interactive tenure amortization & repayment simulations via Recharts 3",
      "Robust FastAPI backend storing users, sessions, audits, and prompts in SQLite",
    ],
    link: "https://ai-loan-advisor-chatbot-six.vercel.app/",
    github: "https://github.com/sumit0593/AI-Loan-Advisor-Chatbot",
    envVars: {
      backend: [
        { name: "GEMINI_API_KEY", description: "Your Google Gemini API Key", value: "[Required]" },
        { name: "DATABASE_URL", description: "Connection string to SQLite", value: "sqlite:///./loan_advisor.db (local) or sqlite:////data/loan_advisor.db (Railway volume)" },
        { name: "JWT_SECRET", description: "Secret key used to sign Auth tokens", value: "[Any long secure random string]" },
        { name: "PORT", description: "Dynamic port listener for ASGI server", value: "8000" },
        { name: "HOST", description: "Bind address for backend server", value: "0.0.0.0" }
      ],
      frontend: [
        { name: "VITE_BACKEND_URL", description: "Base URL of the deployed FastAPI backend API", value: "https://<service-name>.<environment>.up.railway.app" }
      ]
    },
    setupSteps: [
      {
        title: "1. Run the Backend",
        commands: [
          "cd backend",
          "python -m venv .venv",
          "# On Windows: .venv\\Scripts\\activate   # On macOS/Linux: source .venv/bin/activate",
          "pip install -r requirements.txt",
          "uvicorn main:app --reload --port 8000"
        ]
      },
      {
        title: "2. Run the Frontend",
        commands: [
          "cd ../frontend",
          "npm install",
          "npm run dev"
        ]
      }
    ],
    deployment: "This repository includes configuration files to deploy the full stack completely free with persistent data: Backend on Railway (with SQLite volume) and Frontend on Vercel."
  },
  {
    id: 2,
    title: "Scam Guard AI",
    subtitle: "AI Security / Scam Detection Platform",
    tech: ["Streamlit", "Gemini", "Prompt Engineering", "NLP Pipelines", "LLM Orchestration"],
    color: "from-red-500 to-orange-400",
    description:
      "A modular, real-time AI security platform designed to detect and prevent digital scams. Built with Gemini and advanced NLP Transformers, utilizing a configurable prompt engineering architecture and robust Python-based decision engine.",
    highlights: [
      "Config-driven Prompt Engineering",
      "Modular LLM Orchestration Pipeline",
      "Real-time AI Decision Engine",
    ],
    link: "https://scam-detector-ai.streamlit.app/",
    github: "https://github.com/sumit0593/scam_guard_ai",
  },
  {
    id: 3,
    title: "HireFlow AI",
    subtitle: "Generative AI / RAG Platform",
    tech: ["FastAPI", "BM25", "RAGAS", "HuggingFace", "RRF", "Streamlit", "Pinecone", "Gemini", "LangChain"],
    color: "from-blue-500 to-cyan-400",
    description:
      "A production-grade AI Resume Search platform utilizing Hybrid Search (BM25 + Pinecone Vector Search) and Reciprocal Rank Fusion (RRF). Features a scalable Python FastAPI backend microservice, LangChain orchestration, and Gemini LLMs for AI-powered candidate evaluation.",
    highlights: [
      "Hybrid Search (BM25 + Pinecone) with RRF",
      "FastAPI microservice backend",
      "RAGAS-based evaluation metrics",
    ],
    link: "https://hireflow---ai-resume-search-gw6ot8m2ph3huktrjcaz35.streamlit.app/",
    github: "https://github.com/sumit0593/HireFlow---AI-Resume-Search",
  },
  {
    id: 4,
    title: "Portfolio AI",
    subtitle: "RAG-Powered Personal Portfolio",
    tech: ["Next.js", "Gemini", "Pinecone", "Three.js", "Tailwind"],
    color: "from-fuchsia-500 to-pink-500",
    description:
      "A modern, AI-powered portfolio website featuring a RAG-based chatbot powered by Gemini and Pinecone. Includes an AI resume insights generator, dark mode support, and premium Framer Motion animations.",
    highlights: [
      "RAG chatbot with streaming responses",
      "Vector search with Pinecone embeddings",
      "Premium 3D & glassmorphism UI",
    ],
    link: "https://my-portfolio-six-gold-86.vercel.app/",
    github: "https://github.com/sumit0593/my-portfolio",
  },
];

function ProjectCard({
  project,
  onSelect,
}: {
  project: (typeof PROJECTS)[number];
  onSelect: () => void;
}) {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for tilt matching Aceternity 3D Card
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [12, -12]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-12, 12]), { stiffness: 300, damping: 30 });

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const { left, top, width, height } = event.currentTarget.getBoundingClientRect();
    const clientX = event.clientX - left;
    const clientY = event.clientY - top;

    setMouseX(clientX);
    setMouseY(clientY);

    x.set((clientX - width / 2) / width);
    y.set((clientY - height / 2) / height);
  }

  function handleMouseEnter() {
    setIsHovered(true);
  }

  function handleMouseLeave() {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  }

  // Get project shadow color based on its color gradient string
  const getShadowColor = () => {
    if (project.color.includes("teal")) return "rgba(20, 184, 166, 0.15)";
    if (project.color.includes("red")) return "rgba(239, 68, 68, 0.15)";
    if (project.color.includes("blue")) return "rgba(59, 130, 246, 0.15)";
    if (project.color.includes("fuchsia")) return "rgba(217, 70, 239, 0.15)";
    return "rgba(99, 102, 241, 0.15)";
  };

  return (
    <div
      className="w-full flex justify-center py-4"
      style={{ perspective: "1000px" }}
    >
      <motion.div
        layoutId={`card-${project.id}`}
        onClick={onSelect}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="group relative rounded-3xl border border-border/80 dark:border-border/50 bg-card/75 dark:bg-card/40 backdrop-blur-xl overflow-hidden cursor-pointer flex flex-col justify-between h-full transition-all duration-300 hover:border-indigo-500/40 hover:shadow-2xl shadow-md w-full [transform-style:preserve-3d]"
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          boxShadow: isHovered ? `0 20px 40px -15px ${getShadowColor()}` : "none"
        }}
      >
        {/* Meteors Background overlay on hover */}
        {isHovered && (
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
            <Meteors number={12} />
          </div>
        )}

        {/* Aceternity Spotlight Overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
          style={{
            background: `radial-gradient(350px circle at ${mouseX}px ${mouseY}px, rgba(99, 102, 241, 0.08), transparent 80%)`
          }}
        />

        <div className="flex flex-col h-full [transform-style:preserve-3d] z-10">
          {/* Gradient Banner with Grid Mesh */}
          <div
            className={`h-40 bg-gradient-to-br ${project.color} relative overflow-hidden shrink-0 transition-transform duration-300 ease-out [transform-style:preserve-3d]`}
            style={{
              transform: isHovered ? "translateZ(30px)" : "translateZ(0px)"
            }}
          >
            {/* Grid blueprint overlay */}
            <div
              className="absolute inset-0 opacity-15"
              style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
                `,
                backgroundSize: '16px 16px'
              }}
            />
            <div className="absolute inset-0 bg-black/35 group-hover:bg-black/15 transition-colors duration-300" />

            {/* Preview Badge */}
            <div className="absolute top-4 left-4 z-20">
              <span className="text-[10px] font-bold tracking-widest uppercase bg-black/55 backdrop-blur-md text-white/95 px-2.5 py-1 rounded-full border border-white/15">
                Preview {project.id}
              </span>
            </div>

            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
              <div className="bg-white/20 backdrop-blur-md px-5 py-2.5 rounded-full flex items-center gap-2">
                <span className="text-white text-xs font-bold tracking-wide uppercase">
                  Explore Project
                </span>
                <ChevronRight className="w-4 h-4 text-white" />
              </div>
            </div>
            {/* Glowing bottom-right bubble */}
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
          </div>

          {/* Content */}
          <div className="p-6 flex flex-col flex-1 justify-between [transform-style:preserve-3d]">
            <div className="space-y-3 [transform-style:preserve-3d]">
              <h3
                className="text-lg font-bold text-foreground group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 dark:group-hover:from-blue-400 dark:group-hover:to-purple-400 transition-all duration-300 [transform-style:preserve-3d]"
                style={{
                  transform: isHovered ? "translateZ(40px)" : "translateZ(0px)",
                  transition: "transform 0.3s ease-out"
                }}
              >
                {project.title}
              </h3>
              <p
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 tracking-wide uppercase"
                style={{
                  transform: isHovered ? "translateZ(35px)" : "translateZ(0px)",
                  transition: "transform 0.3s ease-out"
                }}
              >
                {project.subtitle}
              </p>
              <p
                className="text-xs text-muted-foreground leading-relaxed line-clamp-2"
                style={{
                  transform: isHovered ? "translateZ(20px)" : "translateZ(0px)",
                  transition: "transform 0.3s ease-out"
                }}
              >
                {project.description}
              </p>
            </div>

            <div className="mt-5 space-y-4 [transform-style:preserve-3d]">
              {/* Tech stack badges */}
              <div
                className="flex flex-wrap gap-1.5"
                style={{
                  transform: isHovered ? "translateZ(30px)" : "translateZ(0px)",
                  transition: "transform 0.3s ease-out"
                }}
              >
                {project.tech.slice(0, 4).map((t) => (
                  <span
                    key={t}
                    className="text-[9px] font-semibold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
                  >
                    {t}
                  </span>
                ))}
                {project.tech.length > 4 && (
                  <span className="text-[9px] font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
                    +{project.tech.length - 4}
                  </span>
                )}
              </div>

              {/* Read more link footer */}
              <div
                className="flex items-center justify-between pt-3 border-t border-border/50 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-300"
                style={{
                  transform: isHovered ? "translateZ(25px)" : "translateZ(0px)",
                  transition: "transform 0.3s ease-out"
                }}
              >
                <span>View details & config</span>
                <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ProjectModal({
  project,
  onClose,
}: {
  project: (typeof PROJECTS)[number];
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"overview" | "setup">("overview");

  const hasSetup = "envVars" in project || "setupSteps" in project || "deployment" in project;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          layoutId={`card-${project.id}`}
          className="relative w-full max-w-2xl bg-card/95 backdrop-blur-2xl border border-border rounded-3xl overflow-hidden shadow-2xl shadow-indigo-500/10 pointer-events-auto flex flex-col max-h-[90vh]"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Gradient Banner */}
          <div
            className={`h-40 bg-gradient-to-br ${project.color} relative shrink-0 flex items-end p-6`}
          >
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white drop-shadow-lg leading-tight">
                {project.title}
              </h2>
              <p className="text-white/80 text-sm mt-1">{project.subtitle}</p>
            </div>
          </div>

          {/* Tabs header if project has setup */}
          {hasSetup && (
            <div className="flex border-b border-border/50 bg-muted/10 shrink-0 px-6 pt-3">
              <button
                onClick={() => setActiveTab("overview")}
                className={`pb-3 px-4 text-sm font-semibold transition-all relative cursor-pointer ${activeTab === "overview"
                    ? "text-indigo-400 border-b-2 border-indigo-400"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("setup")}
                className={`pb-3 px-4 text-sm font-semibold transition-all relative cursor-pointer ${activeTab === "setup"
                    ? "text-indigo-400 border-b-2 border-indigo-400"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                Setup & Config
              </button>
            </div>
          )}

          {/* Body */}
          <div className="p-6 space-y-6 overflow-y-auto flex-1 max-h-[55vh]">
            {activeTab === "overview" ? (
              <>
                {/* Description */}
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {project.description}
                </p>

                {/* Highlights */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
                    Key Highlights
                  </h4>
                  <ul className="space-y-2">
                    {project.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                        <span className={`mt-1.5 w-2 h-2 rounded-full bg-gradient-to-r ${project.color} shrink-0`} />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tech Stack */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                    Tech Stack
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {project.tech.map((t) => (
                      <span
                        key={t}
                        className="text-xs px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Setup & Config Tab content */}
                {"envVars" in project && project.envVars && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                      Environment Variables Configuration
                    </h4>
                    {project.envVars.backend && (
                      <div className="space-y-2">
                        <h5 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Backend Variables (.env)
                        </h5>
                        <div className="border border-border/50 rounded-xl overflow-hidden text-xs bg-muted/10">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[450px]">
                              <thead>
                                <tr className="border-b border-border/50 bg-muted/30">
                                  <th className="p-2.5 font-semibold text-muted-foreground w-1/3">Variable Name</th>
                                  <th className="p-2.5 font-semibold text-muted-foreground w-1/3">Description</th>
                                  <th className="p-2.5 font-semibold text-muted-foreground w-1/3">Example Value</th>
                                </tr>
                              </thead>
                              <tbody>
                                {project.envVars.backend.map((env: any, idx: number) => (
                                  <tr key={idx} className="border-b border-border/30 last:border-0 hover:bg-muted/5">
                                    <td className="p-2.5 font-mono text-indigo-600 dark:text-indigo-400 select-all">{env.name}</td>
                                    <td className="p-2.5 text-muted-foreground">{env.description}</td>
                                    <td className="p-2.5 font-mono text-foreground/80">{env.value}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}
                    {project.envVars.frontend && (
                      <div className="space-y-2 mt-4">
                        <h5 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          Frontend Variables (.env)
                        </h5>
                        <div className="border border-border/50 rounded-xl overflow-hidden text-xs bg-muted/10">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[450px]">
                              <thead>
                                <tr className="border-b border-border/50 bg-muted/30">
                                  <th className="p-2.5 font-semibold text-muted-foreground w-1/3">Variable Name</th>
                                  <th className="p-2.5 font-semibold text-muted-foreground w-1/3">Description</th>
                                  <th className="p-2.5 font-semibold text-muted-foreground w-1/3">Example Value</th>
                                </tr>
                              </thead>
                              <tbody>
                                {project.envVars.frontend.map((env: any, idx: number) => (
                                  <tr key={idx} className="border-b border-border/30 last:border-0 hover:bg-muted/5">
                                    <td className="p-2.5 font-mono text-indigo-600 dark:text-indigo-400 select-all">{env.name}</td>
                                    <td className="p-2.5 text-muted-foreground">{env.description}</td>
                                    <td className="p-2.5 font-mono text-foreground/80">{env.value}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {"setupSteps" in project && project.setupSteps && (
                  <div className="space-y-4 pt-2">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                      Local Development Setup
                    </h4>
                    {project.setupSteps.map((step: any, idx: number) => (
                      <div key={idx} className="space-y-2">
                        <h5 className="text-xs font-semibold text-foreground">
                          {step.title}
                        </h5>
                        <div className="bg-black/90 font-mono text-[11px] text-emerald-400/90 p-4 rounded-2xl border border-border/50 leading-relaxed overflow-x-auto">
                          {step.commands.map((cmd: string, cmdIdx: number) => (
                            <div key={cmdIdx} className="whitespace-pre">{cmd}</div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {"deployment" in project && project.deployment && (
                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                      Cloud Deployment Instructions
                    </h4>
                    <p className="text-muted-foreground text-xs leading-relaxed bg-indigo-500/5 border border-indigo-500/10 p-4 rounded-2xl">
                      {project.deployment}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer (fixed at bottom of modal) */}
          <div className="p-6 bg-card/50 border-t border-border/50 shrink-0">
            <div className="flex gap-3">
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-indigo-500/20 cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                Live Demo
              </a>
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 py-3 rounded-xl text-sm font-semibold transition-colors border border-border cursor-pointer"
              >
                <Github className="w-4 h-4" />
                Source Code
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}

export function ProjectsSection() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selectedProject = PROJECTS.find((p) => p.id === selectedId) ?? null;

  return (
    <section className="relative w-full min-h-screen bg-background py-24 flex flex-col items-center overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="z-20 text-center mb-12 relative pointer-events-none">
        <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 backdrop-blur-md">
          <span className="text-sm font-medium text-indigo-300 tracking-wide">
            Portfolio Showcase
          </span>
        </div>
        <h2 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-4">
          Featured Work
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto text-lg font-light mb-6">
          Click on a project to explore details and tech stack.
        </p>
      </div>

      {/* Project Cards Grid (Previews 1, 2, 3, and 4) */}
      <div className="relative z-10 w-full max-w-6xl px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {PROJECTS.slice(0, 4).map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onSelect={() => setSelectedId(project.id)}
            />
          ))}
        </div>
      </div>

      {/* Bottom CTA to View All Projects */}
      <div className="relative z-10 mt-16 text-center">
        <Link
          href="/projects?from=home"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-indigo-600/15 hover:bg-indigo-600/25 text-indigo-300 hover:text-white border border-indigo-500/30 hover:border-indigo-400/50 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/25 font-semibold group cursor-pointer"
        >
          <span>View All Projects</span>
          <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform duration-300" />
        </Link>
      </div>

      {/* Expanded Modal */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectModal
            project={selectedProject}
            onClose={() => setSelectedId(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
