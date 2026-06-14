"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/app/components/navbar";
import { Container } from "@/components/ui/container";
import { ProjectTabs } from "@/components/projects/project-tabs";
import { ProjectCarousel } from "@/components/projects/project-carousel";
import { PROJECTS_DATA } from "@/components/projects/project-data";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/ui/toggle";
import Link from "next/link";

const CATEGORIES = ["All", "GenAI", "Frontend", "Backend", "Full Stack", "Enterprise"];

function ProjectsContent() {
  const searchParams = useSearchParams();
  const fromHome = searchParams.get("from") === "home";
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredProjects = activeCategory === "All"
    ? PROJECTS_DATA
    : PROJECTS_DATA.filter((p) => p.categories.includes(activeCategory as any));

  return (
    <>
      {!fromHome ? (
        <Navbar />
      ) : (
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
      )}
      <div className="min-h-screen bg-background relative overflow-hidden pt-24 pb-16">
        {/* Background glow effects */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[150px] pointer-events-none -z-10" />

        <Container className="flex flex-col items-center">
          {fromHome && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-6xl px-4 mb-8 self-start"
            >
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card/75 dark:bg-card/40 border border-border/80 dark:border-border/50 text-foreground hover:bg-muted/80 hover:text-foreground transition-all duration-300 font-semibold group cursor-pointer shadow-sm hover:scale-105"
              >
                <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
                <span>Back to Home</span>
              </Link>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-10"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6">
              <span className="text-sm font-medium tracking-wide">Featured Work</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/70">
              AI & Full Stack Projects
            </h1>
            <p className="text-muted-foreground text-lg px-4">
              Explore my latest enterprise-grade applications, scalable backend microservices, and Retrieval-Augmented Generation (RAG) platforms. Swipe or use the arrows to navigate.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full"
          >
            <ProjectTabs
              categories={CATEGORIES}
              activeCategory={activeCategory}
              onTabChange={setActiveCategory}
            />
            
            <ProjectCarousel projects={filteredProjects} />
          </motion.div>
        </Container>
      </div>
    </>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    }>
      <ProjectsContent />
    </Suspense>
  );
}
