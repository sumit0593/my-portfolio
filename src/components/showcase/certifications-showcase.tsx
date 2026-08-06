"use client";

import { useState, useRef, useEffect } from "react";
import { StitchCard } from "@/components/stitch/stitch-card";
import { StitchBadge } from "@/components/stitch/stitch-badge";
import { Button } from "@/components/ui/button";
import { Award, Eye, ExternalLink, ChevronRight, Calendar, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

export function CertificationsShowcase() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
      {/* IIT Mandi Certificate */}
      <StitchCard glowColor="indigo" className="flex flex-col">
        <div className="absolute top-3 left-3 z-20">
          <StitchBadge variant="primary">IIT Mandi - TIH</StitchBadge>
        </div>
        <div className="relative aspect-[1.8] w-full bg-muted/10 border-b border-border/40 flex items-center justify-center overflow-hidden h-40 sm:h-44">
          <PDFPreview url="/gallery/certification/certificate_of_Excellence_GenAI_Multi-Agent_Systems.pdf" className="absolute inset-0 w-full h-full" onZoom={setSelectedImage} />
        </div>
        <div className="p-4 sm:p-5 flex flex-col flex-1 relative z-20 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <h3 className="text-base sm:text-lg font-bold tracking-tight text-foreground">PG Certification in GenAI &amp; Multi-Agent Systems</h3>
            <StitchBadge variant="outline" className="w-fit text-[10px]">
              <Calendar className="w-3 h-3 mr-1" /> 2024
            </StitchBadge>
          </div>
          <ul className="space-y-1.5 text-xs text-muted-foreground leading-snug">
            <li className="flex gap-1.5"><ChevronRight className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" /><span><strong className="text-foreground">Curriculum:</strong> Prompt Engineering, RAG Pipelines &amp; Vector Databases.</span></li>
            <li className="flex gap-1.5"><ChevronRight className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" /><span><strong className="text-foreground">Agentic Systems:</strong> Multi-Agent Graphs (LangChain, CrewAI, AutoGen).</span></li>
            <li className="flex gap-1.5"><ChevronRight className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" /><span><strong className="text-foreground">Deployment:</strong> Fine-tuned LLMs &amp; FastAPI FastMCP Microservices.</span></li>
          </ul>
          <div className="flex flex-wrap gap-1 pt-1">
            {["Generative AI", "Multi-Agent Systems", "LangChain", "FastAPI", "RAG", "LLMOps"].map((t) => (
              <StitchBadge key={t} variant="outline" className="text-[9px] py-0 px-2">{t}</StitchBadge>
            ))}
          </div>

          {/* 4 Mini Sub-Certificate Containers */}
          <div className="space-y-2 pt-3 border-t border-border/40">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400/90 flex items-center gap-1">
              <Award className="w-3 h-3 text-indigo-400" /> IIT Mandi Specializations &amp; Excellence (4 Certs)
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
                  <h4 className="text-[10px] font-bold text-foreground line-clamp-1 group-hover/mini:text-indigo-300 transition-colors">RAG Engineering</h4>
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
                  <p className="text-[8px] text-muted-foreground truncate">Fine-Tuning &amp; Prompts</p>
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
                  <h4 className="text-[10px] font-bold text-foreground line-clamp-1 group-hover/mini:text-indigo-300 transition-colors">Multi-Agent Systems</h4>
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

          <div className="pt-3 border-t border-border/40 mt-auto">
            <Button asChild variant="default" size="sm" className="w-full gap-2 text-xs font-semibold h-8">
              <a href="/gallery/certification/certificate_of_Excellence_GenAI_Multi-Agent_Systems.pdf" target="_blank" rel="noopener noreferrer">
                <Award className="w-3.5 h-3.5" /> Full PG Certificate (PDF) <ExternalLink className="w-3 h-3 ml-auto" />
              </a>
            </Button>
          </div>
        </div>
      </StitchCard>

      {/* Newton School Certificate */}
      <StitchCard glowColor="emerald" className="flex flex-col">
        <div className="absolute top-3 left-3 z-20">
          <StitchBadge variant="emerald">Newton School</StitchBadge>
        </div>
        <div className="relative aspect-[1.8] w-full bg-muted/10 border-b border-border/40 flex items-center justify-center overflow-hidden h-40 sm:h-44">
          <PDFPreview url="/gallery/certification/full_stack_web_certificate.pdf" className="absolute inset-0 w-full h-full" onZoom={setSelectedImage} />
        </div>
        <div className="p-4 sm:p-5 flex flex-col flex-1 relative z-20 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <h3 className="text-base sm:text-lg font-bold tracking-tight text-foreground">Full Stack Web Development Certificate</h3>
            <StitchBadge variant="outline" className="w-fit text-[10px]">
              <Calendar className="w-3 h-3 mr-1" /> 2022 — 2023
            </StitchBadge>
          </div>
          <ul className="space-y-1.5 text-xs text-muted-foreground leading-snug">
            <li className="flex gap-1.5"><ChevronRight className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /><span>Trained in modern full-stack web technologies &amp; building AI-powered web apps.</span></li>
            <li className="flex gap-1.5"><ChevronRight className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /><span>Hands-on React, Next.js, Node.js, Express, MongoDB, JavaScript &amp; Git.</span></li>
          </ul>
          <div className="flex flex-wrap gap-1 pt-1">
            {["Next.js", "React", "Node.js", "MongoDB", "Express.js", "JavaScript"].map((t) => (
              <StitchBadge key={t} variant="outline" className="text-[9px] py-0 px-2">{t}</StitchBadge>
            ))}
          </div>
          <div className="pt-3 border-t border-border/40 mt-auto">
            <Button asChild variant="outline" size="sm" className="w-full gap-2 text-xs font-semibold h-8">
              <a href="/gallery/certification/full_stack_web_certificate.pdf" target="_blank" rel="noopener noreferrer">
                <Award className="w-3.5 h-3.5 text-emerald-500" /> View Full Certificate (PDF) <ExternalLink className="w-3 h-3 ml-auto" />
              </a>
            </Button>
          </div>
        </div>
      </StitchCard>

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
    </div>
  );
}
