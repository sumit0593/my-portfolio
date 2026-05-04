"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { HeroScene } from "../3d/HeroScene";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export function HeroSection() {
  const router = useRouter();

  return (
    <section className="relative w-full h-screen bg-background overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 2]}>
          <Suspense fallback={null}>
            <HeroScene />
          </Suspense>
        </Canvas>
      </div>

      {/* UI Overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full w-full pointer-events-none px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-center"
        >
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 backdrop-blur-md">
            <span className="text-sm font-medium text-indigo-300 tracking-wide">
              Welcome to the Next Dimension
            </span>
          </div>

          <h1 className="text-5xl md:text-8xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 mb-6 drop-shadow-[0_0_15px_rgba(79,70,229,0.5)] leading-tight">
            Architect
            {/* <br className="md:hidden" /> Architect */}
          </h1>

          <p className="text-lg md:text-2xl text-muted-foreground font-light mb-10 max-w-2xl mx-auto">
            Crafting immersive digital experiences where <span className="font-semibold text-foreground">code</span> meets <span className="font-semibold text-blue-400">imagination</span>.
          </p>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="pointer-events-auto flex items-center justify-center gap-4"
          >
            <button
              onClick={() => router.push("/login")}
              className="px-8 py-3 rounded-full bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-all shadow-[0_0_20px_-5px_rgba(79,70,229,0.5)] hover:shadow-[0_0_30px_rgba(79,70,229,0.8)] cursor-pointer"
            >
              Click me to Explore My Work
            </button>
            <button
              onClick={() => document.getElementById("contact-section")?.scrollIntoView({ behavior: "smooth" })}
              className="px-8 py-3 rounded-full bg-foreground/5 border border-foreground/10 backdrop-blur-md text-foreground font-medium hover:bg-foreground/10 hover:border-foreground/20 transition-all cursor-pointer"
            >
              Contact Me
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center z-10 pointer-events-none"
      >
        <span className="text-xs text-foreground/50 mb-2 tracking-widest uppercase">Scroll</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-indigo-500 to-transparent animate-pulse" />
      </motion.div>
    </section>
  );
}
