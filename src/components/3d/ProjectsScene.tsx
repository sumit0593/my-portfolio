"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

const PROJECTS = [
  { id: 1, title: "AI Assistant Dashboard", tech: "Next.js, OpenAI, Tailwind", link: "#", color: "from-blue-500/20 to-cyan-500/20" },
  { id: 2, title: "3D Neural Visualizer", tech: "WebGL, Three.js, React", link: "#", color: "from-purple-500/20 to-pink-500/20" },
  { id: 3, title: "Fintech Mobile App", tech: "React Native, Node.js", link: "#", color: "from-emerald-500/20 to-teal-500/20" },
  { id: 4, title: "E-Commerce Microservices", tech: "Go, Kubernetes, gRPC", link: "#", color: "from-orange-500/20 to-red-500/20" },
  { id: 5, title: "Real-time Crypto Tracker", tech: "WebSockets, D3.js", link: "#", color: "from-indigo-500/20 to-blue-500/20" },
];

function ProjectCard({ project, index, total }: { project: any, index: number, total: number }) {
  const radius = 4.5;
  const angle = (index / total) * Math.PI * 2;
  const x = Math.sin(angle) * radius;
  const z = Math.cos(angle) * radius;

  return (
    <group position={[x, 0, z]} rotation={[0, angle, 0]}>
      {/* Fallback Mesh behind HTML to cast shadows or just add visual depth */}
      <mesh position={[0, 0, -0.1]}>
        <planeGeometry args={[3.2, 4]} />
        <meshBasicMaterial color="#000000" opacity={0.5} transparent />
      </mesh>
      
      <Html transform className="w-80" distanceFactor={4} position={[0,0,0]} occlude="blending">
        <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-indigo-500/30 p-6 rounded-2xl shadow-[0_0_20px_rgba(79,70,229,0.1)] hover:shadow-[0_0_40px_rgba(79,70,229,0.4)] transition-all cursor-pointer group">
          <div className={`h-40 bg-gradient-to-br ${project.color} rounded-xl mb-4 overflow-hidden relative border border-white/5`}>
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors" />
            <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-100 transition-opacity">
               <span className="text-white tracking-widest text-sm font-semibold uppercase">Preview</span>
            </div>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
          <p className="text-sm text-indigo-300 mb-6">{project.tech}</p>
          <div className="flex gap-3">
             <button className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2.5 rounded-lg text-sm font-medium transition-colors border border-white/10 backdrop-blur-md">
               Live Demo
             </button>
             <button className="flex-1 bg-indigo-600/80 hover:bg-indigo-500 text-white py-2.5 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20">
               GitHub
             </button>
          </div>
        </div>
      </Html>
    </group>
  );
}

export function ProjectsScene() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Very slow infinite rotation to invite interaction
      groupRef.current.rotation.y -= delta * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {PROJECTS.map((p, i) => (
        <ProjectCard key={p.id} project={p} index={i} total={PROJECTS.length} />
      ))}
    </group>
  );
}
