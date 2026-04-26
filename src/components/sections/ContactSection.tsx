"use client";

import { useState } from "react";
import { Terminal, Send, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export function ContactSection() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !message) return;
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setEmail("");
      setMessage("");
    }, 3000);
  };

  return (
    <section className="relative w-full bg-[#02000a] py-32 px-4 flex flex-col items-center border-t border-white/5">
      <div className="z-10 text-center mb-16 relative pointer-events-none">
         <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400 mb-4">
           Initiate Contact
         </h2>
         <p className="text-slate-400 max-w-md mx-auto font-light">
           Ping me on the terminal or use the AI Assistant in the bottom right corner.
         </p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-2xl bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p- p-2 shadow-[0_0_50px_rgba(79,70,229,0.15)] relative overflow-hidden"
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
            <span>guest@portfolio:~</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 pt-2 font-mono flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-emerald-400 text-sm flex gap-2">
              <span className="text-purple-400">root@portfolio</span>:<span className="text-blue-400">~</span>$ prompt email
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
              <span className="text-purple-400">root@portfolio</span>:<span className="text-blue-400">~</span>$ prompt message
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

          <div className="pt-4 flex items-center justify-between border-t border-white/5">
            <span className="text-slate-500 text-xs text-blink">
              {'>'} Ready to send...
            </span>
            
            <button 
              type="submit" 
              disabled={sent}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-emerald-400 px-6 py-2 rounded-md transition-colors text-sm font-semibold border border-white/10"
            >
              {sent ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Transmitted
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
