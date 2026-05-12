"use client";

import React, { useRef } from "react";
import { Project } from "./project-data";
import { ProjectCard } from "./project-card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ProjectCarousel({ projects }: { projects: Project[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === "left" ? -clientWidth + 100 : clientWidth - 100;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
          <span className="text-2xl">🔍</span>
        </div>
        <h3 className="text-xl font-bold mb-2">No projects found</h3>
        <p className="text-muted-foreground">Try selecting a different category.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full group/carousel">
      {/* Navigation Arrows */}
      {projects.length > 1 && (
        <>
          <button
            onClick={() => scroll("left")}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-background/90 backdrop-blur-xl border border-border shadow-2xl flex items-center justify-center text-foreground md:opacity-0 md:group-hover/carousel:opacity-100 transition-all hover:scale-110 hover:bg-primary hover:text-primary-foreground focus:opacity-100 md:-left-4 lg:-left-12"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-background/90 backdrop-blur-xl border border-border shadow-2xl flex items-center justify-center text-foreground md:opacity-0 md:group-hover/carousel:opacity-100 transition-all hover:scale-110 hover:bg-primary hover:text-primary-foreground focus:opacity-100 md:-right-4 lg:-right-12"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Carousel Container */}
      <div className="relative w-full overflow-hidden">
        {/* Gradients to hide sharp edges on desktop */}
        <div className="absolute left-0 top-0 bottom-0 w-8 md:w-32 bg-gradient-to-r from-background to-transparent z-30 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 md:w-32 bg-gradient-to-l from-background to-transparent z-30 pointer-events-none" />

        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-4 sm:gap-8 snap-x snap-mandatory hide-scrollbar py-8 sm:py-16 px-4 sm:px-8 md:px-32 lg:px-48"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <AnimatePresence mode="popLayout">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="snap-center shrink-0 flex items-center justify-center w-full sm:w-auto"
              >
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
