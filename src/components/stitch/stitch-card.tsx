"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

export interface StitchCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  glowColor?: "indigo" | "purple" | "emerald" | "orange" | "blue";
}

export function StitchCard({
  children,
  className,
  glowColor = "indigo",
  ...props
}: StitchCardProps) {
  const glowStyles = {
    indigo: "hover:border-indigo-500/40 hover:shadow-[0_8px_32px_-4px_rgba(99,102,241,0.25)]",
    purple: "hover:border-purple-500/40 hover:shadow-[0_8px_32px_-4px_rgba(168,85,247,0.25)]",
    emerald: "hover:border-emerald-500/40 hover:shadow-[0_8px_32px_-4px_rgba(16,185,129,0.25)]",
    orange: "hover:border-orange-500/40 hover:shadow-[0_8px_32px_-4px_rgba(249,115,22,0.25)]",
    blue: "hover:border-blue-500/40 hover:shadow-[0_8px_32px_-4px_rgba(59,130,246,0.25)]",
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={cn(
        "relative rounded-3xl stitch-glass border border-border/50 overflow-hidden transition-all duration-300 group",
        glowStyles[glowColor],
        className
      )}
      {...props}
    >
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      {children}
    </motion.div>
  );
}

export function StitchCardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("p-6 sm:p-8 pb-4 flex flex-col space-y-2", className)}>{children}</div>;
}

export function StitchCardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={cn("text-xl sm:text-2xl font-bold tracking-tight text-foreground", className)}>{children}</h3>;
}

export function StitchCardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("p-6 sm:p-8 pt-0 flex-1 text-sm text-muted-foreground leading-relaxed", className)}>{children}</div>;
}

export function StitchCardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("p-6 sm:p-8 pt-4 border-t border-border/40 flex items-center justify-between", className)}>{children}</div>;
}
