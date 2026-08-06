"use client";

import { useRef, useState, useMemo, useCallback, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere, Float, Html } from "@react-three/drei";
import * as THREE from "three";

export const SKILL_GROUPS = [
  {
    category: "Generative AI & LLMs",
    color: "#f59e0b", // Sun Gold
    radius: 3.2,
    speed: 0.35,
    skills: ["RAG Pipelines", "Prompt Engineering", "LLM Fine-Tuning", "Transformers", "Embeddings", "Vector Search"],
    tiltX: 0.08,
    tiltZ: 0.04,
    hasRings: true
  },
  {
    category: "AI Platforms & Models",
    color: "#ec4899", // Neon Pink
    radius: 5.2,
    speed: 0.28,
    skills: ["Google Gemini", "OpenAI GPT", "Anthropic Claude", "Hugging Face", "Ollama", "Llama 3", "DeepSeek"],
    tiltX: -0.06,
    tiltZ: 0.1,
    hasRings: false
  },
  {
    category: "Agentic Frameworks",
    color: "#8b5cf6", // Galactic Purple
    radius: 7.2,
    speed: 0.22,
    skills: ["LangChain", "LangGraph", "LlamaIndex", "CrewAI", "AutoGen", "ReAct Agents", "MAS"],
    tiltX: 0.12,
    tiltZ: -0.06,
    hasRings: true
  },
  {
    category: "AI Engineering",
    color: "#06b6d4", // Cyan Planet
    radius: 9.2,
    speed: 0.18,
    skills: ["FastAPI", "REST APIs", "JWT Auth", "Function Calling", "Tool Calling", "MCP"],
    tiltX: -0.1,
    tiltZ: -0.08,
    hasRings: false
  },
  {
    category: "Database & Vector Storage",
    color: "#10b981", // Emerald Terra
    radius: 11.2,
    speed: 0.15,
    skills: ["Pinecone", "ChromaDB", "FAISS", "PostgreSQL", "MySQL", "MongoDB"],
    tiltX: 0.04,
    tiltZ: 0.14,
    hasRings: true
  },
  {
    category: "Full Stack Development",
    color: "#3b82f6", // Deep Sapphire
    radius: 13.2,
    speed: 0.12,
    skills: ["React.js", "Next.js", "Node.js", "Express.js", "Python", "TypeScript", "JavaScript", "Tailwind CSS"],
    tiltX: -0.14,
    tiltZ: 0.06,
    hasRings: false
  },
  {
    category: "Cloud Deployment & MLOps",
    color: "#6366f1", // Cosmic Indigo
    radius: 15.2,
    speed: 0.09,
    skills: ["Docker", "AWS", "GCP", "Vercel", "Netlify", "Azure", "CI/CD", "LangSmith"],
    tiltX: 0.16,
    tiltZ: -0.1,
    hasRings: true
  },
  {
    category: "Developer Tools",
    color: "#f97316", // Amber Titan
    radius: 17.2,
    speed: 0.06,
    skills: ["Git", "GitHub", "GitLab", "Postman", "VS Code", "Cursor AI", "Jupyter", "Playwright"],
    tiltX: -0.04,
    tiltZ: 0.12,
    hasRings: false
  }
];

// Starfield background component
function SolarStarfield() {
  const starsCount = 400;
  const positions = useMemo(() => {
    const pos = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 60;
    }
    return pos;
  }, []);

  const starsRef = useRef<THREE.Points>(null);

  useFrame((state, delta) => {
    if (starsRef.current) {
      starsRef.current.rotation.y += delta * 0.02;
    }
  });

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color="#ffffff"
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  );
}

// Celestial Planet Node component
function CelestialPlanet({
  skill,
  orbitRadius,
  speed,
  color,
  category,
  angleOffset,
  hasRings,
  isMajor,
  onHoverSkill,
  onHoverCategory,
  onHoverColor,
  onClickSkill
}: any) {
  const groupRef = useRef<THREE.Group>(null);
  const planetMeshRef = useRef<THREE.Mesh>(null);
  const moonRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    if (groupRef.current && !hovered) {
      groupRef.current.rotation.y -= delta * speed;
    }
    if (planetMeshRef.current) {
      planetMeshRef.current.rotation.y += delta * 0.6;
    }
    if (moonRef.current) {
      moonRef.current.rotation.y += delta * 1.5;
    }
  });

  const planetSize = isMajor ? 0.42 : 0.28;

  return (
    <group ref={groupRef}>
      <group position={[Math.cos(angleOffset) * orbitRadius, 0, Math.sin(angleOffset) * orbitRadius]}>
        <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.4}>
          
          {/* Planet Body with Sharp HD Geometry */}
          <mesh
            ref={planetMeshRef}
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
            <icosahedronGeometry args={[planetSize, 4]} />
            <meshStandardMaterial
              color={hovered ? "#ffffff" : color}
              emissive={color}
              emissiveIntensity={hovered ? 1.3 : 0.55}
              roughness={0.15}
              metalness={0.85}
            />
          </mesh>

          {/* Planetary Rings (for Saturn-style major planets) */}
          {hasRings && isMajor && (
            <mesh rotation={[Math.PI / 3, 0, 0]}>
              <ringGeometry args={[planetSize + 0.15, planetSize + 0.35, 64]} />
              <meshBasicMaterial color={color} transparent opacity={0.45} side={THREE.DoubleSide} />
            </mesh>
          )}

          {/* Orbiting Moon Satellite (for major planets) */}
          {isMajor && (
            <group ref={moonRef}>
              <mesh position={[planetSize + 0.5, 0, 0]}>
                <sphereGeometry args={[0.08, 16, 16]} />
                <meshStandardMaterial color="#e0e7ff" emissive={color} emissiveIntensity={0.6} />
              </mesh>
            </group>
          )}

          {/* Planet Label */}
          <Html position={[0, planetSize + 0.45, 0]} center distanceFactor={14} wrapperClass="pointer-events-none">
            <div
              style={{
                borderColor: hovered ? "#ffffff" : `${color}40`,
                boxShadow: hovered ? `0 4px 18px ${color}60` : `0 2px 8px rgba(0,0,0,0.5)`
              }}
              className={`px-2 py-0.5 rounded-full border bg-black/90 backdrop-blur-md text-white flex items-center gap-1.5 transition-all duration-300 font-semibold text-[9px] select-none pointer-events-none whitespace-nowrap ${
                hovered ? "scale-110 opacity-100 border-white text-white z-50" : "opacity-75"
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

// Solar Orbit Ring component
function PlanetaryOrbit({
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
      {/* Glowing Orbit Path */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[group.radius - 0.02, group.radius + 0.02, 128]} />
        <meshBasicMaterial color={group.color} transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>

      {group.skills.map((skill: string, index: number) => (
        <CelestialPlanet
          key={skill}
          skill={skill}
          orbitRadius={group.radius}
          speed={group.speed}
          color={group.color}
          category={group.category}
          angleOffset={(index / group.skills.length) * Math.PI * 2}
          hasRings={group.hasRings}
          isMajor={index === 0 || index === 1}
          onHoverSkill={onHoverSkill}
          onHoverCategory={onHoverCategory}
          onHoverColor={onHoverColor}
          onClickSkill={onClickSkill}
        />
      ))}
    </group>
  );
}

// Radiating Solar Light Ray Spikes component - 3D Spherical Fibonacci Distribution
function SolarRaySpikes({ hovered }: { hovered: boolean }) {
  const raysGroupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (raysGroupRef.current) {
      raysGroupRef.current.rotation.y += delta * 0.15;
      raysGroupRef.current.rotation.x += delta * 0.08;
    }
  });

  // Generate 24 rays distributed evenly in 3D spherical space
  const rayVectors = useMemo(() => {
    const rays = [];
    const numRays = 24;
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

    for (let i = 0; i < numRays; i++) {
      const y = 1 - (i / (numRays - 1)) * 2;
      const radius = Math.sqrt(1 - y * y);
      const theta = phi * i;

      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;

      const dir = new THREE.Vector3(x, y, z).normalize();
      const quaternion = new THREE.Quaternion();
      quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

      rays.push({
        position: dir.clone().multiplyScalar(1.9),
        quaternion
      });
    }
    return rays;
  }, []);

  return (
    <group ref={raysGroupRef}>
      {rayVectors.map((ray, idx) => (
        <mesh key={idx} position={ray.position} quaternion={ray.quaternion}>
          <cylinderGeometry args={[0.012, 0.14, 1.5, 8]} />
          <meshBasicMaterial
            color="#fbbf24"
            transparent
            opacity={hovered ? 0.85 : 0.55}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

// Dynamic Scroll Zoom Camera effect - active only when Nova star is clicked
function ScrollZoomCamera({ enabled }: { enabled: boolean }) {
  useFrame(({ camera }) => {
    if (!enabled || typeof window === "undefined") return;
    const scrollY = window.scrollY || 0;
    const targetZ = 25 - (scrollY % 600) * 0.005;
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.05);
  });
  return null;
}

// Glowing Shooting Comet with vector-aligned tail, random 3D flow & subtle frequency
function ShootingComet() {
  const cometRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Mesh>(null);

  const trajectory = useRef({
    start: new THREE.Vector3(-22, 12, -14),
    end: new THREE.Vector3(22, -12, 14),
    quaternion: new THREE.Quaternion(),
    speed: 0.14,
    progress: -Math.random() * 3
  });

  const resetTrajectory = useCallback(() => {
    const startX = (Math.random() > 0.5 ? -1 : 1) * (18 + Math.random() * 8);
    const startY = (Math.random() - 0.5) * 22;
    const startZ = (Math.random() - 0.5) * 18;

    const endX = -startX;
    const endY = -startY + (Math.random() - 0.5) * 8;
    const endZ = -startZ + (Math.random() - 0.5) * 8;

    const start = new THREE.Vector3(startX, startY, startZ);
    const end = new THREE.Vector3(endX, endY, endZ);
    const dir = end.clone().sub(start).normalize();

    const tailDir = dir.clone().negate();
    const quat = new THREE.Quaternion();
    quat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tailDir);

    trajectory.current = {
      start,
      end,
      quaternion: quat,
      speed: 0.1 + Math.random() * 0.08,
      progress: -2.5 - Math.random() * 5
    };
  }, []);

  useEffect(() => {
    resetTrajectory();
  }, [resetTrajectory]);

  useFrame((state, delta) => {
    if (!cometRef.current) return;
    const traj = trajectory.current;
    traj.progress += delta * traj.speed;

    if (traj.progress > 1.2) {
      resetTrajectory();
    }

    if (traj.progress >= 0 && traj.progress <= 1) {
      const currentPos = traj.start.clone().lerp(traj.end, traj.progress);
      cometRef.current.position.copy(currentPos);
      cometRef.current.visible = true;

      if (tailRef.current) {
        tailRef.current.quaternion.copy(traj.quaternion);
      }
    } else {
      cometRef.current.visible = false;
    }
  });

  return (
    <group ref={cometRef} visible={false}>
      {/* Comet Head Glowing Core */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>
      <pointLight color="#38bdf8" intensity={2.2} distance={6} />

      {/* Comet Tail Cylinder offset so head sits at the VERY START / TIP of tail */}
      <group ref={tailRef}>
        <mesh position={[0, 0.7, 0]}>
          <cylinderGeometry args={[0.005, 0.14, 1.4, 8]} />
          <meshBasicMaterial
            color="#06b6d4"
            transparent
            opacity={0.6}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>
    </group>
  );
}

// 3D Asteroid Belt Component with sharp rocky geometry
function AsteroidBelt() {
  const beltRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (beltRef.current) {
      beltRef.current.rotation.y += delta * 0.04;
    }
  });

  const asteroids = useMemo(() => {
    const count = 45;
    const items = [];
    const minR = 6.4;
    const maxR = 7.6;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
      const radius = minR + Math.random() * (maxR - minR);
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = (Math.random() - 0.5) * 0.5;

      const scale = 0.05 + Math.random() * 0.09;
      const rotX = Math.random() * Math.PI;
      const rotY = Math.random() * Math.PI;

      items.push({ x, y, z, scale, rotX, rotY });
    }
    return items;
  }, []);

  return (
    <group ref={beltRef}>
      {asteroids.map((ast, idx) => (
        <mesh
          key={idx}
          position={[ast.x, ast.y, ast.z]}
          rotation={[ast.rotX, ast.rotY, 0]}
          scale={ast.scale}
        >
          <dodecahedronGeometry args={[1, 1]} />
          <meshStandardMaterial
            color="#94a3b8"
            roughness={0.9}
            metalness={0.3}
            flatShading
          />
        </mesh>
      ))}
    </group>
  );
}

export function SkillsScene({
  zoomEnabled = false,
  onHoverSkill,
  onHoverCategory,
  onHoverColor,
  onClickSkill
}: {
  zoomEnabled?: boolean;
  onHoverSkill: (skill: string | null) => void;
  onHoverCategory: (category: string | null) => void;
  onHoverColor: (color: string | null) => void;
  onClickSkill?: (skill: string | null, category: string | null, color: string | null) => void;
}) {
  const sunRef = useRef<THREE.Mesh>(null);
  const coronaRef = useRef<THREE.Mesh>(null);
  const solarFlareRef = useRef<THREE.Mesh>(null);
  const [sunHovered, setSunHovered] = useState(false);

  useFrame((state, delta) => {
    if (sunRef.current) {
      sunRef.current.rotation.y += delta * 0.2;
    }
    if (coronaRef.current) {
      coronaRef.current.rotation.y -= delta * 0.15;
      coronaRef.current.rotation.z += delta * 0.1;
    }
    if (solarFlareRef.current) {
      solarFlareRef.current.rotation.y += delta * 0.1;
      solarFlareRef.current.rotation.x -= delta * 0.08;
    }
  });

  return (
    <group rotation={[0.2, 0, 0]}>
      {/* Dynamic Scroll Camera Zoom */}
      <ScrollZoomCamera enabled={zoomEnabled} />

      {/* Background Solar Starfield */}
      <SolarStarfield />

      {/* 3D Asteroid Belt */}
      <AsteroidBelt />

      {/* Shooting Comets with Vector-Aligned Tail & Random 3D Flow */}
      <ShootingComet />
      <ShootingComet />

      {/* Central Sun Light Source with Pulse Light Emission */}
      <pointLight color="#fbbf24" intensity={sunHovered ? 8.0 : 5.0} distance={32} />
      <pointLight color="#f59e0b" intensity={sunHovered ? 5.5 : 3.5} distance={22} />
      <ambientLight intensity={0.5} />

      {/* 3D Spherical Radiating Solar Rays (All Directions) */}
      <SolarRaySpikes hovered={sunHovered} />

      {/* Central Sun / Tech Core */}
      <Sphere
        ref={sunRef}
        args={[1.15, 32, 32]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setSunHovered(true);
          document.body.style.cursor = 'pointer';
          onHoverSkill("Nova");
          onHoverCategory("Central Star");
          onHoverColor("#f59e0b");
        }}
        onPointerOut={() => {
          setSunHovered(false);
          document.body.style.cursor = 'auto';
          onHoverSkill(null);
          onHoverCategory(null);
          onHoverColor(null);
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClickSkill?.("Nova", "Central Star", "#f59e0b");
        }}
      >
        <meshStandardMaterial
          color="#d97706"
          emissive="#f59e0b"
          emissiveIntensity={sunHovered ? 3.5 : 2.2}
          roughness={0.05}
          metalness={0.95}
        />
      </Sphere>

      {/* Sun Coronal Halo Mesh */}
      <mesh ref={coronaRef}>
        <sphereGeometry args={[1.38, 32, 32]} />
        <meshBasicMaterial
          color="#fbbf24"
          wireframe
          transparent
          opacity={sunHovered ? 0.8 : 0.45}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Solar Atmosphere Pulse Flare Mesh */}
      <mesh ref={solarFlareRef}>
        <sphereGeometry args={[1.6, 16, 16]} />
        <meshBasicMaterial
          color="#f59e0b"
          wireframe
          transparent
          opacity={sunHovered ? 0.45 : 0.22}
        />
      </mesh>

      {/* Sun Center Single Word Badge: Nova */}
      <Html position={[0, 0, 0]} center distanceFactor={10} wrapperClass="pointer-events-none">
        <div
          className={`px-4 py-1.5 rounded-full bg-amber-950/90 backdrop-blur-md border border-amber-500/50 text-amber-300 text-xs font-black tracking-widest uppercase select-none pointer-events-none transition-all duration-500 ${
            sunHovered
              ? "scale-115 border-amber-400 bg-amber-900 text-white shadow-[0_0_30px_rgba(245,158,11,0.9)]"
              : "opacity-90 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
          }`}
        >
          Nova
        </div>
      </Html>

      {/* Planetary Orbits */}
      {SKILL_GROUPS.map((group) => (
        <PlanetaryOrbit
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
