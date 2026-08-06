"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Award, Eye, ExternalLink, ChevronRight, Calendar, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SectionWrapper from "@/app/components/section-wrapper";

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
            onZoom(url);
          }
        } else if (onZoom) {
          onZoom(url);
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

export function ShowcaseSection() {
  const [activeTab, setActiveTab] = useState<"certs" | "dsa">("certs");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <SectionWrapper id="showcase" className="w-full max-w-7xl mx-auto py-12 md:py-20 px-6 text-left">
      <div className="space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
            <Award className="w-4 h-4" /> Public Credentials &amp; DSA Showcase
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Certifications &amp; Competitive Programming
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg">
            Explore verified IIT Mandi &amp; Newton School credentials, LeetCode problem solving, and competition scorecards.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-2 p-1.5 bg-muted/30 backdrop-blur-md rounded-2xl border border-border/50 max-w-md mx-auto gap-1.5 shadow-inner select-none">
          <button
            onClick={() => setActiveTab("certs")}
            className={`py-3 text-xs sm:text-sm font-semibold relative rounded-xl transition-all duration-300 select-none focus:outline-none ${activeTab === "certs" ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"}`}
          >
            {activeTab === "certs" && (
              <motion.div
                layoutId="activeTabSliderShowcase"
                className="absolute inset-0 bg-background border border-primary/25 rounded-xl shadow-[0_0_12px_rgba(99,102,241,0.2)] -z-10"
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
              />
            )}
            <span>Certifications &amp; Learning</span>
          </button>

          <button
            onClick={() => setActiveTab("dsa")}
            className={`py-3 text-xs sm:text-sm font-semibold relative rounded-xl transition-all duration-300 select-none focus:outline-none ${activeTab === "dsa" ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"}`}
          >
            {activeTab === "dsa" && (
              <motion.div
                layoutId="activeTabSliderShowcase"
                className="absolute inset-0 bg-background border border-primary/25 rounded-xl shadow-[0_0_12px_rgba(249,115,22,0.2)] -z-10"
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
              />
            )}
            <span>DSA &amp; LeetCode</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="grid mt-8" style={{ gridTemplateRows: "1fr", gridTemplateColumns: "1fr" }}>
          {/* Certs Tab */}
          <div
            className={`col-start-1 row-start-1 grid grid-cols-1 md:grid-cols-2 gap-8 transition-opacity duration-300 ${activeTab === "certs" ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            aria-hidden={activeTab !== "certs"}
          >
            <Card className="stitch-glass stitch-card overflow-hidden group transition-all duration-300 flex flex-col shadow-lg relative border-primary/20">
              <div className="absolute top-2 left-2 z-20 flex gap-2">
                <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold text-xs py-0.5 px-2.5 backdrop-blur-md">IIT Mandi - TIH</Badge>
              </div>
              <div className="relative aspect-[1.8] w-full bg-muted/10 border-b border-border/40 flex items-center justify-center overflow-hidden h-40 sm:h-44">
                <PDFPreview url="/gallery/certification/certificate_of_Excellence_GenAI_Multi-Agent_Systems.pdf" className="absolute inset-0 w-full h-full" onZoom={setSelectedImage} />
              </div>
              <div className="p-4 sm:p-5 flex flex-col flex-1 relative z-20 space-y-3">
                <div className="flex-1 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
                    <CardTitle className="text-base sm:text-lg font-bold tracking-tight">PG Certification in GenAI &amp; Multi-Agent Systems</CardTitle>
                    <Badge variant="outline" className="text-[10px] text-muted-foreground border-border/40 shrink-0 w-fit flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> 2024
                    </Badge>
                  </div>
                  <ul className="space-y-1.5 text-xs text-muted-foreground leading-snug">
                    <li className="flex gap-1.5"><ChevronRight className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" /><span><strong className="text-foreground/80">Curriculum:</strong> Prompt Engineering, RAG Pipelines &amp; Vector DBs.</span></li>
                    <li className="flex gap-1.5"><ChevronRight className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" /><span><strong className="text-foreground/80">Agentic Systems:</strong> Multi-Agent Graphs (LangChain, CrewAI, AutoGen).</span></li>
                    <li className="flex gap-1.5"><ChevronRight className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" /><span><strong className="text-foreground/80">Deployment:</strong> Fine-tuned LLMs &amp; FastAPI FastMCP Microservices.</span></li>
                  </ul>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {["Generative AI", "Multi-Agent Systems", "LangChain", "FastAPI", "RAG", "LLMOps"].map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[9px] bg-muted/50 border border-border/30 px-2 py-0">{tag}</Badge>
                    ))}
                  </div>

                  {/* 4 Mini Sub-Certificate Containers */}
                  <div className="space-y-2 pt-3 border-t border-border/40">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400/90 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-indigo-400" /> IIT Mandi Specializations &amp; Excellence (4 Certs)
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {/* Mini Cert 1: RAG Engineering */}
                      <div
                        onClick={() => setSelectedImage("/gallery/certification/certificate_of_Excellence_RAG_Engg.pdf")}
                        className="group/mini relative rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-1.5 flex flex-col justify-between hover:bg-indigo-500/10 hover:border-indigo-500/40 transition-all cursor-pointer overflow-hidden"
                      >
                        <div className="relative aspect-[1.8] w-full rounded-md overflow-hidden bg-black/20 mb-1 border border-white/5 h-14">
                          <PDFPreview url="/gallery/certification/certificate_of_Excellence_RAG_Engg.pdf" className="w-full h-full object-cover" onZoom={setSelectedImage} />
                        </div>
                        <div>
                          <h4 className="text-[10px] font-bold text-foreground line-clamp-1 group-hover/mini:text-indigo-300 transition-colors">Excellence in RAG Engg</h4>
                          <p className="text-[8px] text-muted-foreground truncate">Vector Search &amp; Retrieval</p>
                        </div>
                      </div>

                      {/* Mini Cert 2: Prompt Engineering */}
                      <div
                        onClick={() => setSelectedImage("/gallery/certification/certificate_of_Excellence_Prompt_Engg.pdf")}
                        className="group/mini relative rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-1.5 flex flex-col justify-between hover:bg-indigo-500/10 hover:border-indigo-500/40 transition-all cursor-pointer overflow-hidden"
                      >
                        <div className="relative aspect-[1.8] w-full rounded-md overflow-hidden bg-black/20 mb-1 border border-white/5 h-14">
                          <PDFPreview url="/gallery/certification/certificate_of_Excellence_Prompt_Engg.pdf" className="w-full h-full object-cover" onZoom={setSelectedImage} />
                        </div>
                        <div>
                          <h4 className="text-[10px] font-bold text-foreground line-clamp-1 group-hover/mini:text-indigo-300 transition-colors">Prompt Engineering</h4>
                          <p className="text-[8px] text-muted-foreground truncate">Fine-Tuning &amp; System Prompts</p>
                        </div>
                      </div>

                      {/* Mini Cert 3: AI & Multi-Agent Systems */}
                      <div
                        onClick={() => setSelectedImage("/gallery/certification/certificate_of_Excellence_AI_Agents_and_Multi-Agent_Systems.pdf")}
                        className="group/mini relative rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-1.5 flex flex-col justify-between hover:bg-indigo-500/10 hover:border-indigo-500/40 transition-all cursor-pointer overflow-hidden"
                      >
                        <div className="relative aspect-[1.8] w-full rounded-md overflow-hidden bg-black/20 mb-1 border border-white/5 h-14">
                          <PDFPreview url="/gallery/certification/certificate_of_Excellence_AI_Agents_and_Multi-Agent_Systems.pdf" className="w-full h-full object-cover" onZoom={setSelectedImage} />
                        </div>
                        <div>
                          <h4 className="text-[10px] font-bold text-foreground line-clamp-1 group-hover/mini:text-indigo-300 transition-colors">AI &amp; Multi-Agent Systems</h4>
                          <p className="text-[8px] text-muted-foreground truncate">LangGraph &amp; CrewAI</p>
                        </div>
                      </div>

                      {/* Mini Cert 4: Deployment & Integration */}
                      <div
                        onClick={() => setSelectedImage("/gallery/certification/certificate_Deployment_and_Project_Integration.pdf")}
                        className="group/mini relative rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-1.5 flex flex-col justify-between hover:bg-indigo-500/10 hover:border-indigo-500/40 transition-all cursor-pointer overflow-hidden"
                      >
                        <div className="relative aspect-[1.8] w-full rounded-md overflow-hidden bg-black/20 mb-1 border border-white/5 h-14">
                          <PDFPreview url="/gallery/certification/certificate_Deployment_and_Project_Integration.pdf" className="w-full h-full object-cover" onZoom={setSelectedImage} />
                        </div>
                        <div>
                          <h4 className="text-[10px] font-bold text-foreground line-clamp-1 group-hover/mini:text-indigo-300 transition-colors">Deployment &amp; Integration</h4>
                          <p className="text-[8px] text-muted-foreground truncate">FastAPI &amp; LLMOps</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border/30">
                  <Button asChild variant="default" size="sm" className="w-full gap-2 text-xs font-semibold h-8">
                    <a href="/gallery/certification/certificate_of_Excellence_GenAI_Multi-Agent_Systems.pdf" target="_blank" rel="noopener noreferrer">
                      <Award className="w-3.5 h-3.5" /> Full PG Certificate (PDF) <ExternalLink className="w-3 h-3 ml-auto" />
                    </a>
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="stitch-glass stitch-card overflow-hidden group transition-all duration-300 flex flex-col shadow-lg relative border-teal-500/20">
              <div className="absolute top-2 left-2 z-20 flex gap-2">
                <Badge className="bg-teal-500/10 text-teal-400 border border-teal-500/20 font-semibold text-xs py-0.5 px-2.5 backdrop-blur-md">Newton School</Badge>
              </div>
              <div className="relative aspect-[1.8] w-full bg-muted/10 border-b border-border/40 flex items-center justify-center overflow-hidden h-40 sm:h-44">
                <PDFPreview url="/gallery/certification/full_stack_web_certificate.pdf" className="absolute inset-0 w-full h-full" onZoom={setSelectedImage} />
              </div>
              <div className="p-4 sm:p-5 flex flex-col flex-1 relative z-20 space-y-3">
                <div className="flex-1 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
                    <CardTitle className="text-base sm:text-lg font-bold tracking-tight">Full Stack Web Development Certificate</CardTitle>
                    <Badge variant="outline" className="text-[10px] text-muted-foreground border-border/40 shrink-0 w-fit flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> May 2022 — Mar 2023
                    </Badge>
                  </div>
                  <ul className="space-y-1.5 text-xs text-muted-foreground leading-snug">
                    <li className="flex gap-1.5"><ChevronRight className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" /><span>Trained in modern full-stack web technologies &amp; building AI-powered web apps.</span></li>
                    <li className="flex gap-1.5"><ChevronRight className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" /><span>Hands-on React, Next.js, Node.js, Express, MongoDB, JavaScript &amp; Git.</span></li>
                  </ul>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {["Next.js", "React", "Node.js", "MongoDB", "Express.js", "JavaScript", "Git"].map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[9px] bg-muted/50 border border-border/30 px-2 py-0">{tag}</Badge>
                    ))}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border/30">
                  <Button asChild variant="outline" size="sm" className="w-full gap-2 text-xs font-semibold h-8">
                    <a href="/gallery/certification/full_stack_web_certificate.pdf" target="_blank" rel="noopener noreferrer">
                      <Award className="w-3.5 h-3.5 text-teal-500" /> View Full Certificate (PDF) <ExternalLink className="w-3 h-3 ml-auto" />
                    </a>
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* DSA Tab */}
          <div
            className={`col-start-1 row-start-1 grid grid-cols-1 md:grid-cols-2 gap-8 transition-opacity duration-300 ${activeTab === "dsa" ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            aria-hidden={activeTab !== "dsa"}
          >
            {/* LeetCode Card */}
            <Card className="col-span-1 md:col-span-2 stitch-glass stitch-card relative overflow-hidden group border-orange-500/20 shadow-2xl">
              <CardContent className="p-6 sm:p-8 md:p-10 flex flex-col lg:flex-row items-stretch gap-8">
                <div className="flex-1 flex flex-col md:flex-row items-center md:items-start gap-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/5 flex items-center justify-center text-orange-500 border border-orange-500/25 group-hover:scale-105 transition-all duration-300 shadow-xl shrink-0">
                    <LeetCodeIcon className="w-10 h-10 sm:w-12 sm:h-12" />
                  </div>
                  <div className="space-y-4 text-center md:text-left w-full">
                    <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-2 flex-wrap">
                      <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight">LeetCode Profile</CardTitle>
                      <Badge className="bg-orange-500/10 text-orange-500 border border-orange-500/20 font-semibold text-xs py-0.5 px-2">Active Coder</Badge>
                    </div>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl">
                      Solving algorithmic problems, mastering Data Structures &amp; Algorithms, and optimizing solutions for enterprise-grade performance.
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
                  <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white font-semibold flex items-center gap-2 group-hover:scale-105 transition-transform duration-300 shadow-lg">
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
                <Trophy className="w-5 h-5 text-amber-500" />
                <h3 className="text-xl font-bold">Competition Scorecards &amp; Certificates</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="stitch-glass stitch-card overflow-hidden group hover:border-primary/40 transition-all duration-300 flex flex-col shadow-lg relative">
                  <div className="absolute top-2 left-2 z-20 flex gap-2">
                    <Badge className="bg-black/60 backdrop-blur-md text-foreground border border-border/40 text-xs py-0.5 px-2">Newton School</Badge>
                    <Badge className="bg-primary/20 backdrop-blur-md text-primary border border-primary/20 text-xs py-0.5 px-2">DSA Competition</Badge>
                  </div>
                  <div className="relative aspect-[1.41] w-full overflow-hidden bg-muted/20 border-b border-border/40 flex items-center justify-center min-h-[200px]">
                    <img src="/gallery/scorecard/scorecard_newton_1.jpg" alt="Newton School DSA Competition Scorecard 1" className="absolute inset-0 w-full h-full object-contain bg-muted/30 group-hover:scale-[1.03] transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[3px] z-10">
                      <Button onClick={() => setSelectedImage("/gallery/scorecard/scorecard_newton_1.jpg")} variant="secondary" className="gap-2 font-semibold shadow-lg">
                        <Eye className="w-4 h-4" /> View Full Image
                      </Button>
                    </div>
                  </div>
                  <CardHeader className="p-4 flex-1 relative z-20 bg-card/10">
                    <CardTitle className="text-sm sm:text-base font-bold tracking-tight">Newton School DSA Competition Scorecard #1</CardTitle>
                  </CardHeader>
                </Card>

                <Card className="stitch-glass stitch-card overflow-hidden group hover:border-primary/40 transition-all duration-300 flex flex-col shadow-lg relative">
                  <div className="absolute top-2 left-2 z-20 flex gap-2">
                    <Badge className="bg-black/60 backdrop-blur-md text-foreground border border-border/40 text-xs py-0.5 px-2">Newton School</Badge>
                    <Badge className="bg-primary/20 backdrop-blur-md text-primary border border-primary/20 text-xs py-0.5 px-2">DSA Competition</Badge>
                  </div>
                  <div className="relative aspect-[1.41] w-full overflow-hidden bg-muted/20 border-b border-border/40 flex items-center justify-center min-h-[200px]">
                    <img src="/gallery/scorecard/scorecard_newton_2.jpg" alt="Newton School DSA Competition Scorecard 2" className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[3px] z-10">
                      <Button onClick={() => setSelectedImage("/gallery/scorecard/scorecard_newton_2.jpg")} variant="secondary" className="gap-2 font-semibold shadow-lg">
                        <Eye className="w-4 h-4" /> View Full Image
                      </Button>
                    </div>
                  </div>
                  <CardHeader className="p-4 flex-1 relative z-20 bg-card/10">
                    <CardTitle className="text-sm sm:text-base font-bold tracking-tight">Newton School DSA Competition Scorecard #2</CardTitle>
                  </CardHeader>
                </Card>

                <Card className="stitch-glass stitch-card overflow-hidden group hover:border-emerald-500/40 transition-all duration-300 flex flex-col shadow-lg relative border-emerald-500/20">
                  <div className="absolute top-2 left-2 z-20 flex gap-2">
                    <Badge className="bg-black/60 backdrop-blur-md text-foreground border border-border/40 text-xs py-0.5 px-2">Google</Badge>
                    <Badge className="bg-emerald-500/20 backdrop-blur-md text-emerald-400 border border-emerald-500/20 text-xs py-0.5 px-2">Vibe2Ship</Badge>
                  </div>
                  <div className="relative aspect-[1.41] w-full overflow-hidden bg-muted/20 border-b border-border/40 flex items-center justify-center min-h-[200px] cursor-pointer" onClick={() => setSelectedImage("/gallery/scorecard/Vibe2ShipCert_Sumit_Kumar.pdf")}>
                    <iframe src="/gallery/scorecard/Vibe2ShipCert_Sumit_Kumar.pdf#toolbar=0" className="w-full h-full border-0 pointer-events-none" title="Vibe2Ship Certificate" />
                    <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[3px] z-10">
                      <Button variant="secondary" className="gap-2 font-semibold shadow-lg">
                        <Eye className="w-4 h-4" /> View Certificate
                      </Button>
                    </div>
                  </div>
                  <CardHeader className="p-4 flex-1 relative z-20 bg-card/10">
                    <CardTitle className="text-sm sm:text-base font-bold tracking-tight">Google Vibe2Ship Hackathon Certificate</CardTitle>
                  </CardHeader>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Zoom Preview */}
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
              {selectedImage.toLowerCase().endsWith(".pdf") ? (
                <iframe
                  src={`${selectedImage}#toolbar=0`}
                  className="w-full h-[80vh] rounded-2xl border-0 bg-background"
                  title="Certificate PDF Preview"
                />
              ) : (
                <img
                  src={selectedImage}
                  alt="Enlarged preview"
                  className="w-full h-auto max-h-[80vh] object-contain"
                />
              )}
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
    </SectionWrapper>
  );
}
