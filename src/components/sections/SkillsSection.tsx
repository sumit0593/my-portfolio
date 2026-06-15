"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useState, useEffect, useCallback, useRef } from "react";
import { OrbitControls } from "@react-three/drei";
import { SkillsScene, SKILL_GROUPS } from "../3d/SkillsScene";
import { ArrowDown, ArrowUp, X } from "lucide-react";

import { cn } from "@/lib/utils";

export function SkillsSection() {
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);
  const [hoveredSkillsList, setHoveredSkillsList] = useState<string[]>([]);

  // Mobile tap state — locks the card open until dismissed
  const [tappedSkill, setTappedSkill] = useState<string | null>(null);
  const [tappedCategory, setTappedCategory] = useState<string | null>(null);
  const [tappedColor, setTappedColor] = useState<string | null>(null);

  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Detect touch device
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  // Track mouse position relative to the section container
  useEffect(() => {
    if (isTouchDevice) return;
    const handleMouseMove = (e: MouseEvent) => {
      if (!sectionRef.current || !cardRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const relativeY = e.clientY - rect.top;

      const cardW = 320;
      const cardH = 260;
      const offset = 20;
      const sectionW = rect.width;
      const sectionH = rect.height;

      let x = relativeX + offset;
      let y = relativeY + offset;

      if (x + cardW > sectionW - 16) x = relativeX - cardW - offset;
      if (y + cardH > sectionH - 16) y = relativeY - cardH - offset;
      if (x < 16) x = 16;
      if (y < 16) y = 16;

      cardRef.current.style.left = `${x}px`;
      cardRef.current.style.top = `${y}px`;
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isTouchDevice]);

  // Determine active display values
  const activeSkill = tappedSkill || hoveredSkill;
  const activeCategory = tappedCategory || hoveredCategory;
  const activeColor = tappedColor || hoveredColor;

  // Find skills list when active category changes
  useEffect(() => {
    if (activeCategory) {
      if (activeCategory === "Skills Hub") {
        setHoveredSkillsList(["All core tech skills in the orbiting scene"]);
      } else {
        const group = SKILL_GROUPS.find(g => g.category === activeCategory);
        if (group) {
          setHoveredSkillsList(group.skills);
        }
      }
    } else {
      setHoveredSkillsList([]);
    }
  }, [activeCategory]);

  // Handle click from the 3D scene — used for mobile tap-to-lock
  const handleSkillClick = useCallback((skill: string | null, category: string | null, color: string | null) => {
    if (!isTouchDevice) return;
    if (tappedSkill === skill) {
      setTappedSkill(null);
      setTappedCategory(null);
      setTappedColor(null);
    } else {
      setTappedSkill(skill);
      setTappedCategory(category);
      setTappedColor(color);
    }
  }, [isTouchDevice, tappedSkill]);

  const dismissMobileCard = useCallback(() => {
    setTappedSkill(null);
    setTappedCategory(null);
    setTappedColor(null);
  }, []);

  // Desktop positioning is handled directly via ref in mousemove event listener

  // Shared card content
  const renderCardContent = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span
          style={{ backgroundColor: activeColor || "var(--primary)" }}
          className="w-2.5 h-2.5 rounded-full animate-pulse"
        />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          {activeCategory}
        </span>
        {isTouchDevice && tappedSkill && (
          <button
            onClick={dismissMobileCard}
            className="ml-auto p-1 rounded-full hover:bg-muted transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        )}
      </div>

      <h3
        style={{ color: activeColor || "var(--foreground)" }}
        className="text-2xl font-bold tracking-tight"
      >
        {activeSkill}
      </h3>

      <div className="pt-3 border-t border-border/50">
        <h4 className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-2">
          {activeSkill === "Tech Core" ? "Description" : "Category Stack"}
        </h4>

        {activeSkill === "Tech Core" ? (
          <p className="text-xs text-muted-foreground leading-relaxed">
            This central core represents the foundational logic, architectural principles, and AI engineering framework driving my professional workspace.
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {hoveredSkillsList.map((s) => (
              <span
                key={s}
                style={{
                  borderColor: s === activeSkill ? activeColor || "var(--primary)" : undefined,
                  backgroundColor: s === activeSkill ? `${activeColor}20` : undefined,
                  color: s === activeSkill ? activeColor || "var(--primary)" : undefined,
                }}
                className={cn(
                  "text-[9px] px-2 py-0.5 rounded-md border font-semibold transition-all",
                  s === activeSkill
                    ? ""
                    : "border-border/50 bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted/80"
                )}
              >
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-screen bg-background py-10 flex flex-col justify-between items-center overflow-hidden border-t border-border select-none"
    >
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Scroll Area */}
      <div className="z-10 text-center relative w-full pt-6 pointer-events-auto">
         <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500 mb-2">
           Tech Orbit
         </h2>
         <p className="text-muted-foreground max-w-md mx-auto font-light text-sm px-4">
           {isTouchDevice
             ? "Tap a node to see details. Drag to rotate."
             : "Drag to rotate the universe. Hover nodes to see details."}
           <br/> Color Rings scale from Core Stack to deployment &amp; tools.
         </p>
         
         {/* Mobile swipe zone indicator */}
         <div className="md:hidden flex items-center justify-center gap-1.5 mt-4 text-[10px] text-muted-foreground/60 font-semibold tracking-wider animate-pulse uppercase">
           <ArrowDown className="w-3.5 h-3.5 text-emerald-400 animate-bounce" /> 
           Swipe here to scroll down 
           <ArrowDown className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
         </div>
      </div>

      {/* === DESKTOP: Floating card near cursor === */}
      {!isTouchDevice && (
        <div
          ref={cardRef}
          style={{
            borderColor: activeColor ? `${activeColor}40` : "rgba(255,255,255,0.05)",
            boxShadow: activeColor ? `0 0 30px ${activeColor}15` : "none",
            opacity: activeSkill ? 1 : 0,
            transform: activeSkill ? "scale(1)" : "scale(0.95)",
            visibility: activeSkill ? "visible" : "hidden",
          }}
          className="absolute z-20 w-80 bg-card/65 backdrop-blur-xl border rounded-2xl p-5 transition-all duration-200 shadow-2xl pointer-events-none"
        >
          {activeSkill && renderCardContent()}
        </div>
      )}

      {/* Interactive Main Area */}
      <div className="relative w-full flex-1 flex items-center justify-center z-0 px-4 md:px-12 my-4">
        
        {/* 3D Canvas Container */}
        <div className="relative w-full h-[58vh] md:h-[70vh]">
          <Canvas
            camera={{ position: [0, 8, 25], fov: 45 }}
            dpr={[1, 2]}
          >
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
                 onClickSkill={handleSkillClick}
               />
            </Suspense>
          </Canvas>
        </div>
      </div>

      {/* === MOBILE: Full-width bottom modal with backdrop === */}
      {isTouchDevice && tappedSkill && (
        <>
          {/* Backdrop — tap to dismiss */}
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={dismissMobileCard}
          />
          {/* Card */}
          <div
            style={{
              borderColor: activeColor ? `${activeColor}50` : "rgba(255,255,255,0.08)",
              boxShadow: activeColor
                ? `0 -8px 40px ${activeColor}20, 0 0 0 1px ${activeColor}15`
                : "0 -8px 40px rgba(0,0,0,0.3)",
            }}
            className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-lg bg-card/90 backdrop-blur-2xl border-t border-x rounded-t-3xl p-6 pb-8 shadow-2xl animate-in slide-in-from-bottom-6 duration-300"
          >
            {renderCardContent()}
          </div>
        </>
      )}

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
