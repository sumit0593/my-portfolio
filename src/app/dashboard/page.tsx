// app/dashboard/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Navbar from "../components/navbar";
import SectionWrapper from "../components/section-wrapper";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Github, Linkedin, Mail, Phone, ExternalLink, Award, Trophy } from "lucide-react";

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
              <h1 className="text-4xl font-bold">Hi, I’m Sumit Kumar — a GenAI & Multi-Agent Engineer | Full Stack Engineer</h1>
            </SectionWrapper>

            <SectionWrapper id="about">
              <p className="max-w-xl mx-auto text-lg">
                Forward-thinking Generative AI & Full Stack Engineer with strong expertise in building scalable Multi-Agent Systems and RAG architectures. Currently specializing in the IIT Mandi GenAI curriculum, focusing on LLM orchestration, fine-tuning and agentic workflows using LangChain and CrewAI. Proven track record of integrating AI-driven automation into enterprise web applications (MERN/Next.js) to optimize performance and decision-making.
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

            <SectionWrapper id="gallery">
              <div className="space-y-10 text-left">
                <div className="border-b pb-2">
                  <h2 className="text-3xl font-bold tracking-tight">Gallery & Achievements</h2>
                  <p className="text-muted-foreground mt-2">Certifications, Competitions & Continuous Learning</p>
                </div>

                <div className="space-y-8">
                  {/* Certifications Section */}
                  <div>
                    <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                      <Award className="w-6 h-6 text-primary" /> Certifications
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                      <Card className="flex flex-col group hover:border-primary/50 transition-all hover:shadow-md hover:-translate-y-1 overflow-hidden">
                        <div className="relative h-64 bg-muted/30 border-b flex items-center justify-center overflow-hidden">
                          {/* Display PDF as preview */}
                          <div className="absolute inset-0 bg-background/5 transition-colors z-10 group-hover:bg-transparent" />
                          <iframe
                            src="/gallery/certification/certificate_llm.pdf#toolbar=0&navpanes=0&scrollbar=0&view=FitH"
                            className="w-full h-[150%] -mt-10 pointer-events-none opacity-90 group-hover:opacity-100 transition-opacity"
                            title="Certificate PDF"
                          />
                        </div>
                        <div className="flex flex-col p-6 flex-1">
                          <CardHeader className="p-0 mb-4">
                            <CardTitle className="text-xl">PG Certification in Gen AI and MAS</CardTitle>
                            <CardDescription className="text-primary font-medium mt-1">IIT Mandi - TIH (Dec 2025 - Present)</CardDescription>
                          </CardHeader>
                          <CardContent className="p-0 flex-1">
                            <ul className="text-sm text-card-foreground space-y-2 list-disc pl-4 marker:text-primary/50 mb-6">
                              <li><strong>Core Curriculum:</strong> Mastered advanced Prompt Engineering, NLP fundamentals, and Retrieval-Augmented Generation (RAG) pipelines using Vector Databases.</li>
                              <li><strong>Agentic AI & Fine-Tuning:</strong> Architected autonomous Multi-Agent Systems (MAS) using LangChain, CrewAI, AutoGen, LlamaIndex and fine-tuned LLMs.</li>
                              <li><strong>Deployment:</strong> Applied Deep Learning foundations and Transformer architectures to build and deploy scalable GenAI models via FastAPI.</li>
                            </ul>
                          </CardContent>
                          <div className="mt-auto">
                            <a href="/gallery/certification/certificate_llm.pdf" target="_blank" rel="noreferrer" className="inline-flex items-center text-sm font-medium text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:underline gap-1 relative z-20">
                              <ExternalLink className="w-4 h-4" /> View Full Certificate
                            </a>
                          </div>
                        </div>
                      </Card>

                      {/* Newton School */}
                      <Card className="flex flex-col group hover:border-primary/50 transition-all hover:shadow-md hover:-translate-y-1 overflow-hidden">
                        <div className="relative h-64 bg-muted/20 border-b flex items-center justify-center">
                          <Award className="w-24 h-24 text-muted-foreground/30 group-hover:text-primary/50 transition-colors group-hover:scale-110 duration-500" />
                        </div>
                        <div className="flex flex-col p-6 flex-1">
                          <CardHeader className="p-0 mb-4">
                            <CardTitle className="text-xl">Full Stack Web Developer</CardTitle>
                            <CardDescription className="text-primary font-medium mt-1">Newton School (May 2022 - Mar 2023)</CardDescription>
                          </CardHeader>
                          <CardContent className="p-0 flex-1">
                            <ul className="text-sm text-card-foreground space-y-2 list-disc pl-4 marker:text-primary/50 mb-6">
                              <li>Trained in modern full-stack web technologies with a strong focus on building AI-powered web applications.</li>
                              <li>Gained hands-on experience with HTML, CSS, JavaScript, React, Next.js, Node.js, Express.js, MongoDB, and Git.</li>
                              <li>Actively participated in DSA coding contests, improving problem-solving and algorithmic thinking.</li>
                              <li>Collaborated on group projects and real-world development challenges.</li>
                            </ul>
                          </CardContent>
                        </div>
                      </Card>

                    </div>
                  </div>

                  {/* Competitions Section */}
                  <div>
                    <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                      <Trophy className="w-6 h-6 text-primary" /> Competitions
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <Card className="flex flex-col hover:border-primary/50 transition-all hover:shadow-md hover:-translate-y-1 group bg-gradient-to-br from-card to-muted/20">
                        <CardHeader>
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                            <Trophy className="w-5 h-5 text-primary" />
                          </div>
                          <CardTitle>Newton School Coding Contests</CardTitle>
                          <CardDescription className="mt-1">Competitive Programming</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                          <p className="text-sm text-muted-foreground">
                            Regularly participated in Data Structures and Algorithms contests, demonstrating strong problem-solving skills and algorithmic thinking among a large pool of developers.
                          </p>
                        </CardContent>
                      </Card>

                      {/* Placeholder for future competitions */}
                      <Card className="flex flex-col hover:border-primary/50 transition-all hover:shadow-md hover:-translate-y-1 group border-dashed bg-transparent shadow-none hover:bg-muted/10 justify-center items-center text-center p-6 h-full min-h-[200px]">
                        <Trophy className="w-8 h-8 opacity-50 mb-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        <CardTitle className="text-lg text-muted-foreground group-hover:text-foreground">More Competitions Ahead</CardTitle>
                      </Card>
                    </div>
                  </div>
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
                  <a href="mailto:sumitsumitsumit163@gmail.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-background border border-border hover:bg-muted px-4 py-2 rounded-full transition-colors">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm font-medium">Email</span>
                  </a>
                  <a href="tel:7011676185" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-background border border-border hover:bg-muted px-4 py-2 rounded-full transition-colors">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm font-medium">7011676185</span>
                  </a>
                  <a href="https://www.linkedin.com/in/sumit-kumar0509/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-background border border-border hover:bg-muted px-4 py-2 rounded-full transition-colors text-blue-500">
                    <Linkedin className="w-4 h-4" />
                    <span className="text-sm font-medium text-foreground">LinkedIn</span>
                  </a>
                  <a href="https://github.com/sumit0593" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-background border border-border hover:bg-muted px-4 py-2 rounded-full transition-colors">
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
