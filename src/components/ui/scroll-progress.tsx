"use client";

import { useEffect, useState } from "react";

export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setProgress((window.scrollY / totalScroll) * 100);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div 
      className="fixed top-0 left-0 h-[4px] bg-gradient-to-r from-primary via-indigo-500 to-purple-500 z-[9999] transition-all duration-75 ease-out shadow-[0_1px_10px_rgba(99,102,241,0.5)]"
      style={{ width: `${progress}%` }}
    />
  );
}
