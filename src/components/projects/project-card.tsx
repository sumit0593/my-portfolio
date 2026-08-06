"use client";

import React, { useState } from "react";
import { CardBody, CardContainer, CardItem } from "../ui/3d-card";
import { Project } from "./project-data";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Github, Sparkles, Cpu, Lock, MessageSquare, Bot } from "lucide-react";
import Link from "next/link";

export function ProjectCard({ project }: { project: Project }) {
  const [showPrivateNotice, setShowPrivateNotice] = useState(false);

  const isPrivateRepo = project.isPrivate || project.githubUrl === "https://github.com/sumit0593";

  const handleCodeClick = (e: React.MouseEvent) => {
    if (isPrivateRepo) {
      e.preventDefault();
      setShowPrivateNotice((prev) => !prev);
    }
  };

  return (
    <CardContainer className="inter-var w-full max-w-md">
      <CardBody className="bg-card/75 dark:bg-card/40 backdrop-blur-md relative group/card dark:hover:shadow-2xl dark:hover:shadow-primary/20 border-border/80 dark:border-border/50 w-full sm:w-[26rem] h-auto rounded-3xl p-6 border transition-all duration-300">
        <div className="flex justify-between items-start mb-2">
          <CardItem
            translateZ="50"
            className="text-2xl font-bold text-foreground"
          >
            {project.title}
          </CardItem>
          {project.featured && (
            <CardItem translateZ="60">
              <Badge className="bg-primary/20 text-primary border-primary/20 hover:bg-primary/30">
                Featured
              </Badge>
            </CardItem>
          )}
        </div>
        
        <CardItem
          as="p"
          translateZ="60"
          className="text-muted-foreground text-sm max-w-sm line-clamp-3 mb-6"
        >
          {project.description}
        </CardItem>
        
        <CardItem translateZ="100" rotateX={20} rotateZ={-5} className="w-full mb-6 mt-4">
          <div className="relative h-48 w-full overflow-hidden rounded-xl bg-muted/20 border border-border/50">
            <img
              src={project.image}
              className="h-full w-full object-cover rounded-xl group-hover/card:scale-105 transition-transform duration-700 ease-out"
              alt={`${project.title} thumbnail`}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
          </div>
        </CardItem>

        <CardItem translateZ="40" className="w-full mb-5">
          <div className="flex flex-wrap gap-2">
            {project.techStack.map((tech) => (
              <Badge key={tech} variant="secondary" className="bg-muted text-xs text-foreground/80 font-medium border border-border/40">
                {tech}
              </Badge>
            ))}
          </div>
        </CardItem>

        <CardItem translateZ="30" className="w-full mb-6 space-y-2.5">
          {project.aiFeatures && (
             <div className="flex items-center gap-2 text-xs font-medium text-purple-700 dark:text-purple-300 bg-purple-500/10 dark:bg-purple-500/20 w-fit px-2 py-1 rounded-md border border-purple-500/20 dark:border-purple-500/30">
               <Sparkles className="w-3.5 h-3.5" />
               <span>{project.aiFeatures[0]}</span>
             </div>
          )}
          {project.architecture && (
             <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 dark:bg-emerald-500/20 w-fit px-2 py-1 rounded-md border border-emerald-500/20 dark:border-emerald-500/30">
               <Cpu className="w-3.5 h-3.5" />
               <span>{project.architecture[0]}</span>
             </div>
          )}
        </CardItem>

        {showPrivateNotice && (
          <div className="mb-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-3 animate-in fade-in zoom-in-95 duration-200 z-30 relative">
            <div className="flex items-center gap-2 font-bold text-amber-400">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Private Repository Notice</span>
            </div>
            <p className="text-muted-foreground leading-relaxed text-xs">
              This is a private repository. You need to connect with <strong>Sumit</strong> or talk to <strong>Nova AI Assistant</strong> to request code access or demo.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <a
                href={`https://wa.me/917011676185?text=${encodeURIComponent(`Hi Sumit, I would like to request code access / walkthrough for the ${project.title} private repository.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 transition-colors cursor-pointer text-[11px]"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Connect with Sumit
              </a>
              <Link
                href="/ai-assistant"
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 transition-colors cursor-pointer text-[11px]"
              >
                <Bot className="w-3.5 h-3.5" />
                Talk to Nova AI
              </Link>
              <a
                href={project.githubUrl || "https://github.com/sumit0593"}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold flex items-center gap-1.5 transition-colors border border-border cursor-pointer text-[11px]"
              >
                <Github className="w-3.5 h-3.5" />
                GitHub Profile
              </a>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mt-auto pt-4 border-t border-border/50">
          <CardItem
            translateZ={20}
            translateX={-30}
            as={Link}
            href={project.githubUrl || "#"}
            onClick={handleCodeClick}
            target={project.githubUrl ? "_blank" : undefined}
            className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 ${
              !project.githubUrl
                ? "opacity-30 cursor-not-allowed pointer-events-none"
                : isPrivateRepo
                ? "bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 cursor-pointer"
                : "hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            }`}
          >
            {isPrivateRepo ? <Lock className="w-4 h-4 text-amber-400" /> : <Github className="w-4 h-4" />}
            {isPrivateRepo ? "Code (Private)" : "Code"}
          </CardItem>
          <CardItem
            translateZ={20}
            translateX={30}
            as={Link}
            href={project.liveUrl || "#"}
            target={project.liveUrl ? "_blank" : undefined}
            className={`px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold flex items-center gap-2 hover:bg-primary/90 transition-all hover:scale-105 shadow-lg shadow-primary/20 ${!project.liveUrl ? "opacity-30 cursor-not-allowed pointer-events-none" : "cursor-pointer"}`}
          >
            Live Demo
            <ExternalLink className="w-4 h-4" />
          </CardItem>
        </div>
      </CardBody>
    </CardContainer>
  );
}
