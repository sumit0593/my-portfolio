"use client";

import { motion } from "framer-motion";
import { Sparkles, Target, Zap, Activity } from "lucide-react";

export function AIResumeInsightsSection() {
  return (
    <section className="relative w-full py-24 bg-background overflow-hidden border-t border-border/50">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 backdrop-blur-md">
            <span className="text-sm font-medium text-indigo-300 tracking-wide flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" /> AI Resume Analysis
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">
            Career <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Insights</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            An AI-generated breakdown of my skills, expertise mapping, and ATS readiness.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Summary Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2 p-8 rounded-3xl glass shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold">Executive Summary</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed text-lg mb-6">
                A highly proficient Full Stack & GenAI Engineer with a strong focus on enterprise scalable architecture. Exhibits exceptional skills in integrating modern LLMs, developing robust RAG pipelines, and optimizing high-throughput systems. Consistent track record of delivering AI-driven solutions that automate workflows and enhance business intelligence.
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
              <div className="flex flex-col">
                <span className="text-3xl font-black text-foreground">95<span className="text-indigo-500">%</span></span>
                <span className="text-xs text-muted-foreground uppercase tracking-widest font-medium mt-1">ATS Score</span>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-black text-foreground">Top 5<span className="text-indigo-500">%</span></span>
                <span className="text-xs text-muted-foreground uppercase tracking-widest font-medium mt-1">AI Engineering</span>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-black text-foreground">10<span className="text-indigo-500">+</span></span>
                <span className="text-xs text-muted-foreground uppercase tracking-widest font-medium mt-1">Enterprise Apps</span>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-black text-foreground">Fast</span>
                <span className="text-xs text-muted-foreground uppercase tracking-widest font-medium mt-1">Delivery Rate</span>
              </div>
            </div>
          </motion.div>

          {/* Domain Expertise */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="p-8 rounded-3xl glass shadow-lg"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Domain Expertise</h3>
            </div>
            
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">Generative AI / RAG</span>
                  <span className="text-indigo-500 font-bold">95%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} whileInView={{ width: "95%" }} transition={{ duration: 1, delay: 0.5 }} className="h-full bg-gradient-to-r from-blue-400 to-indigo-500" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">Full Stack Architecture</span>
                  <span className="text-purple-500 font-bold">90%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} whileInView={{ width: "90%" }} transition={{ duration: 1, delay: 0.6 }} className="h-full bg-gradient-to-r from-purple-400 to-pink-500" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">Cloud & DevOps</span>
                  <span className="text-emerald-500 font-bold">85%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} whileInView={{ width: "85%" }} transition={{ duration: 1, delay: 0.7 }} className="h-full bg-gradient-to-r from-emerald-400 to-teal-500" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">System Scalability</span>
                  <span className="text-orange-500 font-bold">88%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} whileInView={{ width: "88%" }} transition={{ duration: 1, delay: 0.8 }} className="h-full bg-gradient-to-r from-orange-400 to-amber-500" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
