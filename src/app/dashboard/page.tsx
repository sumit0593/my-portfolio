// app/dashboard/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "../components/navbar";
import SectionWrapper from "../components/section-wrapper";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Github, Linkedin, Mail, Phone, Award, Trophy, Bot, Briefcase, ArrowRight, Code, Sparkles, ExternalLink, Eye, X, ChevronRight, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ImagesBadge } from "@/components/ui/images-badge";
import Loading from "@/app/loading";

const LeetCodeIcon = ({ className }: { className?: string }) => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className={className}>
    <title>LeetCode</title>
    <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.19c-.452-.443-.695-1.024-.695-1.666 0-.642.243-1.223.696-1.667l3.871-4.144c.558-.596 1.48-.596 2.038 0l6.477 6.57a1.378 1.378 0 0 0 1.95-.003c.54-.54.54-1.414.003-1.955l-6.477-6.57a4.137 4.137 0 0 0-5.918-.01L4.3 12.082l-.012-.013c-.02-.02-.047-.042-.068-.066l3.872-4.144c.2-.213.488-.336.792-.336H19.54c.732 0 1.328-.596 1.328-1.328v-3.76c0-.733-.596-1.328-1.328-1.328h-6.057z" />
  </svg>
);

const PDFPreview = ({
  url,
  className,
  onZoom,
}: {
  url: string;
  className?: string;
  onZoom?: (dataUrl: string) => void;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    const loadPdfjs = async () => {
      try {
        if (!(window as any).pdfjsLib) {
          let script = document.getElementById("pdfjs-script") as HTMLScriptElement;
          if (!script) {
            script = document.createElement("script");
            script.id = "pdfjs-script";
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js";
            script.async = true;
            document.body.appendChild(script);
          }

          await new Promise((resolve, reject) => {
            const checkAndResolve = () => {
              if ((window as any).pdfjsLib) {
                resolve(true);
              } else {
                setTimeout(checkAndResolve, 50);
              }
            };
            script.addEventListener("load", checkAndResolve);
            script.addEventListener("error", reject);
            // Resolve immediately if it was already loaded by window
            if ((window as any).pdfjsLib) {
              resolve(true);
            }
          });
        }

        const pdfjsLib = (window as any).pdfjsLib;
        pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";

        const loadingTask = pdfjsLib.getDocument(url);
        const pdf = await loadingTask.promise;

        if (!active) return;

        const page = await pdf.getPage(1);
        if (!active) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        const viewport = page.getViewport({ scale: 2.0 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
        if (active) {
          setLoading(false);
        }
      } catch (err) {
        console.error("Error rendering PDF:", err);
        if (active) {
          setError(true);
          setLoading(false);
        }
      }
    };

    loadPdfjs();

    return () => {
      active = false;
    };
  }, [url]);

  return (
    <div
      className={`relative flex items-center justify-center bg-muted/5 overflow-hidden cursor-pointer select-none group/preview w-full h-full ${className}`}
      onClick={() => {
        if (!loading && !error && canvasRef.current && onZoom) {
          try {
            const dataUrl = canvasRef.current.toDataURL("image/png");
            onZoom(dataUrl);
          } catch (e) {
            console.error("Failed to generate zoom data URL:", e);
            window.open(url, "_blank");
          }
        }
      }}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground p-4 text-center">
          Failed to load certificate preview. Click to view PDF.
        </div>
      ) : (
        <>
          <canvas ref={canvasRef} className="w-full h-full object-contain" />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/preview:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px] z-10">
            <Button variant="secondary" className="gap-2 font-semibold shadow-lg pointer-events-none">
              <Eye className="w-4 h-4" /> Zoom Preview
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<"dsa" | "certs">("certs");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (status === "loading") return <Loading />;
  if (!session) redirect("/login");

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <>
      <Navbar />
      <div className="relative min-h-screen bg-background overflow-x-hidden">
        {/* Background Decorative Elements - clipped to prevent horizontal overflow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-primary/10 via-background to-background" />
          <div className="absolute top-[20%] right-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-[150px] -translate-x-1/3" />
        </div>

        <main className="pt-24 pb-16 relative z-10">
          <Container className="space-y-16 sm:space-y-20 md:space-y-24">

            {/* Hero Section */}
            <SectionWrapper id="home" className="min-h-[60vh] sm:min-h-[80vh] flex-col items-center justify-center text-center p-0">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary mb-8"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <span className="text-sm font-medium">Available for Enterprise Freelance Projects</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-6"
              >
                Sumit Kumar <br />
                <span className="text-gradient">GenAI & Full Stack Architect</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 sm:mb-12 leading-relaxed px-2"
              >
                Building scalable Multi-Agent Systems, RAG pipelines, and enterprise AI SaaS platforms. IIT Mandi GenAI Certified.
              </motion.p>

              {/* Quick Actions & Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col items-center w-full max-w-4xl mx-auto space-y-8 sm:space-y-12"
              >
                {/* Quick Actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 w-full gap-4 sm:gap-6">
                  <Button variant="ghost" className="flex flex-col items-center gap-2 h-auto py-4 bg-muted/30 hover:bg-muted border border-transparent hover:border-border transition-all group" onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}>
                    <Briefcase className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Hire Me</span>
                  </Button>
                  <Button variant="ghost" asChild className="flex flex-col items-center gap-2 h-auto py-4 bg-muted/30 hover:bg-muted border border-transparent hover:border-border transition-all group">
                    <Link href="/tools">
                      <Bot className="w-6 h-6 text-blue-500 group-hover:scale-110 transition-transform" />
                      <span className="font-medium">AI Tools</span>
                    </Link>
                  </Button>
                  <Button variant="ghost" asChild className="flex flex-col items-center gap-2 h-auto py-4 bg-muted/30 hover:bg-muted border border-transparent hover:border-border transition-all group">
                    <Link href="/services">
                      <Award className="w-6 h-6 text-purple-500 group-hover:scale-110 transition-transform" />
                      <span className="font-medium">Services</span>
                    </Link>
                  </Button>
                  <Button variant="ghost" className="flex flex-col items-center gap-2 h-auto py-4 bg-muted/30 hover:bg-muted border border-transparent hover:border-border transition-all group" onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })}>
                    <Code className="w-6 h-6 text-emerald-500 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Projects</span>
                  </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 sm:gap-8 pt-8 sm:pt-10 border-t w-full border-border/50">
                  <div className="text-center">
                    <p className="text-2xl sm:text-3xl font-bold text-foreground">4+</p>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider">Years Exp.</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl sm:text-3xl font-bold text-foreground">10+</p>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider">Enterprise Apps</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl sm:text-3xl font-bold text-foreground">95%</p>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider">ATS Score</p>
                  </div>
                </div>

              </motion.div>
            </SectionWrapper>

            {/* About Section */}
            <SectionWrapper id="about" className="min-h-0 py-8 sm:py-12 md:py-16 px-0">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8 justify-center">
                  <div className="h-px bg-border flex-1 max-w-[60px] md:max-w-[100px]" />
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">About Me</h2>
                  <div className="h-px bg-border flex-1 max-w-[60px] md:max-w-[100px]" />
                </div>

                <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl p-6 sm:p-8 md:p-12 shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none transition-transform duration-700 group-hover:scale-150" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none transition-transform duration-700 group-hover:scale-150" />

                  <div className="relative z-10 space-y-6 text-base md:text-lg text-muted-foreground leading-relaxed break-words">
                    <p className="text-foreground font-medium text-lg sm:text-xl leading-snug">
                      Forward-thinking <span className="text-primary font-bold">Generative AI & Full Stack Engineer</span> with strong expertise in designing and developing scalable AI-powered web applications, Multi-Agent Systems, and Retrieval-Augmented Generation (RAG) architectures. Passionate about building intelligent, production-grade solutions that combine modern frontend engineering with advanced AI orchestration.
                    </p>

                    <p>
                      Currently advancing expertise through the <span className="text-foreground font-semibold">IIT Mandi GenAI curriculum</span>, with a strong focus on Large Language Model (LLM) orchestration, prompt engineering, semantic retrieval systems, fine-tuning strategies, and autonomous agentic workflows using frameworks such as LangChain, CrewAI, AutoGen, and LlamaIndex.
                    </p>

                    <p>
                      Skilled in architecting end-to-end AI systems using React.js, Next.js, TypeScript, Node.js, FastAPI, MongoDB, Pinecone, and cloud-native technologies. Hands-on experience in implementing vector search, hybrid retrieval pipelines, AI chatbot systems, OCR-based document intelligence, and scalable backend APIs optimized for performance and maintainability.
                    </p>

                    <div className="pt-6 pb-2">
                      <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-foreground mb-4 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" /> Modern AI Engineering Concepts
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "RAG pipelines",
                          "Vector databases",
                          "Multi-Agent collaboration",
                          "LLM architecture",
                          "Workflow orchestration",
                          "Prompt optimization",
                          "Semantic search",
                          "AI automation"
                        ].map((concept) => (
                          <Badge key={concept} variant="secondary" className="px-3 py-1.5 text-xs sm:text-sm font-medium bg-secondary/50 hover:bg-secondary border border-border/50 transition-colors shadow-sm">
                            {concept}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <p>
                      Professionally experienced in building enterprise-grade applications with a focus on scalability, clean architecture, responsive UI/UX, API optimization, authentication systems, and deployment-ready solutions. Adept at bridging the gap between AI research concepts and practical full-stack implementation.
                    </p>

                    <div className="mt-6 sm:mt-8 p-4 sm:p-6 rounded-2xl bg-primary/5 border border-primary/10 italic text-foreground/90 font-medium relative text-sm sm:text-base">
                      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-purple-500 rounded-l-2xl" />
                      {"Driven by continuous learning and innovation, with a strong interest in building next-generation AI platforms, intelligent assistants, and scalable GenAI products that deliver measurable business impact."}
                    </div>
                  </div>
                </div>
              </div>
            </SectionWrapper>

            <SectionWrapper id="skills" className="min-h-0 py-8 sm:py-12 px-0 text-left">
              <div className="space-y-8">
                <div className="border-b pb-4 border-border/50">
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Core Expertise</h2>
                  <p className="text-muted-foreground mt-2">Technologies and frameworks I specialize in</p>
                </div>
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-100px" }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <motion.div variants={itemVariants}>
                    <Card className="h-full glass hover:border-primary/50 transition-colors group relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors" />
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Bot className="w-5 h-5 text-blue-500" /> Generative AI & LLMs
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground leading-relaxed break-words hyphens-auto">RAG Pipelines, Prompt Engineering (Zero-shot/Few-shot/CoT), LLM Fine-Tuning, Transformers.</p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <Card className="h-full glass hover:border-purple-500/50 transition-colors group relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-colors" />
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Award className="w-5 h-5 text-purple-500" /> Agentic Frameworks
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground leading-relaxed">Multi-Agent Systems (MAS), LangChain, LlamaIndex, CrewAI, AutoGen, ReAct Agents.</p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <Card className="h-full glass hover:border-emerald-500/50 transition-colors group relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors" />
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Code className="w-5 h-5 text-emerald-500" /> Full Stack Core
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground leading-relaxed">React.js, Next.js, MERN Stack, Python, FastAPI, TypeScript, Node.js, Tailwind CSS, MUI.</p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <Card className="h-full glass hover:border-orange-500/50 transition-colors group relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-colors" />
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Trophy className="w-5 h-5 text-orange-500" /> Databases & DevOps
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground leading-relaxed break-words hyphens-auto">Vector Databases (Pinecone, ChromaDB, FAISS), MySQL, PostgreSQL, MongoDB, Docker, AWS, Jenkins, CI/CD.</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              </div>
            </SectionWrapper>

            <SectionWrapper id="experience" className="min-h-0 py-8 sm:py-12 px-0 text-left">
              <div className="space-y-8">
                <div className="border-b pb-4 border-border/50">
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Professional Experience</h2>
                  <p className="text-muted-foreground mt-2">My journey building enterprise scalable systems (Aug 2023 - Present)</p>
                </div>

                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-100px" }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {/* Kent RO Systems */}
                  <motion.div variants={itemVariants} className="h-full">
                    <Card className="flex flex-col h-full glass hover:border-primary/50 transition-colors group relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors" />
                      <div className="h-1 bg-gradient-to-r from-primary to-indigo-400 w-full" />
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-primary shrink-0" />
                            Software Engineer
                          </CardTitle>
                          <Badge variant="secondary" className="shrink-0">Apr 2024 - Present</Badge>
                        </div>
                        <p className="text-primary font-medium text-sm mt-1">Kent RO Systems Pvt Ltd</p>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4 marker:text-primary break-words">
                          <li>Engineered an AI-driven OCR invoice parsing microservice using AWS (Textract, Lambda, DynamoDB) and Node.js, automating data extraction and reducing manual processing time.</li>
                          <li>Engineered serverless APIs using AWS Lambda and DynamoDB to handle high-concurrency workloads.</li>
                          <li>Implemented secure RBAC authentication via JWT and OAuth2, integrating seamlessly with dynamic Zoho Analytics dashboards.</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* TechnoIdentity */}
                  <motion.div variants={itemVariants} className="h-full">
                    <Card className="flex flex-col h-full glass hover:border-purple-500/50 transition-colors group relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-colors" />
                      <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-400 w-full" />
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-purple-500 shrink-0" />
                            Associate Software Developer
                          </CardTitle>
                          <Badge variant="outline" className="shrink-0">Aug 2023 - Mar 2024</Badge>
                        </div>
                        <p className="text-purple-500 font-medium text-sm mt-1">TechnoIdentity</p>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4 marker:text-purple-500 break-words">
                          <li>Spearheaded the legacy-to-modern migration of an enterprise HRMS platform using Next.js and TypeScript, significantly improving UI rendering speeds.</li>
                          <li>Developed scalable MERN-stack UI components for the US Toll Authority (Hectare), improving system maintainability and UX.</li>
                          <li>Established robust CI/CD testing pipelines using Cypress and Playwright, reducing QA cycles by automating workflows.</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              </div>
            </SectionWrapper>


            <SectionWrapper id="projects" className="min-h-0 py-8 sm:py-12 px-0 text-left">
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b pb-4 border-border/50 gap-4">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{"Enterprises's Work"}</h2>
                    <p className="text-muted-foreground mt-2">Enterprise systems and GenAI solutions</p>
                  </div>
                  <ImagesBadge
                    href="/projects"
                    text="View All Projects"
                    images={[
                      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=800&auto=format&fit=crop",
                      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop",
                      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop"
                    ]}
                    className="group"
                  />
                </div>

                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-100px" }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <motion.div variants={itemVariants} className="h-full">
                    <Card className="flex flex-col h-full hover:border-primary/50 hover:shadow-lg transition-all group overflow-hidden">
                      <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500 w-full group-hover:h-3 transition-all" />
                      <CardHeader className="pt-6">
                        <CardTitle className="flex justify-between items-start text-xl">
                          <span>Kent Risengine</span>
                          <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-0">Enterprise</Badge>
                        </CardTitle>
                        <CardDescription className="text-sm font-medium text-muted-foreground">AI Automation Platform</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                          Designed a robust Node.js/Express.js backend to support an AI invoice parser using AWS Textract. Integrated custom validation schemas and real-time Zoho Analytics synchronization.
                        </p>
                      </CardContent>
                      <CardFooter className="pt-0">
                        <div className="flex flex-wrap gap-2 w-full">
                          <Badge variant="outline" className="bg-background/50">React</Badge>
                          <Badge variant="outline" className="bg-background/50">Node.js</Badge>
                          <Badge variant="outline" className="bg-background/50">Zoho Analytics</Badge>
                          <Badge variant="outline" className="bg-background/50">AWS Lambda</Badge>
                          <Badge variant="outline" className="bg-background/50">DynamoDB</Badge>
                        </div>
                      </CardFooter>
                    </Card>
                  </motion.div>

                  <motion.div variants={itemVariants} className="h-full">
                    <Card className="flex flex-col h-full hover:border-emerald-500/50 hover:shadow-lg transition-all group overflow-hidden">
                      <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500 w-full group-hover:h-3 transition-all" />
                      <CardHeader className="pt-6">
                        <CardTitle className="flex justify-between items-start text-xl">
                          <span>Cam Attendance</span>
                          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-0">Client</Badge>
                        </CardTitle>
                        <CardDescription className="text-sm font-medium text-muted-foreground">Enterprise HR Tracking</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                          Maintained a highly scalable full-stack attendance platform managing thousands of concurrent employees. Designed Spring Boot microservices, Angular modules, and robust REST APIs.
                        </p>
                      </CardContent>
                      <CardFooter className="pt-0">
                        <div className="flex flex-wrap gap-2 w-full">
                          <Badge variant="outline" className="bg-background/50">Spring Boot</Badge>
                          <Badge variant="outline" className="bg-background/50">Angular</Badge>
                          <Badge variant="outline" className="bg-background/50">REST APIs</Badge>
                        </div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                </motion.div>
              </div>
            </SectionWrapper>

            <SectionWrapper id="gallery" className="min-h-0 py-8 sm:py-12 px-0 text-left">
              <div className="space-y-10">
                <div className="border-b pb-4 border-border/50">
                  <h2 className="text-xl sm:text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-muted-foreground whitespace-nowrap">
                    <span className="hidden sm:inline">Learning &amp; Competitive Programming</span>
                    <span className="inline sm:hidden">Certifications &amp; Learning</span>
                  </h2>
                  <p className="text-muted-foreground mt-2 text-xs sm:text-sm md:text-base whitespace-nowrap">
                    Continuous Learning, Certifications &amp; Problem Solving Journey
                  </p>
                </div>

                {/* Tab Navigation */}
                <div className="grid grid-cols-2 p-1.5 bg-muted/20 backdrop-blur-md rounded-2xl border border-border/40 max-w-md mx-auto gap-1.5 shadow-inner relative overflow-hidden select-none">
                  <button
                    onClick={() => setActiveTab("dsa")}
                    className={`py-3 text-xs sm:text-sm font-semibold relative rounded-xl transition-all duration-300 select-none focus:outline-none ${activeTab === "dsa" ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {activeTab === "dsa" && (
                      <motion.div
                        layoutId="activeTabSlider"
                        className="absolute inset-0 bg-background border border-primary/25 rounded-xl shadow-[0_0_12px_rgba(249,115,22,0.15)] -z-10"
                        transition={{ type: "spring", stiffness: 350, damping: 28 }}
                      />
                    )}
                    <span className="hidden sm:inline">DSA &amp; Competitive Programming</span>
                    <span className="inline sm:hidden">DSA &amp; CP</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("certs")}
                    className={`py-3 text-xs sm:text-sm font-semibold relative rounded-xl transition-all duration-300 select-none focus:outline-none ${activeTab === "certs" ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {activeTab === "certs" && (
                      <motion.div
                        layoutId="activeTabSlider"
                        className="absolute inset-0 bg-background border border-primary/25 rounded-xl shadow-[0_0_12px_rgba(249,115,22,0.15)] -z-10"
                        transition={{ type: "spring", stiffness: 350, damping: 28 }}
                      />
                    )}
                    <span className="hidden sm:inline">Certifications &amp; Learning</span>
                    <span className="inline sm:hidden">Certifications</span>
                  </button>
                </div>

                {/* Both tabs rendered in the same grid cell â€” container height = max(dsa, certs) at every width */}
                <div className="grid mt-8" style={{ gridTemplateRows: "1fr", gridTemplateColumns: "1fr" }}>
                  {/* DSA Tab */}
                  <div
                    className={`col-start-1 row-start-1 grid grid-cols-1 md:grid-cols-2 gap-8 transition-opacity duration-300 ${activeTab === "dsa" ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                    aria-hidden={activeTab !== "dsa"}
                  >
                    {/* Featured LeetCode Profile Card */}
                    <Card className="col-span-1 md:col-span-2 glass relative overflow-hidden group hover:border-orange-500/40 transition-all duration-300 shadow-2xl border-orange-500/10">
                      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/[0.04] rounded-full blur-3xl pointer-events-none group-hover:bg-orange-500/[0.08] transition-all duration-500" />
                      <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-primary/[0.03] rounded-full blur-3xl pointer-events-none group-hover:bg-primary/[0.06] transition-all duration-500" />
                      <CardContent className="p-6 sm:p-8 md:p-10 flex flex-col lg:flex-row items-stretch gap-8">
                        <div className="flex-1 flex flex-col md:flex-row items-center md:items-start gap-6">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/5 flex items-center justify-center text-orange-500 border border-orange-500/25 group-hover:scale-105 transition-all duration-300 shadow-xl shadow-orange-500/5 shrink-0">
                            <LeetCodeIcon className="w-10 h-10 sm:w-12 sm:h-12" />
                          </div>
                          <div className="space-y-4 text-center md:text-left w-full">
                            <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-2 flex-wrap">
                              <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight">LeetCode Profile</CardTitle>
                              <div className="flex gap-2 justify-center">
                                <Badge className="bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 border border-orange-500/20 font-semibold text-xs py-0.5 px-2">Active Coder</Badge>
                              </div>
                            </div>
                            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl">
                              Solving algorithmic problems, mastering Data Structures &amp; Algorithms, and optimizing solutions to build a solid problem-solving journey geared for interview preparation.
                            </p>
                            <div className="space-y-2 max-w-md mx-auto md:mx-0">
                              <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                                <span>Problem Solving Balance</span>
                                <span>Easy / Med / Hard</span>
                              </div>
                              <div className="h-2 w-full rounded-full bg-muted overflow-hidden flex border border-border/30">
                                <div className="h-full bg-green-500 w-[45%]" title="Easy: 45%" />
                                <div className="h-full bg-orange-500 w-[45%]" title="Medium: 45%" />
                                <div className="h-full bg-red-500 w-[10%]" title="Hard: 10%" />
                              </div>
                              <div className="flex justify-start gap-4 text-[10px] text-muted-foreground font-medium">
                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block shadow-sm" /> Easy</span>
                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block shadow-sm" /> Medium</span>
                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block shadow-sm" /> Hard</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col justify-center items-center lg:border-l border-border/40 lg:pl-8 pt-4 lg:pt-0 shrink-0">
                          <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white font-semibold flex items-center gap-2 group-hover:scale-105 transition-transform duration-300 shadow-lg shadow-orange-500/10">
                            <a href="https://leetcode.com/u/sumitsumitsumit163/" target="_blank" rel="noopener noreferrer">
                              View LeetCode Profile
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Competition Scorecards */}
                    <div className="col-span-1 md:col-span-2 space-y-6 mt-4">
                      <div className="flex items-center gap-2 border-b border-border/50 pb-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        <h3 className="text-xl font-bold">Competition Scorecards</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card className="glass overflow-hidden group hover:border-primary/40 transition-all duration-300 flex flex-col shadow-lg relative">
                          <div className="absolute top-2 left-2 z-20 flex gap-2">
                            <Badge className="bg-black/60 backdrop-blur-md text-foreground border border-border/40 text-xs py-0.5 px-2">Newton School</Badge>
                            <Badge className="bg-primary/20 backdrop-blur-md text-primary border border-primary/20 text-xs py-0.5 px-2">DSA Competition</Badge>
                          </div>
                          <div className="relative aspect-[1.41] w-full overflow-hidden bg-muted/20 border-b border-border/40 flex items-center justify-center min-h-[220px]">
                            <img src="/gallery/scorecard/scorecard_newton_1.jpg" alt="Newton School DSA Competition Scorecard 1" className="absolute inset-0 w-full h-full object-contain bg-muted/30 group-hover:scale-[1.03] transition-transform duration-500" />
                            <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[3px] z-10">
                              <Button onClick={() => setSelectedImage("/gallery/scorecard/scorecard_newton_1.jpg")} variant="secondary" className="gap-2 font-semibold shadow-lg hover:scale-105 transition-transform">
                                <Eye className="w-4 h-4" /> View Full Image
                              </Button>
                            </div>
                          </div>
                          <CardHeader className="p-5 flex-1 relative z-20 bg-card/10">
                            <CardTitle className="text-base sm:text-lg font-bold tracking-tight">Newton School DSA Competition Scorecard #1</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">Platform: Newton School</p>
                          </CardHeader>
                        </Card>
                        <Card className="glass overflow-hidden group hover:border-primary/40 transition-all duration-300 flex flex-col shadow-lg relative">
                          <div className="absolute top-2 left-2 z-20 flex gap-2">
                            <Badge className="bg-black/60 backdrop-blur-md text-foreground border border-border/40 text-xs py-0.5 px-2">Newton School</Badge>
                            <Badge className="bg-primary/20 backdrop-blur-md text-primary border border-primary/20 text-xs py-0.5 px-2">DSA Competition</Badge>
                          </div>
                          <div className="relative aspect-[1.41] w-full overflow-hidden bg-muted/20 border-b border-border/40 flex items-center justify-center min-h-[220px]">
                            <img src="/gallery/scorecard/scorecard_newton_2.jpg" alt="Newton School DSA Competition Scorecard 2" className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
                            <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[3px] z-10">
                              <Button onClick={() => setSelectedImage("/gallery/scorecard/scorecard_newton_2.jpg")} variant="secondary" className="gap-2 font-semibold shadow-lg hover:scale-105 transition-transform">
                                <Eye className="w-4 h-4" /> View Full Image
                              </Button>
                            </div>
                          </div>
                          <CardHeader className="p-5 flex-1 relative z-20 bg-card/10">
                            <CardTitle className="text-base sm:text-lg font-bold tracking-tight">Newton School DSA Competition Scorecard #2</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">Platform: Newton School</p>
                          </CardHeader>
                        </Card>
                      </div>
                    </div>
                  </div>

                  {/* Certs Tab */}
                  <div
                    className={`col-start-1 row-start-1 grid grid-cols-1 md:grid-cols-2 gap-8 transition-opacity duration-300 ${activeTab === "certs" ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                    aria-hidden={activeTab !== "certs"}
                  >
                    <Card className="glass overflow-hidden group hover:border-indigo-500/30 transition-all duration-300 flex flex-col shadow-lg relative border-indigo-500/10">
                      <div className="absolute top-2 left-2 z-20 flex gap-2">
                        <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold text-xs py-0.5 px-2.5 backdrop-blur-md">IIT Mandi - TIH</Badge>
                      </div>
                      <div className="relative aspect-[1.41] w-full bg-muted/10 border-b border-border/40 flex items-center justify-center overflow-hidden min-h-[220px]">
                        <PDFPreview url="/gallery/certification/certificate_of_Excellence_RAG_Engg.pdf" className="absolute inset-0 w-full h-full" onZoom={setSelectedImage} />
                      </div>
                      <div className="p-5 sm:p-6 flex flex-col flex-1 relative z-20">
                        <div className="flex-1 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <CardTitle className="text-lg sm:text-xl font-bold tracking-tight line-clamp-2">PG Certification in GenAI & Multi-Agent Systems</CardTitle>
                            <Badge variant="outline" className="text-[10px] sm:text-xs text-muted-foreground border-border/40 shrink-0 w-fit flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> 2024
                            </Badge>
                          </div>
                          <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                            <li className="flex gap-2"><ChevronRight className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" /><span><strong className="text-foreground/80">Core Curriculum:</strong> Mastered advanced Prompt Engineering, NLP fundamentals, and RAG pipelines using Vector Databases.</span></li>
                            <li className="flex gap-2"><ChevronRight className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" /><span><strong className="text-foreground/80">Agentic AI & Fine-Tuning:</strong> Architected autonomous Multi-Agent Systems using LangChain, CrewAI, AutoGen & LlamaIndex. Fine-tuned LLMs.</span></li>
                            <li className="flex gap-2"><ChevronRight className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" /><span><strong className="text-foreground/80">Deployment:</strong> Applied Deep Learning & Transformer architectures to build and deploy scalable GenAI models via FastAPI.</span></li>
                            <li className="flex gap-2"><ChevronRight className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" /><span>Deployed FastMCP servers for secure, standardized tool-calling for autonomous AI agents.</span></li>
                            <li className="flex gap-2"><ChevronRight className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" /><span>Utilized Pandas for complex data preprocessing within Agentic RAG workflows.</span></li>
                          </ul>
                          <div className="flex flex-wrap gap-1.5 pt-2">
                            {["Generative AI", "Multi-Agent Systems", "LangChain", "CrewAI", "FastAPI", "RAG", "LLM Fine-Tuning"].map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-[10px] sm:text-xs bg-muted/50 border border-border/30">{tag}</Badge>
                            ))}
                          </div>
                        </div>
                        <div className="mt-5 pt-4 border-t border-border/30 flex flex-col sm:flex-row md:flex-col lg:flex-col xl:flex-row gap-3 justify-between items-stretch">
                          <div className="flex items-center gap-2 bg-muted/20 hover:bg-muted/40 p-2 rounded-lg border border-border/30 flex-1 transition-all group/row">
                            <Award className="w-5 h-5 text-indigo-500 shrink-0 ml-2" />
                            <Button asChild variant="ghost" className="text-primary hover:text-primary-foreground hover:bg-primary gap-1.5 h-8 text-[11px] font-semibold flex-1 justify-center px-2">
                              <a href="/gallery/certification/certificate_prompt_engineering.pdf" target="_blank" rel="noopener noreferrer">Prompt Cert <ExternalLink className="w-3 h-3" /></a>
                            </Button>
                          </div>
                          <div className="flex items-center gap-2 bg-muted/20 hover:bg-muted/40 p-2 rounded-lg border border-border/30 flex-1 transition-all group/row">
                            <Award className="w-5 h-5 text-purple-500 shrink-0 ml-2" />
                            <Button asChild variant="ghost" className="text-primary hover:text-primary-foreground hover:bg-primary gap-1.5 h-8 text-[11px] font-semibold flex-1 justify-center px-2">
                              <a href="/gallery/certification/certificate_of_Excellence_RAG_Engg.pdf" target="_blank" rel="noopener noreferrer">RAG Cert <ExternalLink className="w-3 h-3" /></a>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>

                    <Card className="glass overflow-hidden group hover:border-teal-500/30 transition-all duration-300 flex flex-col shadow-lg relative border-teal-500/10">
                      <div className="absolute top-2 left-2 z-20 flex gap-2">
                        <Badge className="bg-teal-500/10 text-teal-400 border border-teal-500/20 font-semibold text-xs py-0.5 px-2.5 backdrop-blur-md">Newton School</Badge>
                      </div>
                      <div className="relative aspect-[1.41] w-full bg-muted/10 border-b border-border/40 flex items-center justify-center overflow-hidden min-h-[220px]">
                        <PDFPreview url="/gallery/certification/full_stack_web_certificate.pdf" className="absolute inset-0 w-full h-full" onZoom={setSelectedImage} />
                      </div>
                      <div className="p-5 sm:p-6 flex flex-col flex-1 relative z-20">
                        <div className="flex-1 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <CardTitle className="text-lg sm:text-xl font-bold tracking-tight line-clamp-2">Full Stack Web Development Certificate</CardTitle>
                            <Badge variant="outline" className="text-[10px] sm:text-xs text-muted-foreground border-border/40 shrink-0 w-fit flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> May 2022 — Mar 2023
                            </Badge>
                          </div>
                          <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                            <li className="flex gap-2"><ChevronRight className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" /><span>Trained in modern full-stack web technologies with a strong focus on building AI-powered web applications.</span></li>
                            <li className="flex gap-2"><ChevronRight className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" /><span>Hands-on experience with HTML, CSS, JavaScript, React, Next.js, Node.js, Express.js, MongoDB, and Git.</span></li>
                            <li className="flex gap-2"><ChevronRight className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" /><span>Actively participated in DSA coding contests, improving problem-solving and algorithmic thinking.</span></li>
                            <li className="flex gap-2"><ChevronRight className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" /><span>Collaborated on group projects and real-world development challenges, strengthening teamwork and practical skills.</span></li>
                          </ul>
                          <div className="flex flex-wrap gap-1.5 pt-2">
                            {["Next.js", "React", "Node.js", "MongoDB", "Express.js", "JavaScript", "HTML/CSS", "Git"].map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-[10px] sm:text-xs bg-muted/50 border border-border/30">{tag}</Badge>
                            ))}
                          </div>
                        </div>
                        <div className="mt-5 pt-4 border-t border-border/30 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2 bg-muted/20 hover:bg-muted/40 p-2 rounded-lg border border-border/30 flex-1 transition-all group/row">
                            <Award className="w-5 h-5 text-teal-500 shrink-0 ml-2" />
                            <Button asChild variant="ghost" className="text-primary hover:text-primary-foreground hover:bg-primary gap-1.5 h-8 text-xs font-semibold flex-1 justify-center">
                              <a href="/gallery/certification/full_stack_web_certificate.pdf" target="_blank" rel="noopener noreferrer">View Certificate <ExternalLink className="w-3 h-3" /></a>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            </SectionWrapper>

            <SectionWrapper id="contact" className="min-h-0 py-8 sm:py-12 px-0">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-muted/50 to-muted rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-16 mb-8 sm:mb-12 border border-border shadow-lg relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

                <div className="relative z-10 text-center max-w-3xl mx-auto">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-4">Ready to Innovate?</h2>
                  <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-6 sm:mb-10">
                    {"Whether you need a scalable Multi-Agent System, an enterprise RAG pipeline, or a full-stack SaaS application, I'm ready to help you build the future."}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                    <a href="mailto:sumitsumitsumit163@gmail.com" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-2 sm:gap-3 bg-background hover:bg-muted p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-border transition-all hover:-translate-y-1 hover:shadow-md group">
                      <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
                        <Mail className="w-6 h-6" />
                      </div>
                      <span className="text-sm sm:text-base font-semibold">Email</span>
                    </a>
                    <a href="tel:7011676185" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-2 sm:gap-3 bg-background hover:bg-muted p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-border transition-all hover:-translate-y-1 hover:shadow-md group">
                      <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 group-hover:bg-green-500 group-hover:text-white transition-colors">
                        <Phone className="w-6 h-6" />
                      </div>
                      <span className="text-sm sm:text-base font-semibold">Call</span>
                    </a>
                    <a href="https://www.linkedin.com/in/sumit-kumar0509/" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-2 sm:gap-3 bg-background hover:bg-muted p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-border transition-all hover:-translate-y-1 hover:shadow-md group">
                      <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                        <Linkedin className="w-6 h-6" />
                      </div>
                      <span className="text-sm sm:text-base font-semibold">LinkedIn</span>
                    </a>
                    <a href="https://github.com/sumit0593" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-2 sm:gap-3 bg-background hover:bg-muted p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-border transition-all hover:-translate-y-1 hover:shadow-md group">
                      <div className="w-12 h-12 rounded-full bg-foreground/10 flex items-center justify-center text-foreground group-hover:bg-foreground group-hover:text-background transition-colors">
                        <Github className="w-6 h-6" />
                      </div>
                      <span className="text-sm sm:text-base font-semibold">GitHub</span>
                    </a>
                  </div>
                </div>
              </motion.div>
            </SectionWrapper>
          </Container>
        </main>
      </div>

      {/* Zoom Preview Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl max-h-[85vh] w-full flex items-center justify-center rounded-2xl overflow-hidden bg-card/40 border border-border/50 shadow-2xl cursor-default"
            >
              <img
                src={selectedImage}
                alt="Enlarged preview"
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white rounded-full p-2.5 transition-colors border border-white/10"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
