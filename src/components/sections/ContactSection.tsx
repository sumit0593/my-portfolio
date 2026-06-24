"use client";

import { useState, useEffect } from "react";
import { Terminal, Send, CheckCircle2, Loader2, AlertCircle, Mail, Phone, Linkedin, Github } from "lucide-react";
import { motion } from "framer-motion";

export function ContactSection() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [host, setHost] = useState("sumit-portfolio");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      if (hostname && hostname !== "localhost" && hostname !== "127.0.0.1") {
        setHost(hostname);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !message) return;

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, message }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send message.");
      }

      setSent(true);
      setTimeout(() => {
        setSent(false);
        setEmail("");
        setMessage("");
      }, 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="contact-section" className="relative w-full bg-background py-32 px-4 flex flex-col items-center border-t border-border">
      <div className="z-10 text-center mb-16 relative pointer-events-none">
        <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400 mb-4">
          Initiate Contact
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto font-light">
          Ping me on the terminal or use the AI Assistant in the bottom right corner for help.
        </p>
      </div>

      {/* Direct Contact Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl mb-12 px-2"
      >
        <a
          href="mailto:sumitsumitsumit163@gmail.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 bg-card/40 backdrop-blur-md hover:bg-muted p-4 rounded-xl border border-border/50 transition-all hover:-translate-y-1 hover:shadow-md group"
        >
          <Mail className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform shrink-0" />
          <span className="text-sm font-semibold text-foreground/90">Email</span>
        </a>

        <a
          href="tel:7011676185"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 bg-card/40 backdrop-blur-md hover:bg-muted p-4 rounded-xl border border-border/50 transition-all hover:-translate-y-1 hover:shadow-md group"
        >
          <Phone className="w-5 h-5 text-green-500 group-hover:scale-110 transition-transform shrink-0" />
          <span className="text-sm font-semibold text-foreground/90">Call</span>
        </a>

        <a
          href="https://www.linkedin.com/in/sumit-kumar0509/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 bg-card/40 backdrop-blur-md hover:bg-muted p-4 rounded-xl border border-border/50 transition-all hover:-translate-y-1 hover:shadow-md group"
        >
          <Linkedin className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform shrink-0" />
          <span className="text-sm font-semibold text-foreground/90">LinkedIn</span>
        </a>

        <a
          href="https://github.com/sumit0593"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 bg-card/40 backdrop-blur-md hover:bg-muted p-4 rounded-xl border border-border/50 transition-all hover:-translate-y-1 hover:shadow-md group"
        >
          <Github className="w-5 h-5 text-foreground group-hover:scale-110 transition-transform shrink-0" />
          <span className="text-sm font-semibold text-foreground/90">GitHub</span>
        </a>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-2xl bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-[0_0_50px_rgba(79,70,229,0.15)] relative overflow-hidden"
      >
        {/* Terminal Header */}
        <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/10 rounded-t-xl mb-4">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="flex-1 text-center flex items-center justify-center gap-2 text-slate-400 text-xs font-mono">
            <Terminal className="w-3 h-3" />
            <span>visitor@{host}:~</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 pt-2 font-mono flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-emerald-400 text-sm flex gap-2">
              <span className="text-purple-400">visitor@{host}</span>:<span className="text-blue-400">~</span>$ prompt email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email..."
              className="bg-transparent border-none outline-none text-slate-300 placeholder:text-slate-600 focus:ring-0 w-full"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-emerald-400 text-sm flex gap-2">
              <span className="text-purple-400">visitor@{host}</span>:<span className="text-blue-400">~</span>$ prompt message
            </label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              className="bg-transparent border-none outline-none text-slate-300 placeholder:text-slate-600 focus:ring-0 w-full resize-none"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-xs font-mono">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-4 flex items-center justify-between border-t border-white/5">
            <span className="text-slate-500 text-xs text-blink">
              {'>'} {isLoading ? 'Sending...' : sent ? 'Message sent!' : 'Ready to send...'}
            </span>

            <button
              type="submit"
              disabled={sent || isLoading}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-emerald-400 px-6 py-2 rounded-md transition-colors text-sm font-semibold border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {sent ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Transmitted
                </>
              ) : isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Execute
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </section>
  );
}
