"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Sphere, Float } from "@react-three/drei";
import * as THREE from "three";

const SKILL_GROUPS = [
  {
    category: "Full Stack Core",
    color: "#3b82f6", // Blue
    radius: 3.5,
    speed: 0.3,
    skills: ["React.js", "Next.js", "Python", "TypeScript", "JavaScript", "Node.js", "Express.js", "Tailwind CSS", "MUI"],
  },
  {
    category: "Database & Storage",
    color: "#10b981", // Emerald
    radius: 5.5,
    speed: 0.25,
    skills: ["Pinecone", "ChromaDB", "FAISS", "MySQL", "PostgreSQL", "MongoDB"],
  },
  {
    category: "AI Development",
    color: "#8b5cf6", // Purple
    radius: 7.5,
    speed: 0.2,
    skills: ["Gemini", "OpenAI", "Claude", "Hugging Face", "FastAPI", "RESTful APIs", "JWT"],
  },
  {
    category: "Gen AI & LLMs",
    color: "#ec4899", // Pink
    radius: 9.5,
    speed: 0.15,
    skills: ["RAG", "Prompt Eng", "Fine-Tuning", "Transformers"],
  },
  {
    category: "Agentic Frameworks",
    color: "#f43f5e", // Rose
    radius: 11.5,
    speed: 0.12,
    skills: ["MAS", "LangChain", "LlamaIndex", "LangGraph", "CrewAI", "AutoGen", "ReAct"],
  },
  {
    category: "Deployment & ML Ops",
    color: "#0ea5e9", // Sky
    radius: 13.5,
    speed: 0.1,
    skills: ["Docker", "AWS", "Jenkins", "CI/CD", "LangSmith", "LangFuse"],
  },
  {
    category: "Tools & Utilities",
    color: "#f59e0b", // Amber
    radius: 15.5,
    speed: 0.08,
    skills: ["Git", "GitHub", "GitLab", "Postman", "VS Code", "Cursor AI", "Jupyter", "Anaconda"],
  },
];

function SkillNode({ skill, orbitRadius, speed, color, angleOffset }: any) {
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
            args={[0.4, 32, 32]} 
            onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }} 
            onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
            scale={hovered ? 1.5 : 1}
          >
            <meshStandardMaterial 
              color={hovered ? "#ffffff" : color} 
              emissive={color} 
              emissiveIntensity={hovered ? 0.8 : 0.4} 
              roughness={0.2}
              metalness={0.8}
            />
          </Sphere>
          {hovered && (
            <Text 
              position={[0, 1.2, 0]} 
              fontSize={0.5} 
              color="white" 
              anchorX="center" 
              anchorY="middle"
              outlineColor={color}
              outlineWidth={0.02}
            >
              {skill}
            </Text>
          )}
        </Float>
      </group>
    </group>
  );
}

function SkillOrbit({ group }: { group: any }) {
  return (
    <group>
      {/* orbit ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[group.radius - 0.02, group.radius + 0.02, 128]} />
        <meshBasicMaterial color={group.color} transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>
      
      {group.skills.map((skill: string, index: number) => (
        <SkillNode 
          key={skill} 
          skill={skill} 
          orbitRadius={group.radius} 
          speed={group.speed} 
          color={group.color} 
          angleOffset={(index / group.skills.length) * Math.PI * 2} 
        />
      ))}
    </group>
  );
}

export function SkillsScene() {
  const coreRef = useRef<THREE.Mesh>(null);
  const [coreHovered, setCoreHovered] = useState(false);

  useFrame((state) => {
    if (coreRef.current) {
      coreRef.current.rotation.y += 0.005;
      coreRef.current.rotation.x += 0.005;
    }
  });

  return (
    <group rotation={[0.2, 0, 0]}>
      <Sphere 
        ref={coreRef} 
        args={[1.5, 32, 32]}
        onPointerOver={(e) => { e.stopPropagation(); setCoreHovered(true); document.body.style.cursor = 'pointer'; }} 
        onPointerOut={() => { setCoreHovered(false); document.body.style.cursor = 'auto'; }}
      >
        <meshStandardMaterial color="#000000" wireframe emissive="#4f46e5" emissiveIntensity={coreHovered ? 1.0 : 0.5} />
      </Sphere>

      {coreHovered && (
        <Text 
          position={[0, 2.5, 0]} 
          fontSize={1.2} 
          color="white" 
          anchorX="center" 
          anchorY="middle"
          outlineColor="#4f46e5"
          outlineWidth={0.05}
        >
          SKILLS
        </Text>
      )}

      {SKILL_GROUPS.map((group) => (
        <SkillOrbit key={group.category} group={group} />
      ))}
    </group>
  );
}
