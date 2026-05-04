"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { OrbitControls } from "@react-three/drei";
import { SkillsScene } from "../3d/SkillsScene";

export function SkillsSection() {
  return (
    <section className="relative w-full h-screen bg-background py-20 flex flex-col items-center overflow-hidden border-t border-border">
      <div className="z-10 text-center relative pointer-events-none mb-8">
         <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500 mb-2">
           Tech Orbit
         </h2>
         <p className="text-muted-foreground max-w-md mx-auto font-light">
           Drag to rotate the universe. Hover nodes to see details.
           <br/> Color Rings scale from Core Stack to deployment & tools.
         </p>
      </div>

      <div className="relative w-full flex-1 z-0">
        <Canvas camera={{ position: [0, 8, 25], fov: 45 }} dpr={[1, 2]}>
          <ambientLight intensity={0.2} />
          <directionalLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
          <Suspense fallback={null}>
             <OrbitControls 
               enableZoom={false} 
               enablePan={false} 
               autoRotate 
               autoRotateSpeed={0.5} 
               maxPolarAngle={Math.PI / 2 + 0.2}
               minPolarAngle={Math.PI / 4}
             />
             <SkillsScene />
          </Suspense>
        </Canvas>
      </div>
    </section>
  );
}
