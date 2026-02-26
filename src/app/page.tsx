// app/page.tsx
"use client";

import { useEffect, useState } from "react";
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
        <div className="flex flex-col items-center justify-center h-screen">
          <AvatarScene />
          <div className="absolute bottom-32 text-3xl font-bold animate-pulse">
            Welcome to my world
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
