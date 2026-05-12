import { ThemeToggle } from "@/components/ui/toggle";
import { HeroSection } from "@/components/sections/HeroSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { SkillsSection } from "@/components/sections/SkillsSection";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { TotalExperienceSection } from "@/components/sections/TotalExperienceSection";
import { ResumeDownloadSection } from "@/components/sections/ResumeDownloadSection";
import { AIToolsSection } from "@/components/sections/AIToolsSection";
import { AIResumeInsightsSection } from "@/components/sections/AIResumeInsightsSection";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background text-foreground selection:bg-indigo-500/30">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <main className="flex flex-col items-center justify-center w-full">
        <HeroSection />
        
        <TotalExperienceSection />

        <ResumeDownloadSection />

        <ProjectsSection />
        
        <SkillsSection />
        
        <AIToolsSection />

        <ExperienceSection />
        
        <AIResumeInsightsSection />

        <ContactSection />
      </main>
    </div>
  );
}
