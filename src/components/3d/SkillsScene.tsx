"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere, Float, Html } from "@react-three/drei";
import * as THREE from "three";

export const SKILL_GROUPS = [
  {
    category: "Full Stack Core",
    color: "#3b82f6", // Blue
    radius: 3.5,
    speed: 0.3,
    skills: ["React.js", "Next.js", "Python", "TypeScript", "MERN Stack", "JavaScript", "Node.js", "Express.js", "Tailwind CSS"],
    tiltX: 0.1,
    tiltZ: 0.05
  },
  {
    category: "Database & Storage",
    color: "#10b981", // Emerald
    radius: 5.5,
    speed: 0.25,
    skills: ["Pinecone", "ChromaDB", "FAISS", "MySQL", "PostgreSQL", "MongoDB"],
    tiltX: -0.08,
    tiltZ: 0.12
  },
  {
    category: "AI Development",
    color: "#8b5cf6", // Purple
    radius: 7.5,
    speed: 0.2,
    skills: ["Gemini", "OpenAI", "Claude", "Hugging Face", "FastAPI", "RESTful APIs", "JWT"],
    tiltX: 0.15,
    tiltZ: -0.05
  },
  {
    category: "Gen AI & LLMs",
    color: "#ec4899", // Pink
    radius: 9.5,
    speed: 0.15,
    skills: ["RAG", "Prompt Eng", "Fine-Tuning", "Transformers"],
    tiltX: -0.12,
    tiltZ: -0.1
  },
  {
    category: "Agentic Frameworks",
    color: "#f43f5e", // Rose
    radius: 11.5,
    speed: 0.12,
    skills: ["MAS", "LangChain", "LlamaIndex", "LangGraph", "CrewAI", "AutoGen", "ReAct"],
    tiltX: 0.05,
    tiltZ: 0.18
  },
  {
    category: "Deployment & ML Ops",
    color: "#0ea5e9", // Sky
    radius: 13.5,
    speed: 0.1,
    skills: ["Docker", "AWS", "Jenkins", "CI/CD", "LangSmith", "LangFuse"],
    tiltX: -0.15,
    tiltZ: 0.08
  },
  {
    category: "Tools & Utilities",
    color: "#f59e0b", // Amber
    radius: 15.5,
    speed: 0.08,
    skills: ["Git", "GitHub", "GitLab", "Postman", "VS Code", "Cursor AI", "Jupyter", "Anaconda"],
    tiltX: 0.18,
    tiltZ: -0.12
  },
];

function SkillNode({ 
  skill, 
  orbitRadius, 
  speed, 
  color, 
  category, 
  angleOffset, 
  onHoverSkill, 
  onHoverCategory, 
  onHoverColor 
}: any) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    if (groupRef.current && !hovered) {
      // orbit around center
      groupRef.current.rotation.y -= delta * speed;
    }
  });

  return (
    <group ref={groupRef}>
      <group position={[Math.cos(angleOffset) * orbitRadius, 0, Math.sin(angleOffset) * orbitRadius]}>
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <Sphere 
            args={[0.3, 32, 32]} 
            onPointerOver={(e) => { 
              e.stopPropagation(); 
              setHovered(true); 
              document.body.style.cursor = 'pointer'; 
              onHoverSkill(skill);
              onHoverCategory(category);
              onHoverColor(color);
            }} 
            onPointerOut={() => { 
              setHovered(false); 
              document.body.style.cursor = 'auto'; 
              onHoverSkill(null);
              onHoverCategory(null);
              onHoverColor(null);
            }}
            scale={hovered ? 1.4 : 1}
          >
            <meshStandardMaterial 
              color={hovered ? "#ffffff" : color} 
              emissive={color} 
              emissiveIntensity={hovered ? 1.0 : 0.4} 
              roughness={0.15}
              metalness={0.9}
            />
          </Sphere>
          
          <Html position={[0, 0.7, 0]} center distanceFactor={14}>
            <div 
              style={{ 
                borderColor: hovered ? "#ffffff" : `${color}30`,
                boxShadow: hovered ? `0 4px 15px ${color}50` : "none"
              }}
              className={`px-2 py-0.5 rounded-full border bg-black/85 text-white flex items-center gap-1.5 transition-all duration-300 font-semibold text-[9px] select-none pointer-events-none whitespace-nowrap ${
                hovered 
                  ? "scale-110 opacity-100 border-white text-white" 
                  : "opacity-60"
              }`}
            >
              <span 
                style={{ backgroundColor: color }} 
                className="w-1.5 h-1.5 rounded-full animate-pulse shrink-0" 
              />
              {skill}
            </div>
          </Html>
        </Float>
      </group>
    </group>
  );
}

function SkillOrbit({ 
  group, 
  onHoverSkill, 
  onHoverCategory, 
  onHoverColor 
}: { 
  group: any; 
  onHoverSkill: (skill: string | null) => void;
  onHoverCategory: (category: string | null) => void;
  onHoverColor: (color: string | null) => void;
}) {
  return (
    <group rotation={[group.tiltX, 0, group.tiltZ]}>
      {/* orbit ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[group.radius - 0.02, group.radius + 0.02, 128]} />
        <meshBasicMaterial color={group.color} transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
      
      {group.skills.map((skill: string, index: number) => (
        <SkillNode 
          key={skill} 
          skill={skill} 
          orbitRadius={group.radius} 
          speed={group.speed} 
          color={group.color} 
          category={group.category}
          angleOffset={(index / group.skills.length) * Math.PI * 2} 
          onHoverSkill={onHoverSkill}
          onHoverCategory={onHoverCategory}
          onHoverColor={onHoverColor}
        />
      ))}
    </group>
  );
}

export function SkillsScene({ 
  onHoverSkill, 
  onHoverCategory, 
  onHoverColor 
}: { 
  onHoverSkill: (skill: string | null) => void;
  onHoverCategory: (category: string | null) => void;
  onHoverColor: (color: string | null) => void;
}) {
  const coreRef = useRef<THREE.Mesh>(null);
  const outerCoreRef = useRef<THREE.Mesh>(null);
  const [coreHovered, setCoreHovered] = useState(false);

  useFrame((state) => {
    if (coreRef.current) {
      coreRef.current.rotation.y += 0.003;
      coreRef.current.rotation.x += 0.003;
    }
    if (outerCoreRef.current) {
      outerCoreRef.current.rotation.y -= 0.005;
      outerCoreRef.current.rotation.z += 0.003;
    }
  });

  return (
    <group rotation={[0.2, 0, 0]}>
      {/* Glow effect for core */}
      <pointLight color="#6366f1" intensity={coreHovered ? 4.0 : 2.0} distance={8} />

      <Sphere 
        ref={coreRef} 
        args={[1.1, 32, 32]}
        onPointerOver={(e) => { 
          e.stopPropagation(); 
          setCoreHovered(true); 
          document.body.style.cursor = 'pointer'; 
          onHoverSkill("Tech Core");
          onHoverCategory("Skills Hub");
          onHoverColor("#6366f1");
        }} 
        onPointerOut={() => { 
          setCoreHovered(false); 
          document.body.style.cursor = 'auto'; 
          onHoverSkill(null);
          onHoverCategory(null);
          onHoverColor(null);
        }}
      >
        <meshStandardMaterial 
          color="#312e81" 
          emissive="#4f46e5" 
          emissiveIntensity={coreHovered ? 2.5 : 1.2} 
          roughness={0.1}
          metalness={0.8}
        />
      </Sphere>

      <mesh ref={outerCoreRef}>
        <sphereGeometry args={[1.4, 16, 16]} />
        <meshBasicMaterial color="#818cf8" wireframe transparent opacity={coreHovered ? 0.6 : 0.3} />
      </mesh>

      <Html position={[0, 0, 0]} center distanceFactor={10}>
        <div className={`px-4 py-1.5 rounded-2xl bg-indigo-950/85 backdrop-blur-md border border-indigo-500/30 text-indigo-300 text-xs font-bold tracking-widest uppercase select-none pointer-events-none transition-all duration-500 ${
          coreHovered ? "scale-115 border-indigo-400 bg-indigo-900 text-white shadow-[0_0_20px_rgba(99,102,241,0.6)]" : "opacity-80"
        }`}>
          Tech Core
        </div>
      </Html>

      {SKILL_GROUPS.map((group) => (
        <SkillOrbit 
          key={group.category} 
          group={group} 
          onHoverSkill={onHoverSkill}
          onHoverCategory={onHoverCategory}
          onHoverColor={onHoverColor}
        />
      ))}
    </group>
  );
}
