"use client";

import { useState } from "react";
import { StitchCard } from "@/components/stitch/stitch-card";
import { StitchBadge } from "@/components/stitch/stitch-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Send,
  CheckCircle2,
  Mail,
  Phone,
  Linkedin,
  Github,
  MessageSquare,
  Sparkles,
  Layers
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = [
  "GenAI & Multi-Agent Systems",
  "Enterprise RAG & Vector Database",
  "Full Stack Next.js SaaS Development",
  "Legacy Codebase Migration & Performance Optimization",
  "AI Tool Integration & API Architecture",
  "Other Custom Engineering Scope"
];

export function ClientConsultation() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: CATEGORIES[0],
    query: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.query) return;
    setSubmitted(true);
  };

  return (
    <div id="consultation-section" className="space-y-10 w-full pt-6">

      {/* Project Query Note & Category Card */}
      <StitchCard glowColor="indigo" className="p-6 sm:p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-6 text-center">

          {/* Header */}
          <div className="space-y-2">
            <StitchBadge variant="primary">
              <MessageSquare className="w-3.5 h-3.5 mr-1" /> Quick Project Inquiry
            </StitchBadge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Send a Project Query &amp; Scoping Note
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
              Select a project category and submit your query or requirement note for AI architecture, RAG pipelines, or full-stack web applications.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="query-submitted"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-8 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-4"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-foreground">Inquiry Received Successfully!</h3>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto">
                    Thank you <strong className="text-foreground">{formData.name}</strong>. Your note for <span className="text-primary font-semibold">{formData.category}</span> has been received. I will review it and respond to <strong className="text-foreground">{formData.email}</strong> within 24 hours.
                  </p>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: "", email: "", category: CATEGORIES[0], query: "" });
                  }}
                  className="rounded-full text-xs font-semibold"
                >
                  Send Another Inquiry
                </Button>
              </motion.div>
            ) : (
              <motion.form
                key="query-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleSubmit}
                className="space-y-4 text-left max-w-2xl mx-auto pt-2"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Your Name / Company</label>
                    <Input
                      required
                      placeholder="Jane Doe (Acme Corp)"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-background/60 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Email Address</label>
                    <Input
                      required
                      type="email"
                      placeholder="client@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-background/60 rounded-xl"
                    />
                  </div>
                </div>

                {/* Project Category Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-primary" /> Project Category / Scope
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-xl bg-background/60 border border-input text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-background text-foreground py-1">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Project Query / Requirement Note</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Write a brief note about your project requirements, tech stack preference, or timeline..."
                    value={formData.query}
                    onChange={(e) => setFormData({ ...formData, query: e.target.value })}
                    className="w-full p-3.5 rounded-xl bg-background/60 border border-input text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full py-5 rounded-2xl bg-gradient-to-r from-primary via-indigo-600 to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-bold text-sm shadow-lg gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Project Inquiry Note</span>
                </Button>
              </motion.form>
            )}
          </AnimatePresence>

        </div>
      </StitchCard>

      {/* Direct Contact Channels Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        <a
          href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || process.env.WHATSAPP_NUMBER || ""}?text=Hi%20Sumit!%20I'm%20interested%20in%20discussing%20a%20project.`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all hover:scale-105 group"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-sm">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div className="text-left overflow-hidden">
            <p className="text-xs font-bold text-emerald-400">WhatsApp AI</p>
            <p className="text-[10px] text-muted-foreground truncate">+91 7011676185</p>
          </div>
        </a>

        <a
          href="mailto:sumitsumitsumit163@gmail.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3.5 rounded-2xl bg-muted/30 hover:bg-muted border border-border/50 transition-all hover:scale-105 group"
        >
          <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors shrink-0">
            <Mail className="w-4 h-4" />
          </div>
          <div className="text-left overflow-hidden">
            <p className="text-xs font-bold text-foreground">Direct Email</p>
            <p className="text-[10px] text-muted-foreground truncate">sumitsumitsumit163@gmail.com</p>
          </div>
        </a>

        <a
          href="tel:7011676185"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3.5 rounded-2xl bg-muted/30 hover:bg-muted border border-border/50 transition-all hover:scale-105 group"
        >
          <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 group-hover:bg-green-500 group-hover:text-white transition-colors shrink-0">
            <Phone className="w-4 h-4" />
          </div>
          <div className="text-left overflow-hidden">
            <p className="text-xs font-bold text-foreground">Phone Call</p>
            <p className="text-[10px] text-muted-foreground truncate">+91 7011676185</p>
          </div>
        </a>

        <a
          href="https://www.linkedin.com/in/sumit-kumar0509/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3.5 rounded-2xl bg-muted/30 hover:bg-muted border border-border/50 transition-all hover:scale-105 group"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors shrink-0">
            <Linkedin className="w-4 h-4" />
          </div>
          <div className="text-left overflow-hidden">
            <p className="text-xs font-bold text-foreground">LinkedIn</p>
            <p className="text-[10px] text-muted-foreground truncate">sumit-kumar0509</p>
          </div>
        </a>

        <a
          href="https://github.com/sumit0593"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3.5 rounded-2xl bg-muted/30 hover:bg-muted border border-border/50 transition-all hover:scale-105 group"
        >
          <div className="w-9 h-9 rounded-xl bg-foreground/10 flex items-center justify-center text-foreground group-hover:bg-foreground group-hover:text-background transition-colors shrink-0">
            <Github className="w-4 h-4" />
          </div>
          <div className="text-left overflow-hidden">
            <p className="text-xs font-bold text-foreground">GitHub</p>
            <p className="text-[10px] text-muted-foreground truncate">sumit0593</p>
          </div>
        </a>
      </div>

    </div>
  );
}
