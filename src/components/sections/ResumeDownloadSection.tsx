"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Eye, Bot, Sparkles, FileStack } from "lucide-react";
import { Button } from "@/components/ui/button";
import ResumeModal from "@/components/ui/resume-modal";

export function ResumeDownloadSection() {
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);

  return (
    <section className="relative w-full py-12 md:py-16 bg-background overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col text-center lg:text-left items-center lg:items-start"
          >
            <div className="inline-flex items-center justify-center lg:justify-start gap-2 text-primary font-medium tracking-wide mb-4 w-full">
              <Sparkles className="w-5 h-5" />
              <span>Ready for Enterprise Hiring</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-center lg:text-left w-full">
              Recruiter-Optimized <span className="text-gradient">Resume</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 text-center lg:text-left max-w-xl">
              Download my ATS-friendly resume to see a detailed breakdown of my GenAI expertise, full-stack enterprise projects, and impact metrics.
            </p>

            <div className="flex flex-col gap-4 w-full max-w-md mx-auto lg:mx-0">
              <Button
                onClick={() => setIsResumeModalOpen(true)}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-1"
                size="lg"
              >
                <Eye className="w-5 h-5 mr-2" /> Preview Resume
              </Button>
              <div className="grid grid-cols-2 gap-4 w-full">
                <Button
                  variant="outline"
                  asChild
                  className="border-primary/20 hover:bg-primary/5 transition-all hover:-translate-y-1 w-full"
                  size="lg"
                >
                  <a href="/resume/Sumit_Kumar_GenAI_Full_Stack.pdf" download>
                    <Download className="w-5 h-5 mr-2 animate-bounce" style={{ animationDuration: "3s" }} /> PDF Version
                  </a>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="border-primary/20 hover:bg-primary/5 transition-all hover:-translate-y-1 w-full"
                  size="lg"
                >
                  <a href="/resume/Sumit_Kumar_GenAI_Full_Stack.docx" download>
                    <Download className="w-5 h-5 mr-2 animate-bounce" style={{ animationDuration: "3s" }} /> DOCX Version
                  </a>
                </Button>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-center lg:justify-start gap-4 text-sm text-muted-foreground w-full">
              <span className="flex items-center gap-1"><FileStack className="w-4 h-4" /> DOCX Available</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
              <span className="flex items-center gap-1"><Bot className="w-4 h-4" /> Analyzed by AI</span>
            </div>
          </motion.div>

          {/* Right Visual / Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative w-full aspect-[8.5/11] max-w-md mx-auto lg:mr-0 group cursor-pointer perspective-1000 hidden lg:block"
            onClick={() => setIsResumeModalOpen(true)}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent rounded-2xl -m-4 blur-xl group-hover:blur-2xl transition-all duration-500" />

            <div className="relative w-full h-full bg-card/80 backdrop-blur-xl border border-border shadow-2xl rounded-2xl overflow-hidden group-hover:-translate-y-2 group-hover:rotate-1 transition-all duration-500">
              {/* Fake Resume Header */}
              <div className="p-6 border-b border-border/50 bg-muted/20">
                <div className="h-4 w-1/3 bg-primary/20 rounded mb-3" />
                <div className="h-3 w-1/2 bg-muted rounded" />
              </div>

              {/* Fake Resume Content Blocks */}
              <div className="p-6 space-y-6">
                <div className="space-y-3">
                  <div className="h-3 w-1/4 bg-primary/20 rounded" />
                  <div className="space-y-2">
                    <div className="h-2 w-full bg-muted rounded" />
                    <div className="h-2 w-full bg-muted rounded" />
                    <div className="h-2 w-5/6 bg-muted rounded" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-3 w-1/4 bg-primary/20 rounded" />
                  <div className="space-y-2">
                    <div className="h-2 w-full bg-muted rounded" />
                    <div className="h-2 w-11/12 bg-muted rounded" />
                    <div className="h-2 w-4/5 bg-muted rounded" />
                  </div>
                </div>
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                <div className="bg-primary text-primary-foreground px-6 py-3 rounded-full flex items-center gap-2 font-medium shadow-lg">
                  <Eye className="w-5 h-5" /> Click to Read
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <ResumeModal isOpen={isResumeModalOpen} onClose={() => setIsResumeModalOpen(false)} />
    </section>
  );
}
