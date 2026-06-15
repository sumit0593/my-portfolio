"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type TabProps = {
  categories: string[];
  activeCategory: string;
  onTabChange: (category: string) => void;
};

export function ProjectTabs({ categories, activeCategory, onTabChange }: TabProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mb-12 p-1 bg-muted/30 backdrop-blur-sm rounded-full border border-border/50 max-w-fit mx-auto shadow-sm">
      {categories.map((category) => {
        const isActive = activeCategory === category;
        return (
          <button
            key={category}
            onClick={() => onTabChange(category)}
            className={cn(
              "relative px-5 py-2.5 rounded-full text-sm font-medium transition-colors outline-none cursor-pointer",
              isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            {isActive && (
              <motion.div
                layoutId="active-tab"
                className="absolute inset-0 bg-primary shadow-md rounded-full"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{category}</span>
          </button>
        );
      })}
    </div>
  );
}
