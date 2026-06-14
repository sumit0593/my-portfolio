// app/dashboard/page.tsx
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "../components/navbar";
import SectionWrapper from "../components/section-wrapper";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Github, Linkedin, Mail, Phone, ExternalLink, Award, Trophy, Download, Eye, FileText, Bot, Briefcase, ArrowRight, Code, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ImagesBadge } from "@/components/ui/images-badge";
import Loading from "@/app/loading";

export default function Dashboard() {
  const { data: session, status } = useSession();

  if (status === "loading") return <Loading />;
  if (!session) redirect("/login");

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <>
      <Navbar />
      <div className="relative min-h-screen bg-background overflow-x-hidden">
        {/* Background Decorative Elements — clipped to prevent horizontal overflow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-primary/10 via-background to-background" />
          <div className="absolute top-[20%] right-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-[150px] -translate-x-1/3" />
        </div>

        <main className="pt-24 pb-16 relative z-10">
          <Container className="space-y-16 sm:space-y-20 md:space-y-24">

            {/* Hero Section */}
            <SectionWrapper id="home" className="min-h-[60vh] sm:min-h-[80vh] flex-col items-center justify-center text-center p-0">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary mb-8"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <span className="text-sm font-medium">Available for Enterprise Freelance Projects</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-6"
              >
                Sumit Kumar <br />
                <span className="text-gradient">GenAI & Full Stack Architect</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 sm:mb-12 leading-relaxed px-2"
              >
                Building scalable Multi-Agent Systems, RAG pipelines, and enterprise AI SaaS platforms. IIT Mandi GenAI Certified.
              </motion.p>

              {/* Quick Actions & Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col items-center w-full max-w-4xl mx-auto space-y-8 sm:space-y-12"
              >
                {/* Quick Actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 w-full gap-4 sm:gap-6">
                  <Button variant="ghost" className="flex flex-col items-center gap-2 h-auto py-4 bg-muted/30 hover:bg-muted border border-transparent hover:border-border transition-all group" onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}>
                    <Briefcase className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Hire Me</span>
                  </Button>
                  <Button variant="ghost" asChild className="flex flex-col items-center gap-2 h-auto py-4 bg-muted/30 hover:bg-muted border border-transparent hover:border-border transition-all group">
                    <Link href="/tools">
                      <Bot className="w-6 h-6 text-blue-500 group-hover:scale-110 transition-transform" />
                      <span className="font-medium">AI Tools</span>
                    </Link>
                  </Button>
                  <Button variant="ghost" asChild className="flex flex-col items-center gap-2 h-auto py-4 bg-muted/30 hover:bg-muted border border-transparent hover:border-border transition-all group">
                    <Link href="/services">
                      <Award className="w-6 h-6 text-purple-500 group-hover:scale-110 transition-transform" />
                      <span className="font-medium">Services</span>
                    </Link>
                  </Button>
                  <Button variant="ghost" className="flex flex-col items-center gap-2 h-auto py-4 bg-muted/30 hover:bg-muted border border-transparent hover:border-border transition-all group" onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })}>
                    <Code className="w-6 h-6 text-emerald-500 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Projects</span>
                  </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 sm:gap-8 pt-8 sm:pt-10 border-t w-full border-border/50">
                  <div className="text-center">
                    <p className="text-2xl sm:text-3xl font-bold text-foreground">4+</p>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider">Years Exp.</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl sm:text-3xl font-bold text-foreground">10+</p>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider">Enterprise Apps</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl sm:text-3xl font-bold text-foreground">95%</p>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider">ATS Score</p>
                  </div>
                </div>

              </motion.div>
            </SectionWrapper>

            {/* About Section */}
            <SectionWrapper id="about" className="min-h-0 py-8 sm:py-12 md:py-16 px-0">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8 justify-center">
                  <div className="h-px bg-border flex-1 max-w-[60px] md:max-w-[100px]" />
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">About Me</h2>
                  <div className="h-px bg-border flex-1 max-w-[60px] md:max-w-[100px]" />
                </div>

                <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl p-6 sm:p-8 md:p-12 shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none transition-transform duration-700 group-hover:scale-150" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none transition-transform duration-700 group-hover:scale-150" />

                  <div className="relative z-10 space-y-6 text-base md:text-lg text-muted-foreground leading-relaxed break-words">
                    <p className="text-foreground font-medium text-lg sm:text-xl leading-snug">
                      Forward-thinking <span className="text-primary font-bold">Generative AI & Full Stack Engineer</span> with strong expertise in designing and developing scalable AI-powered web applications, Multi-Agent Systems, and Retrieval-Augmented Generation (RAG) architectures. Passionate about building intelligent, production-grade solutions that combine modern frontend engineering with advanced AI orchestration.
                    </p>

                    <p>
                      Currently advancing expertise through the <span className="text-foreground font-semibold">IIT Mandi GenAI curriculum</span>, with a strong focus on Large Language Model (LLM) orchestration, prompt engineering, semantic retrieval systems, fine-tuning strategies, and autonomous agentic workflows using frameworks such as LangChain, CrewAI, AutoGen, and LlamaIndex.
                    </p>

                    <p>
                      Skilled in architecting end-to-end AI systems using React.js, Next.js, TypeScript, Node.js, FastAPI, MongoDB, Pinecone, and cloud-native technologies. Hands-on experience in implementing vector search, hybrid retrieval pipelines, AI chatbot systems, OCR-based document intelligence, and scalable backend APIs optimized for performance and maintainability.
                    </p>

                    <div className="pt-6 pb-2">
                      <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-foreground mb-4 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" /> Modern AI Engineering Concepts
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "RAG pipelines",
                          "Vector databases",
                          "Multi-Agent collaboration",
                          "LLM architecture",
                          "Workflow orchestration",
                          "Prompt optimization",
                          "Semantic search",
                          "AI automation"
                        ].map((concept) => (
                          <Badge key={concept} variant="secondary" className="px-3 py-1.5 text-xs sm:text-sm font-medium bg-secondary/50 hover:bg-secondary border border-border/50 transition-colors shadow-sm">
                            {concept}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <p>
                      Professionally experienced in building enterprise-grade applications with a focus on scalability, clean architecture, responsive UI/UX, API optimization, authentication systems, and deployment-ready solutions. Adept at bridging the gap between AI research concepts and practical full-stack implementation.
                    </p>

                    <div className="mt-6 sm:mt-8 p-4 sm:p-6 rounded-2xl bg-primary/5 border border-primary/10 italic text-foreground/90 font-medium relative text-sm sm:text-base">
                      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-purple-500 rounded-l-2xl" />
                      "Driven by continuous learning and innovation, with a strong interest in building next-generation AI platforms, intelligent assistants, and scalable GenAI products that deliver measurable business impact."
                    </div>
                  </div>
                </div>
              </div>
            </SectionWrapper>

            <SectionWrapper id="skills" className="min-h-0 py-8 sm:py-12 px-0 text-left">
              <div className="space-y-8">
                <div className="border-b pb-4 border-border/50">
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Core Expertise</h2>
                  <p className="text-muted-foreground mt-2">Technologies and frameworks I specialize in</p>
                </div>
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-100px" }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <motion.div variants={itemVariants}>
                    <Card className="h-full glass hover:border-primary/50 transition-colors group relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors" />
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Bot className="w-5 h-5 text-blue-500" /> Generative AI & LLMs
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground leading-relaxed break-words hyphens-auto">RAG Pipelines, Prompt Engineering (Zero-shot/Few-shot/CoT), LLM Fine-Tuning, Transformers.</p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <Card className="h-full glass hover:border-purple-500/50 transition-colors group relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-colors" />
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Award className="w-5 h-5 text-purple-500" /> Agentic Frameworks
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground leading-relaxed">Multi-Agent Systems (MAS), LangChain, LlamaIndex, CrewAI, AutoGen, ReAct Agents.</p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <Card className="h-full glass hover:border-emerald-500/50 transition-colors group relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors" />
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Code className="w-5 h-5 text-emerald-500" /> Full Stack Core
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground leading-relaxed">React.js, Next.js, MERN Stack, Python, FastAPI, TypeScript, Node.js, Tailwind CSS, MUI.</p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <Card className="h-full glass hover:border-orange-500/50 transition-colors group relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-colors" />
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Trophy className="w-5 h-5 text-orange-500" /> Databases & DevOps
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground leading-relaxed break-words hyphens-auto">Vector Databases (Pinecone, ChromaDB, FAISS), MySQL, PostgreSQL, MongoDB, Docker, AWS, Jenkins, CI/CD.</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              </div>
            </SectionWrapper>

            <SectionWrapper id="experience" className="min-h-0 py-8 sm:py-12 px-0 text-left">
              <div className="space-y-8">
                <div className="border-b pb-4 border-border/50">
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Professional Experience</h2>
                  <p className="text-muted-foreground mt-2">My journey building enterprise scalable systems</p>
                </div>

                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-100px" }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {/* Kent RO Systems */}
                  <motion.div variants={itemVariants} className="h-full">
                    <Card className="flex flex-col h-full glass hover:border-primary/50 transition-colors group relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors" />
                      <div className="h-1 bg-gradient-to-r from-primary to-indigo-400 w-full" />
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-primary shrink-0" />
                            Software Engineer
                          </CardTitle>
                          <Badge variant="secondary" className="shrink-0">Apr 2024 — Present</Badge>
                        </div>
                        <p className="text-primary font-medium text-sm mt-1">Kent RO Systems Pvt Ltd</p>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4 marker:text-primary break-words">
                          <li>Engineered an AI-driven OCR invoice parsing microservice using AWS Textract and Node.js, automating data extraction and reducing manual processing time by 40%.</li>
                          <li>Architected high-availability server infrastructure using NGINX load balancing, optimizing traffic distribution and maintaining 99.9% uptime.</li>
                          <li>Implemented secure RBAC authentication via JWT and OAuth2, integrating seamlessly with dynamic Zoho Analytics dashboards.</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* TechnoIdentity */}
                  <motion.div variants={itemVariants} className="h-full">
                    <Card className="flex flex-col h-full glass hover:border-purple-500/50 transition-colors group relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-colors" />
                      <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-400 w-full" />
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-purple-500 shrink-0" />
                            Associate Software Developer
                          </CardTitle>
                          <Badge variant="outline" className="shrink-0">Aug 2023 — Mar 2024</Badge>
                        </div>
                        <p className="text-purple-500 font-medium text-sm mt-1">TechnoIdentity</p>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4 marker:text-purple-500 break-words">
                          <li>Spearheaded the legacy-to-modern migration of an enterprise HRMS platform using Next.js and TypeScript, significantly improving UI rendering speeds.</li>
                          <li>Developed scalable MERN-stack UI components for the US Toll Authority (Hectare), improving system maintainability and UX.</li>
                          <li>Established robust CI/CD testing pipelines using Cypress and Playwright, reducing QA cycles by automating workflows.</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              </div>
            </SectionWrapper>


            <SectionWrapper id="projects" className="min-h-0 py-8 sm:py-12 px-0 text-left">
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b pb-4 border-border/50 gap-4">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Enterprises's Work</h2>
                    <p className="text-muted-foreground mt-2">Enterprise systems and GenAI solutions</p>
                  </div>
                  <ImagesBadge
                    href="/projects"
                    text="View All Projects"
                    images={[
                      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=800&auto=format&fit=crop",
                      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop",
                      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop"
                    ]}
                    className="group"
                  />
                </div>

                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-100px" }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl"
                >
                  <motion.div variants={itemVariants} className="h-full">
                    <Card className="flex flex-col h-full hover:border-primary/50 hover:shadow-lg transition-all group overflow-hidden">
                      <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500 w-full group-hover:h-3 transition-all" />
                      <CardHeader className="pt-6">
                        <CardTitle className="flex justify-between items-start text-xl">
                          <span>Kent Risengine</span>
                          <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-0">Enterprise</Badge>
                        </CardTitle>
                        <CardDescription className="text-sm font-medium text-muted-foreground">AI Automation Platform</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                          Designed a robust Node.js/Express.js backend to support an AI invoice parser using AWS Textract. Integrated custom validation schemas and real-time Zoho Analytics synchronization.
                        </p>
                      </CardContent>
                      <CardFooter className="pt-0">
                        <div className="flex flex-wrap gap-2 w-full">
                          <Badge variant="outline" className="bg-background/50">React</Badge>
                          <Badge variant="outline" className="bg-background/50">Node.js</Badge>
                          <Badge variant="outline" className="bg-background/50">Zoho Analytics</Badge>
                          <Badge variant="outline" className="bg-background/50">Mistral LLM</Badge>
                        </div>
                      </CardFooter>
                    </Card>
                  </motion.div>

                  <motion.div variants={itemVariants} className="h-full">
                    <Card className="flex flex-col h-full hover:border-emerald-500/50 hover:shadow-lg transition-all group overflow-hidden">
                      <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500 w-full group-hover:h-3 transition-all" />
                      <CardHeader className="pt-6">
                        <CardTitle className="flex justify-between items-start text-xl">
                          <span>Cam Attendance</span>
                          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-0">Client</Badge>
                        </CardTitle>
                        <CardDescription className="text-sm font-medium text-muted-foreground">Enterprise HR Tracking</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                          Maintained a highly scalable full-stack attendance platform managing thousands of concurrent employees. Designed Spring Boot microservices, Angular modules, and robust REST APIs.
                        </p>
                      </CardContent>
                      <CardFooter className="pt-0">
                        <div className="flex flex-wrap gap-2 w-full">
                          <Badge variant="outline" className="bg-background/50">Spring Boot</Badge>
                          <Badge variant="outline" className="bg-background/50">Angular</Badge>
                          <Badge variant="outline" className="bg-background/50">REST APIs</Badge>
                        </div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                </motion.div>
              </div>
            </SectionWrapper>

            <SectionWrapper id="gallery" className="min-h-0 py-8 sm:py-12 px-0 text-left">
              <div className="space-y-10">
                <div className="border-b pb-4 border-border/50">
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Gallery & Achievements</h2>
                  <p className="text-muted-foreground mt-2">Certifications, Competitions & Continuous Learning</p>
                </div>

                <div className="space-y-12">
                  {/* Certifications Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.5 }}
                  >
                    <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                      <Award className="w-6 h-6 text-primary" /> Certifications
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                      <Card className="flex flex-col group hover:border-primary/50 transition-all hover:shadow-xl hover:-translate-y-1 overflow-hidden bg-card/50 glass">
                        <div className="relative h-64 bg-muted/30 border-b flex items-center justify-center overflow-hidden">
                          {/* Display PDF as preview */}
                          <div className="absolute inset-0 bg-background/10 backdrop-blur-[2px] transition-all z-10 group-hover:backdrop-blur-none group-hover:bg-transparent" />
                          <iframe
                            src="/gallery/certification/certificate_prompt_engineering.pdf#toolbar=0&navpanes=0&scrollbar=0&view=FitH"
                            className="absolute inset-0 w-full h-full pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity"
                            title="Certificate PDF"
                          />
                        </div>
                        <div className="flex flex-col p-6 flex-1">
                          <CardHeader className="p-0 mb-4">
                            <CardTitle className="text-xl">PG Certification in Gen AI and MAS</CardTitle>
                            <CardDescription className="text-primary font-medium mt-1 bg-primary/10 w-fit px-2 py-0.5 rounded-full text-xs">IIT Mandi - TIH (Dec 2025 - Present)</CardDescription>
                          </CardHeader>
                          <CardContent className="p-0 flex-1">
                            <ul className="text-sm text-muted-foreground space-y-3 list-none pl-0">
                              <li className="relative pl-5 before:absolute before:left-0 before:top-[6px] before:w-2 before:h-2 before:bg-primary/50 before:rounded-full"><strong>Core Curriculum:</strong> Mastered advanced Prompt Engineering, NLP fundamentals, and RAG pipelines using Vector Databases.</li>
                              <li className="relative pl-5 before:absolute before:left-0 before:top-[6px] before:w-2 before:h-2 before:bg-primary/50 before:rounded-full"><strong>Agentic AI & Fine-Tuning:</strong> Architected autonomous Multi-Agent Systems (MAS) using LangChain, CrewAI, AutoGen, and fine-tuned LLMs.</li>
                              <li className="relative pl-5 before:absolute before:left-0 before:top-[6px] before:w-2 before:h-2 before:bg-primary/50 before:rounded-full"><strong>Deployment:</strong> Applied Deep Learning foundations to deploy scalable GenAI models via FastAPI.</li>
                            </ul>
                          </CardContent>
                          <div className="mt-6 pt-4 border-t border-border/50">
                            <a href="/gallery/certification/certificate_prompt_engineering.pdf" target="_blank" rel="noreferrer" className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors gap-2 relative z-20 group/link">
                              View Full Certificate <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                            </a>
                          </div>
                        </div>
                      </Card>

                      {/* Newton School */}
                      <Card className="flex flex-col group hover:border-primary/50 transition-all hover:shadow-xl hover:-translate-y-1 overflow-hidden bg-card/50 glass">
                        <div className="relative h-64 bg-muted/30 border-b flex items-center justify-center overflow-hidden">
                          {/* Display PDF as preview */}
                          <div className="absolute inset-0 bg-background/10 backdrop-blur-[2px] transition-all z-10 group-hover:backdrop-blur-none group-hover:bg-transparent" />
                          <iframe
                            src="/gallery/certification/full_stack_web_certificate.pdf#toolbar=0&navpanes=0&scrollbar=0&view=FitH"
                            className="absolute inset-0 w-full h-full pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity"
                            title="Certificate PDF"
                          />
                        </div>
                        <div className="flex flex-col p-6 flex-1">
                          <CardHeader className="p-0 mb-4">
                            <CardTitle className="text-xl">Full Stack Web Developer</CardTitle>
                            <CardDescription className="text-primary font-medium mt-1 bg-primary/10 w-fit px-2 py-0.5 rounded-full text-xs">Newton School (May 2022 - Mar 2023)</CardDescription>
                          </CardHeader>
                          <CardContent className="p-0 flex-1">
                            <ul className="text-sm text-muted-foreground space-y-3 list-none pl-0">
                              <li className="relative pl-5 before:absolute before:left-0 before:top-[6px] before:w-2 before:h-2 before:bg-primary/50 before:rounded-full">Trained in modern full-stack web technologies with a strong focus on building AI-powered web applications.</li>
                              <li className="relative pl-5 before:absolute before:left-0 before:top-[6px] before:w-2 before:h-2 before:bg-primary/50 before:rounded-full">Gained hands-on experience with Next.js, Node.js, Express.js, MongoDB, and Git.</li>
                              <li className="relative pl-5 before:absolute before:left-0 before:top-[6px] before:w-2 before:h-2 before:bg-primary/50 before:rounded-full">Actively participated in DSA coding contests, improving algorithmic thinking.</li>
                            </ul>
                          </CardContent>
                          <div className="mt-6 pt-4 border-t border-border/50">
                            <a href="/gallery/certification/full_stack_web_certificate.pdf" target="_blank" rel="noreferrer" className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors gap-2 relative z-20 group/link">
                              View Full Certificate <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                            </a>
                          </div>
                        </div>
                      </Card>

                    </div>
                  </motion.div>

                  {/* Competitions Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.5 }}
                  >
                    <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                      <Trophy className="w-6 h-6 text-primary" /> Competitions
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <Card className="flex flex-col hover:border-primary/50 transition-all hover:shadow-md hover:-translate-y-1 group bg-gradient-to-br from-card to-primary/5 border-primary/20">
                        <CardHeader>
                          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground text-primary transition-colors">
                            <Trophy className="w-6 h-6" />
                          </div>
                          <CardTitle>Newton School Coding Contests</CardTitle>
                          <CardDescription className="mt-1 font-medium">Competitive Programming</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            Regularly participated in Data Structures and Algorithms contests, demonstrating strong problem-solving skills and algorithmic thinking among a large pool of developers.
                          </p>
                        </CardContent>
                      </Card>

                      {/* Placeholder for future competitions */}
                      <Card className="flex flex-col transition-all group border-dashed border-2 bg-transparent shadow-none justify-center items-center text-center p-6 h-full min-h-[200px] hover:bg-muted/30">
                        <Trophy className="w-10 h-10 opacity-20 mb-4 text-muted-foreground transition-colors" />
                        <CardTitle className="text-lg text-muted-foreground">More Competitions Ahead</CardTitle>
                        <p className="text-xs text-muted-foreground/70 mt-2">Always learning and competing</p>
                      </Card>
                    </div>
                  </motion.div>
                </div>
              </div>
            </SectionWrapper>

            <SectionWrapper id="contact" className="min-h-0 py-8 sm:py-12 px-0">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-muted/50 to-muted rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-16 mb-8 sm:mb-12 border border-border shadow-lg relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

                <div className="relative z-10 text-center max-w-3xl mx-auto">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-4">Ready to Innovate?</h2>
                  <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-6 sm:mb-10">
                    Whether you need a scalable Multi-Agent System, an enterprise RAG pipeline, or a full-stack SaaS application, I'm ready to help you build the future.
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                    <a href="mailto:sumitsumitsumit163@gmail.com" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-2 sm:gap-3 bg-background hover:bg-muted p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-border transition-all hover:-translate-y-1 hover:shadow-md group">
                      <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
                        <Mail className="w-6 h-6" />
                      </div>
                      <span className="text-sm sm:text-base font-semibold">Email</span>
                    </a>
                    <a href="tel:7011676185" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-2 sm:gap-3 bg-background hover:bg-muted p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-border transition-all hover:-translate-y-1 hover:shadow-md group">
                      <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 group-hover:bg-green-500 group-hover:text-white transition-colors">
                        <Phone className="w-6 h-6" />
                      </div>
                      <span className="text-sm sm:text-base font-semibold">Call</span>
                    </a>
                    <a href="https://www.linkedin.com/in/sumit-kumar0509/" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-2 sm:gap-3 bg-background hover:bg-muted p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-border transition-all hover:-translate-y-1 hover:shadow-md group">
                      <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                        <Linkedin className="w-6 h-6" />
                      </div>
                      <span className="text-sm sm:text-base font-semibold">LinkedIn</span>
                    </a>
                    <a href="https://github.com/sumit0593" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-2 sm:gap-3 bg-background hover:bg-muted p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-border transition-all hover:-translate-y-1 hover:shadow-md group">
                      <div className="w-12 h-12 rounded-full bg-foreground/10 flex items-center justify-center text-foreground group-hover:bg-foreground group-hover:text-background transition-colors">
                        <Github className="w-6 h-6" />
                      </div>
                      <span className="text-sm sm:text-base font-semibold">GitHub</span>
                    </a>
                  </div>
                </div>
              </motion.div>
            </SectionWrapper>
          </Container>
        </main>
      </div>

    </>
  );
}
