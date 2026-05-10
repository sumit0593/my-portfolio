"use client";

import { motion } from "framer-motion";
import { Cpu, Server, Database, Boxes, LayoutTemplate, Workflow } from "lucide-react";

const ECOSYSTEM = [
  {
    category: "LLMs & GenAI",
    icon: Cpu,
    tools: ["OpenAI", "Gemini", "Claude", "Mistral", "Hugging Face"],
    color: "from-blue-500 to-indigo-500",
  },
  {
    category: "Frameworks & Agents",
    icon: Workflow,
    tools: ["LangChain", "LangGraph", "CrewAI", "AutoGen", "LlamaIndex"],
    color: "from-purple-500 to-pink-500",
  },
  {
    category: "Vector & Databases",
    icon: Database,
    tools: ["Pinecone", "ChromaDB", "FAISS", "PostgreSQL", "MongoDB"],
    color: "from-emerald-500 to-teal-500",
  },
  {
    category: "Cloud & DevOps",
    icon: Server,
    tools: ["AWS", "Docker", "Jenkins", "NGINX", "Vercel"],
    color: "from-orange-500 to-amber-500",
  },
  {
    category: "Backend & APIs",
    icon: Boxes,
    tools: ["Node.js", "Python", "FastAPI", "Spring Boot", "GraphQL"],
    color: "from-cyan-500 to-blue-500",
  },
  {
    category: "Frontend & UI",
    icon: LayoutTemplate,
    tools: ["Next.js", "React", "Angular", "Tailwind CSS", "Framer Motion"],
    color: "from-rose-500 to-red-500",
  },
];

export function AIToolsSection() {
  return (
    <section className="relative w-full py-24 bg-background overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">
            AI Tools & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Ecosystem</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            My technology stack, specializing in Generative AI, robust backends, and modern frontend architecture.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ECOSYSTEM.map((category, index) => (
            <motion.div
              key={category.category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="p-6 rounded-3xl glass border border-border/50 hover:border-indigo-500/30 transition-all duration-300 group"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${category.color} text-white shadow-lg`}>
                  <category.icon className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-foreground group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-500 transition-colors">
                  {category.category}
                </h3>
              </div>

              <div className="flex flex-wrap gap-2">
                {category.tools.map((tool) => (
                  <span
                    key={tool}
                    className="px-3 py-1.5 text-sm font-medium rounded-lg bg-card/50 border border-border/50 hover:bg-indigo-500/10 hover:border-indigo-500/30 hover:text-indigo-400 transition-all cursor-default"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
