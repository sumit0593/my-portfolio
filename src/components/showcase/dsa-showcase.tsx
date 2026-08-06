"use client";

import { useState } from "react";
import { StitchCard } from "@/components/stitch/stitch-card";
import { StitchBadge } from "@/components/stitch/stitch-badge";
import { CardTitle, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Eye, ExternalLink, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LeetCodeIcon = ({ className }: { className?: string }) => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className={className}>
    <title>LeetCode</title>
    <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.19c-.452-.443-.695-1.024-.695-1.666 0-.642.243-1.223.696-1.667l3.871-4.144c.558-.596 1.48-.596 2.038 0l6.477 6.57a1.378 1.378 0 0 0 1.95-.003c.54-.54.54-1.414.003-1.955l-6.477-6.57a4.137 4.137 0 0 0-5.918-.01L4.3 12.082l-.012-.013c-.02-.02-.047-.042-.068-.066l3.872-4.144c.2-.213.488-.336.792-.336H19.54c.732 0 1.328-.596 1.328-1.328v-3.76c0-.733-.596-1.328-1.328-1.328h-6.057z" />
  </svg>
);

export function DsaShowcase() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <div className="space-y-8 w-full">
      {/* LeetCode Profile Card */}
      <StitchCard glowColor="orange" className="p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row items-stretch gap-8">
          <div className="flex-1 flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/5 flex items-center justify-center text-orange-500 border border-orange-500/25 group-hover:scale-105 transition-all duration-300 shadow-xl shrink-0">
              <LeetCodeIcon className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
            <div className="space-y-4 text-center md:text-left w-full">
              <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-2 flex-wrap">
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">LeetCode Profile</h3>
                <StitchBadge variant="orange">Active Coder</StitchBadge>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl">
                Solving algorithmic problems, mastering Data Structures &amp; Algorithms, and optimizing solutions for enterprise-grade performance.
              </p>
              <div className="space-y-2 max-w-md mx-auto md:mx-0">
                <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                  <span>Problem Solving Balance</span>
                  <span>Easy / Med / Hard</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden flex border border-border/30 shadow-inner">
                  <div className="h-full bg-green-500 w-[45%]" title="Easy: 45%" />
                  <div className="h-full bg-orange-500 w-[45%]" title="Medium: 45%" />
                  <div className="h-full bg-red-500 w-[10%]" title="Hard: 10%" />
                </div>
                <div className="flex justify-start gap-4 text-[10px] text-muted-foreground font-medium">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block shadow-sm" /> Easy</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block shadow-sm" /> Medium</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block shadow-sm" /> Hard</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center items-center lg:border-l border-border/40 lg:pl-8 pt-4 lg:pt-0 shrink-0">
            <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white font-semibold flex items-center gap-2 group-hover:scale-105 transition-transform duration-300 shadow-lg">
              <a href="https://leetcode.com/u/sumitsumitsumit163/" target="_blank" rel="noopener noreferrer">
                View LeetCode Profile
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </div>
      </StitchCard>

      {/* Competition Scorecards */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center gap-2 border-b border-border/50 pb-3">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h3 className="text-xl font-bold text-foreground">Competition Scorecards &amp; Certificates</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StitchCard glowColor="purple" className="flex flex-col">
            <div className="absolute top-2 left-2 z-20 flex gap-2">
              <StitchBadge variant="outline">Newton School</StitchBadge>
              <StitchBadge variant="purple">DSA Competition</StitchBadge>
            </div>
            <div className="relative aspect-[1.41] w-full overflow-hidden bg-muted/20 border-b border-border/40 flex items-center justify-center min-h-[200px]">
              <img src="/gallery/scorecard/scorecard_newton_1.jpg" alt="Newton School Scorecard 1" className="absolute inset-0 w-full h-full object-contain bg-muted/30 group-hover:scale-[1.03] transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[3px] z-10">
                <Button onClick={() => setSelectedImage("/gallery/scorecard/scorecard_newton_1.jpg")} variant="secondary" className="gap-2 font-semibold shadow-lg">
                  <Eye className="w-4 h-4" /> View Full Image
                </Button>
              </div>
            </div>
            <CardHeader className="p-4 flex-1 relative z-20 bg-card/10">
              <CardTitle className="text-sm sm:text-base font-bold tracking-tight">Newton School DSA Competition Scorecard #1</CardTitle>
            </CardHeader>
          </StitchCard>

          <StitchCard glowColor="purple" className="flex flex-col">
            <div className="absolute top-2 left-2 z-20 flex gap-2">
              <StitchBadge variant="outline">Newton School</StitchBadge>
              <StitchBadge variant="purple">DSA Competition</StitchBadge>
            </div>
            <div className="relative aspect-[1.41] w-full overflow-hidden bg-muted/20 border-b border-border/40 flex items-center justify-center min-h-[200px]">
              <img src="/gallery/scorecard/scorecard_newton_2.jpg" alt="Newton School Scorecard 2" className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[3px] z-10">
                <Button onClick={() => setSelectedImage("/gallery/scorecard/scorecard_newton_2.jpg")} variant="secondary" className="gap-2 font-semibold shadow-lg">
                  <Eye className="w-4 h-4" /> View Full Image
                </Button>
              </div>
            </div>
            <CardHeader className="p-4 flex-1 relative z-20 bg-card/10">
              <CardTitle className="text-sm sm:text-base font-bold tracking-tight">Newton School DSA Competition Scorecard #2</CardTitle>
            </CardHeader>
          </StitchCard>

          <StitchCard glowColor="emerald" className="flex flex-col">
            <div className="absolute top-2 left-2 z-20 flex gap-2">
              <StitchBadge variant="outline">Google</StitchBadge>
              <StitchBadge variant="emerald">Vibe2Ship</StitchBadge>
            </div>
            <div className="relative aspect-[1.41] w-full overflow-hidden bg-muted/20 border-b border-border/40 flex items-center justify-center min-h-[200px] cursor-pointer" onClick={() => setSelectedImage("/gallery/scorecard/Vibe2ShipCert_Sumit_Kumar.pdf")}>
              <iframe src="/gallery/scorecard/Vibe2ShipCert_Sumit_Kumar.pdf#toolbar=0" className="w-full h-full border-0 pointer-events-none" title="Vibe2Ship Certificate" />
              <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[3px] z-10">
                <Button variant="secondary" className="gap-2 font-semibold shadow-lg">
                  <Eye className="w-4 h-4" /> View Certificate
                </Button>
              </div>
            </div>
            <CardHeader className="p-4 flex-1 relative z-20 bg-card/10">
              <CardTitle className="text-sm sm:text-base font-bold tracking-tight">Google Vibe2Ship Hackathon Certificate</CardTitle>
            </CardHeader>
          </StitchCard>
        </div>
      </div>

      {/* Modal Zoom Preview */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl max-h-[85vh] w-full flex items-center justify-center rounded-2xl overflow-hidden bg-card/40 border border-border/50 shadow-2xl cursor-default"
            >
              {selectedImage.toLowerCase().endsWith(".pdf") ? (
                <iframe
                  src={`${selectedImage}#toolbar=0`}
                  className="w-full h-[80vh] rounded-2xl border-0 bg-background"
                  title="Scorecard PDF Preview"
                />
              ) : (
                <img
                  src={selectedImage}
                  alt="Enlarged preview"
                  className="w-full h-auto max-h-[80vh] object-contain"
                />
              )}
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white rounded-full p-2.5 transition-colors border border-white/10"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
