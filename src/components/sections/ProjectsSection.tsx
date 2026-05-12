"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Github, X, ChevronRight } from "lucide-react";

const PROJECTS = [
  {
    id: 1,
    title: "Scam Guard AI",
    subtitle: "AI Security / Scam Detection Platform",
    tech: ["Streamlit", "Gemini", "Python", "Transformers"],
    color: "from-red-500 to-orange-400",
    description:
      "A cutting-edge AI security platform designed to detect and prevent digital scams in real-time. Built with advanced NLP models to analyze text, emails, and URLs for malicious intent, providing a high-performance scalable API and modern dashboard.",
    highlights: [
      "Real-time text & URL anomaly detection",
      "High-performance NLP analysis",
      "Actionable security metrics & dashboard",
    ],
    link: "https://scam-detector-ai.streamlit.app/",
    github: "https://github.com/sumit0593/scam_guard_ai",
  },
  {
    id: 2,
    title: "HireFlow AI",
    subtitle: "Generative AI / RAG Platform",
    tech: ["Streamlit", "Pinecone", "Gemini", "LangChain", "Python"],
    color: "from-blue-500 to-cyan-400",
    description:
      "An intelligent AI Resume Search platform using RAG (Retrieval-Augmented Generation) architecture. It automates resume parsing, creates vector embeddings for semantic search, and provides recruiters with an ATS-style analytics interface to match candidates instantly.",
    highlights: [
      "Automated resume parsing pipeline",
      "Vector/semantic search with Pinecone",
      "ATS-style analytics & recruiter use-cases",
    ],
    link: "https://hireflow---ai-resume-search-gw6ot8m2ph3huktrjcaz35.streamlit.app/",
    github: "https://github.com/sumit0593/HireFlow---AI-Resume-Search",
  },
  {
    id: 3,
    title: "Kent RiseEngine",
    subtitle: "Enterprise AI & LLM Automation",
    tech: ["React", "Node.js", "AWS Textract", "Mistral LLM", "Zoho Analytics"],
    color: "from-indigo-500 to-purple-500",
    description:
      "An enterprise-grade AI invoice parser leveraging AWS Textract and Mistral LLM to automate data extraction. Features role-based dashboards, robust validation schemas, and real-time business insights integrated with Zoho Analytics.",
    highlights: [
      "AWS Textract & Mistral LLM pipeline",
      "Role-based Zoho Analytics dashboards",
      "Enterprise load balancing & scalability",
    ],
    link: "https://risengine.com/sign-in",
    github: "#",
  },
  {
    id: 4,
    title: "Kent Cam Attendance",
    subtitle: "Enterprise HRMS & Scalable Systems",
    tech: ["Angular", "Spring Boot", "REST APIs", "Data Pipelines"],
    color: "from-emerald-500 to-teal-400",
    description:
      "A highly scalable HR attendance automation system handling thousands of concurrent employees. Integrates automated data pipelines, real-time sync, and robust REST APIs for reliable enterprise-level attendance tracking.",
    highlights: [
      "Real-time employee data sync",
      "Support for thousands of concurrent users",
      "Automated attendance data pipelines",
    ],
    link: "https://www.kentcam.com/camattendance/thank-you",
    github: "#",
  },
  {
    id: 5,
    title: "TIOS Revamp",
    subtitle: "Legacy HRMS Modernization",
    tech: ["Next.js", "TypeScript", "Tailwind CSS"],
    color: "from-amber-500 to-orange-400",
    description:
      "Migrated a legacy HRMS to a modern modular architecture using Next.js. Improved performance, maintainability, and scalability by redesigning the UI/UX and restructuring the entire codebase for better developer experience.",
    highlights: [
      "Legacy to modern migration",
      "Modular architecture redesign",
      "Improved performance & DX",
    ],
    link: "#",
    github: "#",
  },
  {
    id: 6,
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
  return (
    <motion.div
      layoutId={`card-${project.id}`}
      onClick={onSelect}
      className="group relative rounded-2xl border border-border bg-card/60 backdrop-blur-xl overflow-hidden cursor-pointer"
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      {/* Gradient Banner */}
      <div
        className={`h-44 bg-gradient-to-br ${project.color} relative overflow-hidden`}
      >
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-300" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-white/20 backdrop-blur-md px-5 py-2.5 rounded-full flex items-center gap-2">
            <span className="text-white text-sm font-semibold tracking-wide">
              View Details
            </span>
            <ChevronRight className="w-4 h-4 text-white" />
          </div>
        </div>
        {/* Floating glow orb */}
        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-300">
          {project.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">{project.subtitle}</p>
        <div className="flex flex-wrap gap-2">
          {project.tech.slice(0, 3).map((t) => (
            <span
              key={t}
              className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20"
            >
              {t}
            </span>
          ))}
          {project.tech.length > 3 && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground border border-border">
              +{project.tech.length - 3}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ProjectModal({
  project,
  onClose,
}: {
  project: (typeof PROJECTS)[number];
  onClose: () => void;
}) {
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
          className="relative w-full max-w-2xl bg-card/95 backdrop-blur-2xl border border-border rounded-3xl overflow-hidden shadow-2xl shadow-indigo-500/10 pointer-events-auto"
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
            className={`h-48 bg-gradient-to-br ${project.color} relative`}
          >
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute bottom-6 left-6">
              <h2 className="text-3xl font-extrabold text-white drop-shadow-lg">
                {project.title}
              </h2>
              <p className="text-white/80 text-sm mt-1">{project.subtitle}</p>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
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

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-indigo-500/20"
              >
                <ExternalLink className="w-4 h-4" />
                Live Demo
              </a>
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 py-3 rounded-xl text-sm font-semibold transition-colors border border-border"
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
        <p className="text-muted-foreground max-w-lg mx-auto text-lg font-light">
          Click on a project to explore details and tech stack.
        </p>
      </div>

      {/* Project Cards Grid */}
      <div className="relative z-10 w-full max-w-6xl px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROJECTS.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onSelect={() => setSelectedId(project.id)}
            />
          ))}
        </div>
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
