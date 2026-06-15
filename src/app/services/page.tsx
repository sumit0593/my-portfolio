"use client";

import Link from "next/link";
import { Bot, Code, ArrowRight, Workflow, Globe, ShieldCheck } from "lucide-react";
import Navbar from "@/app/components/navbar";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const services = [
  {
    category: "AI & GenAI Solutions",
    icon: Bot,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    items: [
      {
        title: "Multi-Agent Systems",
        description: "Autonomous AI agents collaborating to solve complex enterprise workflows.",
        tech: ["CrewAI", "LangChain", "Python"],
        delivery: "2-4 Weeks"
      },
      {
        title: "RAG Pipelines",
        description: "Chat with your enterprise data securely using Vector Databases and LLMs.",
        tech: ["Pinecone", "LlamaIndex", "FastAPI"],
        delivery: "1-3 Weeks"
      },
      {
        title: "LLM Fine-Tuning",
        description: "Custom-trained AI models adapted specifically for your domain and brand voice.",
        tech: ["Transformers", "HuggingFace", "PyTorch"],
        delivery: "3-6 Weeks"
      }
    ]
  },
  {
    category: "Full Stack Development",
    icon: Code,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    items: [
      {
        title: "Enterprise SaaS Platforms",
        description: "Scalable, secure, and modern web applications built from scratch.",
        tech: ["Next.js", "React", "Node.js"],
        delivery: "4-8 Weeks"
      },
      {
        title: "Legacy Migration",
        description: "Modernize monolithic architectures into microservices or serverless apps.",
        tech: ["Spring Boot", "TypeScript", "Docker"],
        delivery: "Custom"
      },
      {
        title: "API Development",
        description: "High-performance REST & GraphQL APIs with robust authentication (OAuth2/JWT).",
        tech: ["Express", "FastAPI", "PostgreSQL"],
        delivery: "1-3 Weeks"
      }
    ]
  }
];

export default function ServicesPage() {
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
      <div className="min-h-screen bg-background pt-24 pb-16 overflow-hidden relative">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

        <Container>
          {/* Hero Section */}
          <div className="text-center mb-20 max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6"
            >
              <SparklesIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Available for Freelance & Contract</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold tracking-tight mb-6"
            >
              Engineering <span className="text-gradient">Services</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground leading-relaxed"
            >
              From intelligent Multi-Agent Systems to highly scalable enterprise web applications.
              {"Let's build software that drives real business value."}
            </motion.p>
          </div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-24 border-y border-border/50 py-8"
          >
            <div className="flex flex-col items-center justify-center text-center gap-2">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-foreground mb-2">
                <Globe className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-xl">4+ Years</h4>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Experience</p>
            </div>
            <div className="flex flex-col items-center justify-center text-center gap-2">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-foreground mb-2">
                <LayerIcon className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-xl">10+ Apps</h4>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Enterprise Scale</p>
            </div>
            <div className="flex flex-col items-center justify-center text-center gap-2">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-foreground mb-2">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-xl">IIT Mandi</h4>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">GenAI Certified</p>
            </div>
            <div className="flex flex-col items-center justify-center text-center gap-2">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-foreground mb-2">
                <Workflow className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-xl">End-to-End</h4>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Delivery</p>
            </div>
          </motion.div>

          {/* Services Grid */}
          <div className="space-y-24">
            {services.map((category, idx) => (
              <div key={idx}>
                <div className="flex items-center gap-4 mb-8">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${category.bg} ${category.color}`}>
                    <category.icon className="w-6 h-6" />
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight">{category.category}</h2>
                </div>

                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-100px" }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {category.items.map((item, itemIdx) => (
                    <motion.div key={itemIdx} variants={itemVariants} className="h-full">
                      <Card className="flex flex-col h-full hover:border-primary/50 transition-all hover:shadow-lg hover:-translate-y-1 group bg-card/50 glass overflow-hidden">
                        <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardHeader>
                          <CardTitle className="text-xl group-hover:text-primary transition-colors">{item.title}</CardTitle>
                          <CardDescription className="text-sm font-medium mt-2">Typical Timeline: {item.delivery}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                          <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                            {item.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {item.tech.map((t, i) => (
                              <Badge key={i} variant="outline" className="bg-background/50">{t}</Badge>
                            ))}
                          </div>
                        </CardContent>
                        <CardFooter className="pt-4 border-t border-border/50">
                          <Button className="w-full group/btn" asChild>
                            <Link href="/dashboard#contact">
                              Discuss Requirements <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                            </Link>
                          </Button>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            ))}
          </div>

          {/* Final CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-32 bg-primary/10 rounded-3xl p-12 text-center border border-primary/20 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-500/10 pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Have a custom requirement?</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                {"Every enterprise is unique. Whether you need a team augmentation or a specialized architectural review, I'm here to help."}
              </p>
              <Button size="lg" className="bg-primary text-primary-foreground text-lg px-8 py-6 rounded-xl hover:scale-105 transition-transform shadow-xl shadow-primary/20" asChild>
                <Link href="/dashboard#contact">Book a Free Consultation</Link>
              </Button>
            </div>
          </motion.div>

        </Container>
      </div>
    </>
  );
}

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}

function LayerIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 12 12 17 22 12" />
      <polyline points="2 17 12 22 22 17" />
    </svg>
  );
}
