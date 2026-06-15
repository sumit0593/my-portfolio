"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import dynamic from "next/dynamic";
import { GlobeMarker } from "../ui/3d-globe";
import Loading from "@/app/loading";

// Lazy-load Globe3D to prevent SSR issues and ensure optimal performance
const Globe3D = dynamic(
  () => import("../ui/3d-globe").then((mod) => mod.Globe3D),
  {
    ssr: false,
    loading: () => <Loading />,
  }
);

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
    src: "https://assets.aceternity.com/avatars/11.webp",
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
    <section className="relative w-full h-screen bg-background text-foreground flex items-center justify-center overflow-hidden">

      {/* Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#6D5DFD]/10 blur-[130px] animate-pulse"
          style={{ animationDuration: "12s" }}
        />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#00D4FF]/10 blur-[130px] animate-pulse"
          style={{ animationDuration: "16s" }}
        />
      </div>

      {/* 3D Globe - Positioned absolutely inside the main section background */}
      <div className="absolute right-0 bottom-0 lg:top-1/2 lg:-translate-y-1/2 w-full lg:w-[55%] h-[45vh] lg:h-[85vh] flex items-center justify-center z-10 pointer-events-none overflow-hidden">
        <div className="w-[256px] h-[256px] sm:w-[304px] sm:h-[304px] lg:w-[600px] lg:h-[600px] xl:w-[680px] xl:h-[680px] relative pointer-events-auto">
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
      </div>

      {/* Full-width Responsive Hero Content Overlay */}
      <div className="relative z-20 w-full h-full flex flex-col lg:flex-row items-center justify-between px-6 md:px-12 lg:px-20 max-w-7xl mx-auto gap-8 pointer-events-none">

        {/* Left Column Text / Actions */}
        <div className="w-full lg:w-1/2 flex flex-col space-y-6 pointer-events-auto text-left pt-20 lg:pt-0">
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
            Explore Deployed Projects Across the Globe.
          </h1>

          {/* Gradient Highlight Tags listing Parent Skill Names */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs md:text-sm font-bold">
            {[
              "LLMs & GenAI",
              "Frameworks & Agents",
              "Vector & Databases",
              "Cloud & DevOps",
              "Backend & APIs",
              "Frontend & UI"
            ].map((text, idx) => (
              <span key={idx} className="flex items-center gap-1">
                <span className="text-[#00D4FF]">#</span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00D4FF] via-[#6D5DFD] to-[#8B5CF6]">
                  {text}
                </span>
                {idx < 5 && <span className="text-slate-400 dark:text-slate-600 ml-3">•</span>}
              </span>
            ))}
          </div>

          <p
            className="text-muted-foreground font-light text-sm md:text-lg leading-relaxed max-w-xl"
            style={{ textShadow: "var(--hero-p-text-shadow)" }}
          >
            Interact with real-world enterprise RAG engines, multi-agent frameworks, and responsive 3D platforms mapped dynamically across the globe.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button
              onClick={() => router.push("/login?callbackUrl=/dashboard")}
              className="flex cursor-pointer items-center justify-center rounded-xl bg-gradient-to-r from-[#6D5DFD] to-[#8B5CF6] hover:to-[#6D5DFD] px-8 py-4 font-semibold text-white transition-all duration-300 shadow-lg shadow-[#6D5DFD]/20 hover:shadow-xl hover:shadow-[#6D5DFD]/40 active:scale-98 text-sm gap-2 group"
            >
              Explore My Work
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => {
                document.getElementById("contact-section")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="flex cursor-pointer items-center justify-center rounded-xl bg-foreground/5 border border-foreground/10 hover:bg-foreground/10 hover:border-foreground/20 px-8 py-4 font-semibold text-muted-foreground hover:text-foreground transition-all active:scale-98 text-sm"
            >
              Contact Me
            </button>
          </div>
        </div>

        {/* Empty layout placeholder to offset/balance content on mobile vs desktop */}
        <div className="w-full lg:w-1/2 h-[45vh] lg:h-full pointer-events-none block lg:hidden" />

      </div>

      {/* Scroll indicator — z-50 so it always floats above globe even during zoom */}
      <div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center z-50 pointer-events-none">
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
