"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface StitchBadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "emerald" | "orange" | "purple" | "blue" | "outline";
  className?: string;
}

export function StitchBadge({
  children,
  variant = "primary",
  className,
}: StitchBadgeProps) {
  const variantStyles = {
    primary: "bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border-indigo-500/20 shadow-indigo-500/5",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 shadow-emerald-500/5",
    orange: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20 shadow-orange-500/5",
    purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 shadow-purple-500/5",
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 shadow-blue-500/5",
    outline: "bg-background/50 text-foreground border-border/50 shadow-none",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold tracking-wide backdrop-blur-md shadow-sm transition-all duration-200",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
