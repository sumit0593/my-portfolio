"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useState, useEffect } from "react";
import { OrbitControls } from "@react-three/drei";
import { SkillsScene, SKILL_GROUPS } from "../3d/SkillsScene";
import { ArrowDown, ArrowUp } from "lucide-react";

export function SkillsSection() {
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);
  const [hoveredSkillsList, setHoveredSkillsList] = useState<string[]>([]);

  // Find skills list when category changes
  useEffect(() => {
    if (hoveredCategory) {
      if (hoveredCategory === "Skills Hub") {
        setHoveredSkillsList(["All core tech skills in the orbiting scene"]);
      } else {
        const group = SKILL_GROUPS.find(g => g.category === hoveredCategory);
        if (group) {
          setHoveredSkillsList(group.skills);
        }
      }
    } else {
      setHoveredSkillsList([]);
    }
  }, [hoveredCategory]);

  return (
    <section className="relative w-full h-screen bg-background py-10 flex flex-col justify-between items-center overflow-hidden border-t border-border select-none">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Scroll Area */}
      <div className="z-10 text-center relative w-full pt-6 pointer-events-auto">
         <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500 mb-2">
           Tech Orbit
         </h2>
         <p className="text-muted-foreground max-w-md mx-auto font-light text-sm px-4">
           Drag to rotate the universe. Hover nodes to see details.
           <br/> Color Rings scale from Core Stack to deployment & tools.
         </p>
         
         {/* Mobile swipe zone indicator */}
         <div className="md:hidden flex items-center justify-center gap-1.5 mt-4 text-[10px] text-muted-foreground/60 font-semibold tracking-wider animate-pulse uppercase">
           <ArrowDown className="w-3.5 h-3.5 text-emerald-400 animate-bounce" /> 
           Swipe here to scroll down 
           <ArrowDown className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
         </div>
      </div>

      {/* Interactive Main Area */}
      <div className="relative w-full flex-1 flex items-center justify-center z-0 px-4 md:px-12 my-4">
        
        {/* Floating Info Card (Displays on left for desktop, absolute bottom for mobile) */}
        <div 
          style={{ 
            borderColor: hoveredColor ? `${hoveredColor}40` : "rgba(255,255,255,0.05)",
            boxShadow: hoveredColor ? `0 0 30px ${hoveredColor}15` : "none",
            opacity: hoveredSkill ? 1 : 0,
            transform: hoveredSkill 
              ? "translateY(0) scale(1)" 
              : "translateY(10px) scale(0.95)",
            visibility: hoveredSkill ? "visible" : "hidden",
            pointerEvents: hoveredSkill ? "auto" : "none"
          }}
          className="absolute bottom-12 md:bottom-auto md:left-12 md:top-1/2 md:-translate-y-1/2 z-20 w-[90%] md:w-80 bg-card/65 backdrop-blur-xl border rounded-2xl p-5 transition-all duration-300 shadow-2xl"
        >
          {hoveredSkill && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span 
                  style={{ backgroundColor: hoveredColor || "var(--primary)" }} 
                  className="w-2.5 h-2.5 rounded-full animate-pulse" 
                />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  {hoveredCategory}
                </span>
              </div>
              
              <h3 
                style={{ color: hoveredColor || "var(--foreground)" }} 
                className="text-2xl font-bold tracking-tight"
              >
                {hoveredSkill}
              </h3>
              
              <div className="pt-3 border-t border-border/50">
                <h4 className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  {hoveredSkill === "Tech Core" ? "Description" : "Category Stack"}
                </h4>
                
                {hoveredSkill === "Tech Core" ? (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    This central core represents the foundational logic, architectural principles, and AI engineering framework driving my professional workspace.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {hoveredSkillsList.map((s) => (
                      <span 
                        key={s} 
                        style={{ 
                          borderColor: s === hoveredSkill ? hoveredColor || "var(--primary)" : "rgba(255,255,255,0.05)",
                          backgroundColor: s === hoveredSkill ? `${hoveredColor}15` : "rgba(255,255,255,0.02)",
                          color: s === hoveredSkill ? "#ffffff" : "rgba(255,255,255,0.6)"
                        }}
                        className="text-[9px] px-2 py-0.5 rounded-md border font-semibold transition-all"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 3D Canvas Container */}
        <div className="w-full h-[58vh] md:h-[70vh]">
          <Canvas camera={{ position: [0, 8, 25], fov: 45 }} dpr={[1, 2]}>
            <ambientLight intensity={0.4} />
            <pointLight position={[15, 15, 15]} intensity={1.5} color="#ffffff" />
            <pointLight position={[-15, -15, -15]} intensity={0.6} color="#818cf8" />
            <pointLight position={[0, -20, 0]} intensity={0.4} color="#f43f5e" />
            <Suspense fallback={null}>
               <OrbitControls 
                 enableZoom={false} 
                 enablePan={false} 
                 autoRotate 
                 autoRotateSpeed={0.5} 
                 maxPolarAngle={Math.PI / 2 + 0.2}
                 minPolarAngle={Math.PI / 4}
               />
               <SkillsScene 
                 onHoverSkill={setHoveredSkill}
                 onHoverCategory={setHoveredCategory}
                 onHoverColor={setHoveredColor}
               />
            </Suspense>
          </Canvas>
        </div>
      </div>

      {/* Bottom Scroll Area */}
      <div className="z-10 text-center relative w-full pb-6 pointer-events-auto">
         {/* Mobile swipe zone indicator */}
         <div className="md:hidden flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground/60 font-semibold tracking-wider animate-pulse uppercase">
           <ArrowUp className="w-3.5 h-3.5 text-emerald-400 animate-bounce" /> 
           Swipe here to scroll up 
           <ArrowUp className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
         </div>
      </div>
    </section>
  );
}
