import { ThemeToggle } from "@/components/ui/toggle";
import { HeroSection } from "@/components/sections/HeroSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { SkillsSection } from "@/components/sections/SkillsSection";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { ContactSection } from "@/components/sections/ContactSection";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#030014] text-white selection:bg-indigo-500/30">
      {/* Theme Toggle (optional, could just keep it for those who want light mode, though 3D looks best in dark) */}
      <div className="absolute top-4 right-4 z-50 mix-blend-difference">
        {/* <ThemeToggle /> currently commented out to keep full control of aesthetics */}
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
