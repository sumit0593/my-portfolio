"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import AvatarScene from "./ai-assistant/page";
import { ThemeToggle } from "@/components/ui/toggle";
import LoginPage from "./login/page";
import { Container } from "@/components/ui/container";

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {showWelcome ? (
        <div className="relative flex flex-col items-center justify-center h-screen w-full overflow-hidden bg-black">
          {/* Background image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/welcome_background.png"
              alt="Welcome Background"
              fill
              className="object-cover opacity-[0.85] transition-opacity duration-1000"
              priority
            />
            {/* Gradient Overlay for better readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background backdrop-blur-[2px]" />
          </div>

          <div className="z-10 relative w-full h-[60vh] flex items-center justify-center">
            <AvatarScene />
          </div>

          <div className="absolute flex flex-col items-center justify-center bottom-12 md:bottom-24 z-20 space-y-4 font-sans text-center px-4 max-w-4xl w-full">
            <div className="bg-background/30 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl transform transition-all hover:scale-105 duration-300">
              <h1 className="text-5xl md:text-7xl font-extrabold pb-2 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 text-transparent bg-clip-text animate-pulse">
                Where Code Meets Imagination
              </h1>
              <p className="text-lg md:text-xl text-white/80 font-medium tracking-wide mt-4 flex items-center justify-center gap-3">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                Initializing AI Assistant...
              </p>
            </div>
          </div>
        </div>
      ) : (
        <main className="pt-20 min-h-screen">
          <Container>
            <LoginPage />
          </Container>
        </main>
      )}
    </div>
  );
}
