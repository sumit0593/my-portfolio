"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Send } from "lucide-react";
import dynamic from "next/dynamic";
import { GlobeMarker } from "../ui/3d-globe";
import Loading from "@/app/loading";
import { cn } from "@/lib/utils";

// Lazy-load Globe3D to prevent SSR issues and ensure optimal performance
const Globe3D = dynamic(
  () => import("../ui/3d-globe").then((mod) => mod.Globe3D),
  {
    ssr: false,
    loading: () => <Loading />,
  }
);

import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// 3D Galaxy Starfield backdrop matching Skills Solar System 3D background
function HeroGalaxyCanvas() {
  const starsRef = React.useRef<THREE.Points>(null);

  useFrame((state, delta) => {
    if (starsRef.current) {
      starsRef.current.rotation.y += delta * 0.02;
    }
  });

  const starPositions = React.useMemo(() => {
    const count = 450;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
    }
    return positions;
  }, []);

  return (
    <group>
      {/* 3D Starfield matching Solar System background */}
      <points ref={starsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[starPositions, 3]}
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

      {/* Deep Space Volumetric Ambient Glow Lights */}
      <pointLight position={[-25, 15, -15]} color="#6D5DFD" intensity={3} distance={65} />
      <pointLight position={[25, -15, -15]} color="#00D4FF" intensity={3} distance={65} />
      <pointLight position={[0, 0, -22]} color="#8B5CF6" intensity={2} distance={70} />
    </group>
  );
}

// Markers exactly as defined in the Aceternity Globe Demo
const sampleMarkers: GlobeMarker[] = [
  {
    lat: 40.7128,
    lng: -74.006,
    src: "https://assets.aceternity.com/avatars/1.webp",
    label: "New York",
  },
  {
    lat: 51.5074,
    lng: -0.1278,
    src: "https://assets.aceternity.com/avatars/2.webp",
    label: "London",
  },
  {
    lat: 35.6762,
    lng: 139.6503,
    src: "https://assets.aceternity.com/avatars/3.webp",
    label: "Tokyo",
  },
  {
    lat: -33.8688,
    lng: 151.2093,
    src: "https://assets.aceternity.com/avatars/4.webp",
    label: "Sydney",
  },
  {
    lat: 48.8566,
    lng: 2.3522,
    src: "https://assets.aceternity.com/avatars/5.webp",
    label: "Paris",
  },
  {
    lat: 28.6139,
    lng: 77.209,
    src: "https://assets.aceternity.com/avatars/6.webp",
    label: "New Delhi",
  },
  {
    lat: 55.7558,
    lng: 37.6173,
    src: "https://assets.aceternity.com/avatars/7.webp",
    label: "Moscow",
  },
  {
    lat: -22.9068,
    lng: -43.1729,
    src: "https://assets.aceternity.com/avatars/8.webp",
    label: "Rio de Janeiro",
  },
  {
    lat: 31.2304,
    lng: 121.4737,
    src: "https://assets.aceternity.com/avatars/9.webp",
    label: "Shanghai",
  },
  {
    lat: 25.2048,
    lng: 55.2708,
    src: "https://assets.aceternity.com/avatars/10.webp",
    label: "Dubai",
  },
  {
    lat: -34.6037,
    lng: -58.3816,
    src: "https://assets.gravatar.com/avatars/11.webp",
    label: "Buenos Aires",
  },
  {
    lat: 1.3521,
    lng: 103.8198,
    src: "https://assets.aceternity.com/avatars/12.webp",
    label: "Singapore",
  },
  {
    lat: 37.5665,
    lng: 126.978,
    src: "https://assets.aceternity.com/avatars/13.webp",
    label: "Seoul",
  },
];

export function HeroSection() {
  const router = useRouter();

  return (
    <section id="home" className="relative w-full min-h-screen lg:h-screen bg-background text-foreground flex items-center justify-center overflow-x-hidden pb-12 pt-20 md:pb-16 md:pt-24 lg:py-0">

      {/* Unified Full-Section 3D Canvas (Rotating 3D Starfield Space View + Globe + Uncropped Satellites) */}
      <div className="absolute inset-0 w-full h-full z-10 pointer-events-auto overflow-visible">
        <Globe3D
          className="h-full w-full"
          markers={sampleMarkers}
          isExploring={false}
          config={{
            showAtmosphere: true,
            atmosphereColor: "#4da6ff",
            atmosphereIntensity: 0.8,
            bumpScale: 10,
            autoRotateSpeed: 0.3,
          }}
          onMarkerClick={(marker) => {
            console.log("Clicked marker:", marker.label);
          }}
          onMarkerHover={(marker) => {
            if (marker) {
              console.log("Hovering:", marker.label);
            }
          }}
        />
      </div>

      {/* Background Ambient Cosmic Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className="absolute top-[-10%] left-[-10%] w-[55%] h-[55%] rounded-full bg-[#6D5DFD]/15 blur-[140px] animate-pulse"
          style={{ animationDuration: "12s" }}
        />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] rounded-full bg-[#00D4FF]/15 blur-[140px] animate-pulse"
          style={{ animationDuration: "16s" }}
        />
        <div
          className="absolute top-[30%] left-[20%] w-[40%] h-[40%] rounded-full bg-[#8B5CF6]/10 blur-[150px] animate-pulse"
          style={{ animationDuration: "14s" }}
        />
      </div>

      {/* Full-width Responsive Hero Content Overlay */}
      <div className="relative z-20 w-full h-full flex flex-col md:flex-row items-center justify-between px-6 md:px-12 lg:px-20 max-w-7xl mx-auto gap-8 pointer-events-none">

        {/* Left Column Text / Actions (Static HTML card overlay) */}
        <div className="w-full md:w-[50%] lg:w-[45%] flex flex-col space-y-6 pointer-events-auto text-left py-12 md:py-0">
          {/* Premium Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#6D5DFD]/40 bg-[#6D5DFD]/10 w-fit">
            <img src="/assets/nova.png" alt="Nova" className="w-3.5 h-3.5 object-contain rounded-full" />
            <span className="text-[10px] uppercase font-bold tracking-wider text-foreground">
              GenAI Architect Portfolio
            </span>
          </div>

          <h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-balance text-foreground leading-[1.1]"
            style={{ textShadow: "var(--hero-text-shadow)" }}
          >
            Explore Deployed Projects{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00D4FF] via-[#6D5DFD] to-[#8B5CF6]">
              Across the Globe.
            </span>
          </h1>

          {/* Styled Tech Tags grid */}
          <div className="grid grid-cols-2 gap-2.5 w-full max-w-md md:max-w-lg text-[10px] sm:text-xs font-semibold">
            {[
              { text: "LLMs & GenAI", colorClass: "text-sky-400 border-sky-500/30 bg-sky-500/5 hover:bg-sky-500/10" },
              { text: "Frameworks & Agents", colorClass: "text-purple-400 border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10" },
              { text: "Vector & Databases", colorClass: "text-emerald-400 border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10" },
              { text: "Cloud & DevOps", colorClass: "text-amber-500 border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10" },
              { text: "Backend & APIs", colorClass: "text-cyan-400 border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/10" },
              { text: "Frontend & UI", colorClass: "text-slate-400 border-slate-500/30 bg-slate-500/5 hover:bg-slate-500/10" }
            ].map((tag, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-all duration-300",
                  tag.colorClass
                )}
              >
                <span>#</span>
                <span>{tag.text}</span>
              </div>
            ))}
          </div>

          <p
            className="text-muted-foreground font-light text-sm md:text-lg leading-relaxed max-w-xl"
            style={{ textShadow: "var(--hero-p-text-shadow)" }}
          >
            Interact with real-world enterprise RAG engines, multi-agent frameworks, and responsive 3D platforms mapped dynamically across the globe.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-2 w-full">
            <button
              onClick={() => router.push("/login?callbackUrl=/dashboard")}
              className="flex cursor-pointer items-center justify-center rounded-xl bg-gradient-to-r from-[#6D5DFD] to-[#8B5CF6] hover:to-[#6D5DFD] px-8 py-4 font-semibold text-white transition-all duration-300 shadow-lg shadow-[#6D5DFD]/20 hover:shadow-xl hover:shadow-[#6D5DFD]/40 active:scale-98 text-sm gap-2 group w-full sm:w-auto"
            >
              Explore My Work
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => {
                document.getElementById("contact-section")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="flex cursor-pointer items-center justify-center rounded-xl bg-foreground/5 border border-foreground/10 hover:bg-foreground/10 hover:border-foreground/20 px-8 py-4 font-semibold text-muted-foreground hover:text-foreground transition-all active:scale-98 text-sm gap-2 w-full sm:w-auto"
            >
              <Send className="w-4 h-4" />
              Contact Me
            </button>
          </div>
        </div>

        {/* Right Area Spacer (3D Globe rendered in full section Canvas behind) */}
        <div className="w-full md:w-[50%] h-0 md:h-full pointer-events-none" />

      </div>

      {/* Scroll indicator — z-50 so it always floats above globe even during zoom */}
      <div className="hidden lg:flex absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center z-50 pointer-events-none">
        <span
          className="text-[11px] sm:text-xs font-semibold tracking-[0.25em] uppercase mb-2 animate-pulse"
          style={{
            color: "var(--foreground)",
            textShadow: "0 0 12px rgba(109,93,253,0.7), 0 0 24px rgba(109,93,253,0.4)",
            animationDuration: "2.5s",
          }}
        >
          Scroll
        </span>
        <div className="w-[2px] h-10 sm:h-12 rounded-full bg-gradient-to-b from-[#6D5DFD] via-[#00D4FF] to-transparent animate-pulse" style={{ animationDuration: "2s" }} />
      </div>

    </section>
  );
}

