// app/dashboard/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Navbar from "../components/navbar";
import SectionWrapper from "../components/section-wrapper";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Github, Linkedin, Mail, Phone, ExternalLink } from "lucide-react";

export default function Dashboard() {
  const { data: session, status } = useSession();

  if (status === "loading") return <p>Loading...</p>;
  if (!session) redirect("/login");

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <main className="pt-20"> {/* push below navbar */}
          <Container className="space-y-16 text-center">
            <SectionWrapper id="home">
              <h1 className="text-4xl font-bold">Welcome to My World 🌍</h1>
            </SectionWrapper>

            <SectionWrapper id="about">
              <p className="max-w-xl mx-auto text-lg">
                Hi, I’m Sumit Kumar — a Full Stack + AI Developer passionate about
                building next-gen apps.
              </p>
            </SectionWrapper>

            <SectionWrapper id="skills">
              <div className="space-y-6 text-left">
                <h2 className="text-3xl font-bold tracking-tight border-b pb-2">Technical Skills</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-muted/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Generative AI & LLMs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground leading-relaxed">RAG Pipelines, Prompt Engineering (Zero-shot/Few-shot/CoT), LLM Fine-Tuning, Transformers.</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Agentic Frameworks</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground leading-relaxed">Multi-Agent Systems (MAS), LangChain, LlamaIndex, CrewAI, AutoGen, ReAct Agents.</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Full Stack Core</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground leading-relaxed">React.js, Next.js, Python, TypeScript, JavaScript, Node.js, Express.js, Tailwind CSS, MUI.</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Databases & DevOps</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground leading-relaxed">Vector Databases (Pinecone, ChromaDB, FAISS), MySQL, PostgreSQL, MongoDB, Docker, AWS, Jenkins, CI/CD.</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </SectionWrapper>

            <SectionWrapper id="experience">
              <div className="space-y-6 text-left">
                <h2 className="text-3xl font-bold tracking-tight border-b pb-2">Experience</h2>
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-background bg-primary text-primary-foreground shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                      <svg className="fill-current w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM10 4h4v2h-4V4zm10 16H4V8h16v12z" /></svg>
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-border bg-card shadow-sm">
                      <div className="flex flex-col md:flex-row justify-between mb-2">
                        <h3 className="font-bold text-lg">Software Engineer</h3>
                        <time className="text-sm text-muted-foreground">Apr 2024 — Present</time>
                      </div>
                      <p className="text-primary font-medium mb-3">Kent RO Systems Pvt Ltd</p>
                      <ul className="text-sm text-card-foreground space-y-2 list-disc pl-4 marker:text-primary/50">
                        <li>Integrated OCR-based invoice parsing to automate data extraction.</li>
                        <li>Implemented server load balancing using NGINX for high availability.</li>
                        <li>Built Zoho Analytics dashboards and JWT/OAuth2 RBAC authentication.</li>
                      </ul>
                    </div>
                  </div>

                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-background bg-muted text-foreground shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                      <svg className="fill-current w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM10 4h4v2h-4V4zm10 16H4V8h16v12z" /></svg>
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-border bg-card shadow-sm opacity-80 hover:opacity-100 transition-opacity">
                      <div className="flex flex-col md:flex-row justify-between mb-2">
                        <h3 className="font-bold text-lg">Associate Software Developer</h3>
                        <time className="text-sm text-muted-foreground">Aug 2023 — Mar 2024</time>
                      </div>
                      <p className="text-primary font-medium mb-3">TechnoIdentity</p>
                      <ul className="text-sm text-card-foreground space-y-2 list-disc pl-4 marker:text-primary/50">
                        <li>Revamped the HRMS platform using Next.js and TypeScript.</li>
                        <li>Developed scalable UI components for the Hectare platform.</li>
                        <li>Automated tests using Cypress and Playwright.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </SectionWrapper>

            <SectionWrapper id="projects">
              <div className="space-y-6 text-left">
                <h2 className="text-3xl font-bold tracking-tight border-b pb-2">Projects</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="flex flex-col hover:border-primary/50 transition-colors">
                    <CardHeader>
                      <CardTitle className="flex justify-between items-start">
                        <span>Kent Risengine</span>
                        <Badge variant="secondary">Internal</Badge>
                      </CardTitle>
                      <CardDescription>AI-based Automation Platform</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <p className="text-sm text-muted-foreground mb-4">
                        Built an AI-based invoice parser in RiseEngine to automate data extraction. Created React/Node.js validation layers and Zoho Analytics integration.
                      </p>
                      <div className="flex flex-wrap gap-2 mt-auto">
                        <Badge variant="outline" className="text-xs">React</Badge>
                        <Badge variant="outline" className="text-xs">Node.js</Badge>
                        <Badge variant="outline" className="text-xs">Zoho</Badge>
                        <Badge variant="outline" className="text-xs">AI</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="flex flex-col hover:border-primary/50 transition-colors">
                    <CardHeader>
                      <CardTitle className="flex justify-between items-start">
                        <span>Cam Attendance</span>
                        <Badge variant="secondary">Client</Badge>
                      </CardTitle>
                      <CardDescription>Enterprise HR Tracking</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <p className="text-sm text-muted-foreground mb-4">
                        Maintained full-stack attendance platform for thousands of employees. Managed Spring Boot microservices and Angular frontend.
                      </p>
                      <div className="flex flex-wrap gap-2 mt-auto">
                        <Badge variant="outline" className="text-xs">Spring Boot</Badge>
                        <Badge variant="outline" className="text-xs">Angular</Badge>
                        <Badge variant="outline" className="text-xs">REST APIs</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="flex flex-col hover:border-primary/50 transition-colors">
                    <CardHeader>
                      <CardTitle className="flex justify-between items-start">
                        <span>TIOS Revamp</span>
                        <Badge variant="secondary">Internal</Badge>
                      </CardTitle>
                      <CardDescription>Modern HRMS Migration</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <p className="text-sm text-muted-foreground mb-4">
                        Migrated a legacy HRMS to a modern modular architecture using Next.js. Improved performance, maintainability, and UX.
                      </p>
                      <div className="flex flex-wrap gap-2 mt-auto">
                        <Badge variant="outline" className="text-xs">Next.js</Badge>
                        <Badge variant="outline" className="text-xs">TypeScript</Badge>
                        <Badge variant="outline" className="text-xs">Modular UI</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </SectionWrapper>

            <SectionWrapper id="contact">
              <div className="bg-muted/30 rounded-3xl p-8 md:p-12 mb-12">
                <h2 className="text-3xl font-bold tracking-tight mb-4">Let's Connect</h2>
                <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                  I'm always open to discussing new projects, creative ideas or opportunities to be part of your visions.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <a href="mailto:sumitsumitsumit163@gmail.com" className="flex items-center gap-2 bg-background border border-border hover:bg-muted px-4 py-2 rounded-full transition-colors">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm font-medium">Email</span>
                  </a>
                  <a href="tel:7011676185" className="flex items-center gap-2 bg-background border border-border hover:bg-muted px-4 py-2 rounded-full transition-colors">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm font-medium">7011676185</span>
                  </a>
                  <a href="#" className="flex items-center gap-2 bg-background border border-border hover:bg-muted px-4 py-2 rounded-full transition-colors text-blue-500">
                    <Linkedin className="w-4 h-4" />
                    <span className="text-sm font-medium text-foreground">LinkedIn</span>
                  </a>
                  <a href="#" className="flex items-center gap-2 bg-background border border-border hover:bg-muted px-4 py-2 rounded-full transition-colors">
                    <Github className="w-4 h-4" />
                    <span className="text-sm font-medium">GitHub</span>
                  </a>
                </div>
              </div>
            </SectionWrapper>
          </Container>
        </main>
      </div>
    </>
  );
}




