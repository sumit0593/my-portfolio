"use client";

import React, { useState } from "react";
import Navbar from "@/app/components/navbar";
import { Container } from "@/components/ui/container";
import { ProjectTabs } from "@/components/projects/project-tabs";
import { ProjectCarousel } from "@/components/projects/project-carousel";
import { PROJECTS_DATA } from "@/components/projects/project-data";
import { motion } from "framer-motion";

const CATEGORIES = ["All", "GenAI", "Frontend", "Backend", "Full Stack", "Enterprise"];

export default function ProjectsPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredProjects = activeCategory === "All"
    ? PROJECTS_DATA
    : PROJECTS_DATA.filter((p) => p.category === activeCategory);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background relative overflow-hidden pt-24 pb-16">
        {/* Background glow effects */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[150px] pointer-events-none -z-10" />

        <Container className="flex flex-col items-center">
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
