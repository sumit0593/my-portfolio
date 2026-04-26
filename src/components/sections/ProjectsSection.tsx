"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { PresentationControls } from "@react-three/drei";
import { ProjectsScene } from "../3d/ProjectsScene";

export function ProjectsSection() {
  return (
    <section className="relative w-full min-h-screen bg-[#030014] py-24 flex flex-col items-center overflow-hidden">
      <div className="z-20 text-center mb-8 relative pointer-events-none">
        <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 backdrop-blur-md">
          <span className="text-sm font-medium text-indigo-300 tracking-wide">
            Portfolio Showcase
          </span>
        </div>
        <h2 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-4">
          Featured Work
        </h2>
        <p className="text-slate-400 max-w-lg mx-auto text-lg font-light">
          Drag horizontally to explore the 3D gallery. 
        </p>
      </div>

      <div className="relative w-full flex-1 cursor-grab active:cursor-grabbing z-10 min-h-[60vh]">
        <Canvas camera={{ position: [0, 0, 8], fov: 45 }} dpr={[1, 2]}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.5} />
            <PresentationControls 
              global 
              snap={true}
              rotation={[0, 0, 0]} 
              polar={[-0.1, 0.1]} 
              azimuth={[-Infinity, Infinity]}
            >
              <ProjectsScene />
            </PresentationControls>
          </Suspense>
        </Canvas>
          
        {/* Gradients to fade edges */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#030014] to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#030014] to-transparent pointer-events-none" />
      </div>
    </section>
  );
}
