import { ThemeToggle } from "@/components/ui/toggle";
import { HeroSection } from "@/components/sections/HeroSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { SkillsSection } from "@/components/sections/SkillsSection";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { ContactSection } from "@/components/sections/ContactSection";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background text-foreground selection:bg-indigo-500/30">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <main className="flex flex-col items-center justify-center w-full">
        <HeroSection />
        
        {/* 3D Projects Showcase */}
        <ProjectsSection />
        
        {/* 3D Skills Orbit */}
        <SkillsSection />

        {/* Experience Timeline */}
        <ExperienceSection />

        {/* Contact Section */}
        <ContactSection />
      </main>
    </div>
  );
}
