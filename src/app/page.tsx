// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import AvatarScene from "./ai-assistant/page";
import {ThemeToggle} from "@/components/ui/toggle";
import LoginPage from "./login/page";

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

      {/* Welcome 3D Avatar Screen */}
      {showWelcome ? (
        <div className="flex flex-col items-center justify-center h-screen transition-opacity duration-1000">
          <AvatarScene />
          <div className="absolute bottom-32 text-3xl font-bold animate-pulse">
            Welcome to my world
          </div>
        </div>
      ) : (
        // Main Page Content
        <main className="flex flex-col items-center justify-center text-center p-8 min-h-screen transition-opacity duration-1000">
          <LoginPage />
        </main>
      )}
    </div>
  );
}
