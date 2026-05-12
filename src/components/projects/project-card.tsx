"use client";

import React from "react";
import { CardBody, CardContainer, CardItem } from "../ui/3d-card";
import { Project } from "./project-data";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Github, Sparkles, Cpu } from "lucide-react";
import Link from "next/link";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <CardContainer className="inter-var w-full max-w-md">
      <CardBody className="bg-card/40 backdrop-blur-md relative group/card dark:hover:shadow-2xl dark:hover:shadow-primary/20 border-border/50 w-full sm:w-[26rem] h-auto rounded-3xl p-6 border transition-all duration-300">
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
            {project.techStack.slice(0, 4).map((tech) => (
              <Badge key={tech} variant="secondary" className="bg-secondary/50 text-xs text-foreground/80 font-medium">
                {tech}
              </Badge>
            ))}
            {project.techStack.length > 4 && (
              <Badge variant="outline" className="text-xs bg-background/50">+{project.techStack.length - 4}</Badge>
            )}
          </div>
        </CardItem>

        {(project.aiFeatures || project.architecture) && (
          <CardItem translateZ="30" className="w-full mb-8 space-y-2.5">
            {project.aiFeatures && (
               <div className="flex items-center gap-2 text-xs font-medium text-purple-400/90 bg-purple-500/10 w-fit px-2 py-1 rounded-md border border-purple-500/20">
                 <Sparkles className="w-3.5 h-3.5" />
                 <span>{project.aiFeatures[0]}</span>
               </div>
            )}
            {project.architecture && (
               <div className="flex items-center gap-2 text-xs font-medium text-emerald-400/90 bg-emerald-500/10 w-fit px-2 py-1 rounded-md border border-emerald-500/20">
                 <Cpu className="w-3.5 h-3.5" />
                 <span>{project.architecture[0]}</span>
               </div>
            )}
          </CardItem>
        )}

        <div className="flex justify-between items-center mt-auto pt-4 border-t border-border/50">
          <CardItem
            translateZ={20}
            translateX={-30}
            as={Link}
            href={project.githubUrl || "#"}
            target={project.githubUrl ? "_blank" : undefined}
            className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 ${!project.githubUrl ? "opacity-30 cursor-not-allowed pointer-events-none" : "hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"}`}
          >
            <Github className="w-4 h-4" />
            Code
          </CardItem>
          <CardItem
            translateZ={20}
            translateX={30}
            as={Link}
            href={project.liveUrl || "#"}
            target={project.liveUrl ? "_blank" : undefined}
            className={`px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold flex items-center gap-2 hover:bg-primary/90 transition-all hover:scale-105 shadow-lg shadow-primary/20 ${!project.liveUrl ? "opacity-30 cursor-not-allowed pointer-events-none" : ""}`}
          >
            Live Demo
            <ExternalLink className="w-4 h-4" />
          </CardItem>
        </div>
      </CardBody>
    </CardContainer>
  );
}
