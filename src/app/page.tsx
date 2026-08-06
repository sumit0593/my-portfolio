import Navbar from "@/app/components/navbar";
import { HeroSection } from "@/components/sections/HeroSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { SkillsSection } from "@/components/sections/SkillsSection";
import { ShowcaseSection } from "@/components/sections/ShowcaseSection";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { TotalExperienceSection } from "@/components/sections/TotalExperienceSection";
import { ResumeDownloadSection } from "@/components/sections/ResumeDownloadSection";
import { AIToolsSection } from "@/components/sections/AIToolsSection";
import { AIResumeInsightsSection } from "@/components/sections/AIResumeInsightsSection";
import { ParticleBackground } from "@/components/3d/particle-background";
import { WhatsAppWidget } from "@/components/ui/whatsapp-widget";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background text-foreground selection:bg-indigo-500/30 overflow-x-hidden">
      <ParticleBackground />
      <WhatsAppWidget />

      <Navbar />

      <main className="flex flex-col items-center justify-center w-full relative z-10 pt-16 md:pt-20">
        <HeroSection />

        <TotalExperienceSection />

        <ResumeDownloadSection />

        <ProjectsSection />

        <SkillsSection />

        <ShowcaseSection />

        <AIToolsSection />

        <ExperienceSection />

        <AIResumeInsightsSection />

        <ContactSection />
      </main>
    </div>
  );
}
