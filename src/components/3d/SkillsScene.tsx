"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere, Float, Html } from "@react-three/drei";
import * as THREE from "three";

export const SKILL_GROUPS = [
  {
    category: "Generative AI & LLMs",
    color: "#ec4899",
    radius: 3.0,
    speed: 0.3,
    skills: ["RAG Pipelines", "Prompt Engineering", "LLM Fine-Tuning", "Transformers", "Embeddings", "Vector Search"],
    tiltX: 0.1,
    tiltZ: 0.05
  },
  {
    category: "AI Platforms & Models",
    color: "#8b5cf6",
    radius: 5.0,
    speed: 0.26,
    skills: ["Google Gemini", "OpenAI GPT", "Anthropic Claude", "Hugging Face", "Ollama", "Llama 3", "DeepSeek"],
    tiltX: -0.08,
    tiltZ: 0.12
  },
  {
    category: "Agentic Frameworks",
    color: "#f43f5e",
    radius: 7.0,
    speed: 0.22,
    skills: ["LangChain", "LangGraph", "LlamaIndex", "CrewAI", "AutoGen", "ReAct Agents", "Multi-Agent Systems (MAS)"],
    tiltX: 0.15,
    tiltZ: -0.05
  },
  {
    category: "AI Engineering",
    color: "#0ea5e9",
    radius: 9.0,
    speed: 0.18,
    skills: ["FastAPI", "REST APIs", "JWT Authentication", "Function Calling", "Tool Calling", "MCP"],
    tiltX: -0.12,
    tiltZ: -0.1
  },
  {
    category: "Database & Storage",
    color: "#10b981",
    radius: 11.0,
    speed: 0.15,
    skills: ["Pinecone", "ChromaDB", "FAISS", "PostgreSQL", "MySQL", "MongoDB"],
    tiltX: 0.05,
    tiltZ: 0.18
  },
  {
    category: "Full Stack Development",
    color: "#3b82f6",
    radius: 13.0,
    speed: 0.12,
    skills: ["React.js", "Next.js", "Node.js", "Express.js", "Python", "TypeScript", "JavaScript", "Tailwind CSS", "MUI"],
    tiltX: -0.15,
    tiltZ: 0.08
  },
  {
    category: "Deployment & MLOps",
    color: "#6366f1",
    radius: 15.0,
    speed: 0.09,
    skills: ["Docker", "AWS", "GCP", "Vercel", "Netlify", "Azure", "Jenkins", "CI/CD", "LangSmith", "LangFuse"],
    tiltX: 0.18,
    tiltZ: -0.12
  },
  {
    category: "Tools",
    color: "#f59e0b",
    radius: 17.0,
    speed: 0.06,
    skills: ["Git", "GitHub", "GitLab", "Postman", "VS Code", "Cursor AI", "Jupyter", "Playwright", "Anaconda"],
    tiltX: -0.05,
    tiltZ: 0.15
  }
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
  onHoverColor,
  onClickSkill
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
            onClick={(e) => {
              e.stopPropagation();
              onClickSkill?.(skill, category, color);
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

          <Html position={[0, 0.7, 0]} center distanceFactor={14} wrapperClass="pointer-events-none">
            <div
              style={{
                borderColor: hovered ? "#ffffff" : `${color}30`,
                boxShadow: hovered ? `0 4px 15px ${color}50` : "none"
              }}
              className={`px-2 py-0.5 rounded-full border bg-black/85 text-white flex items-center gap-1.5 transition-all duration-300 font-semibold text-[9px] select-none pointer-events-none whitespace-nowrap ${hovered
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
  onHoverColor,
  onClickSkill
}: {
  group: any;
  onHoverSkill: (skill: string | null) => void;
  onHoverCategory: (category: string | null) => void;
  onHoverColor: (color: string | null) => void;
  onClickSkill?: (skill: string | null, category: string | null, color: string | null) => void;
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
          onClickSkill={onClickSkill}
        />
      ))}
    </group>
  );
}

export function SkillsScene({
  onHoverSkill,
  onHoverCategory,
  onHoverColor,
  onClickSkill
}: {
  onHoverSkill: (skill: string | null) => void;
  onHoverCategory: (category: string | null) => void;
  onHoverColor: (color: string | null) => void;
  onClickSkill?: (skill: string | null, category: string | null, color: string | null) => void;
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
        onClick={(e) => {
          e.stopPropagation();
          onClickSkill?.("Tech Core", "Skills Hub", "#6366f1");
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

      <Html position={[0, 0, 0]} center distanceFactor={10} wrapperClass="pointer-events-none">
        <div className={`px-4 py-1.5 rounded-2xl bg-indigo-950/85 backdrop-blur-md border border-indigo-500/30 text-indigo-300 text-xs font-bold tracking-widest uppercase select-none pointer-events-none transition-all duration-500 ${coreHovered ? "scale-115 border-indigo-400 bg-indigo-900 text-white shadow-[0_0_20px_rgba(99,102,241,0.6)]" : "opacity-80"
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
          onClickSkill={onClickSkill}
        />
      ))}
    </group>
  );
}
