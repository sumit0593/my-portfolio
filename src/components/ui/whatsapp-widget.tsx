"use client";

import React from "react";
import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

export function WhatsAppWidget() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || process.env.WHATSAPP_NUMBER;
  if (!whatsappNumber) return null;

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Hi%20Sumit!%20I'm%20interested%20in%20discussing%20an%20AI%20%2F%20full-stack%20project.`;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
      className="fixed bottom-5 left-4 md:bottom-6 md:left-6 z-40 flex items-center group"
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp AI"
        className="relative flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-xl hover:shadow-emerald-500/30 hover:scale-110 active:scale-95 transition-all duration-300 group"
      >
        {/* Pulsating green ring */}
        <span className="absolute inset-0 rounded-full bg-emerald-500/40 animate-ping pointer-events-none" />

        {/* WhatsApp Icon */}
        <MessageCircle className="w-6 h-6 md:w-7 md:h-7 fill-white/20 relative z-10" />

        {/* Online Status Dot */}
        <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-green-400 border-2 border-background z-20" />
      </a>

      {/* Floating Tooltip Banner */}
      <div className="absolute left-16 px-3 py-1.5 rounded-xl bg-background/90 backdrop-blur-md border border-emerald-500/30 shadow-lg text-[11px] font-semibold text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
        WhatsApp AI Chat 🟢
      </div>
    </motion.div>
  );
}

export default WhatsAppWidget;
