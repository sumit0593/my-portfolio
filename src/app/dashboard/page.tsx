"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "../components/navbar";
import SectionWrapper from "../components/section-wrapper";
import { Container } from "@/components/ui/container";
import { Bot, Briefcase, Code, Sparkles, UserCheck, ShieldCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Loading from "@/app/loading";
import { ServicesPortal } from "@/components/business/services-portal";
import { ToolsLaunchpad } from "@/components/business/tools-launchpad";
import { ClientConsultation } from "@/components/business/client-consultation";
import { StitchCard } from "@/components/stitch/stitch-card";
import { StitchBadge } from "@/components/stitch/stitch-badge";

export default function Dashboard() {
  const { data: session, status } = useSession();

  if (status === "loading") return <Loading />;
  if (!session) redirect("/login");

  const userName = session.user?.name || "Client";

  return (
    <>
      <Navbar />
      <div className="relative min-h-screen bg-background overflow-x-hidden">
        {/* Background Radial Glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-primary/10 via-background to-background" />
          <div className="absolute top-[20%] right-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-[150px] -translate-x-1/3" />
        </div>

        <main className="pt-24 pb-16 relative z-10">
          <Container className="space-y-16 sm:space-y-20">

            {/* Authenticated Client Welcome Hero */}
            <SectionWrapper id="home" className="min-h-0 py-8 sm:py-12 p-0">
              <StitchCard glowColor="indigo" className="p-8 sm:p-12 w-full">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="space-y-4 text-center md:text-left flex-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary">
                      <UserCheck className="w-4 h-4" />
                      <span className="text-xs font-semibold">Authenticated Client Workspace</span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
                      Welcome, <span className="text-gradient">{userName}</span>
                    </h1>

                    <p className="text-muted-foreground text-sm sm:text-base max-w-2xl leading-relaxed">
                      Access specialized GenAI &amp; Full Stack engineering services, launch interactive AI tools, or submit custom enterprise project requirements directly.
                    </p>

                    <div className="flex flex-wrap gap-3 pt-2 justify-center md:justify-start">
                      <StitchBadge variant="primary">
                        <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Active Session
                      </StitchBadge>
                      <StitchBadge variant="emerald">
                        IIT Mandi GenAI Certified
                      </StitchBadge>
                      <StitchBadge variant="purple">
                        4+ Years Experience
                      </StitchBadge>
                    </div>
                  </div>

                  {/* Quick Action Navigation */}
                  <div className="grid grid-cols-2 gap-3 w-full md:w-auto shrink-0">
                    <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}>
                      <Briefcase className="w-5 h-5 text-primary" />
                      <span className="text-xs font-semibold">Services Catalog</span>
                    </Button>
                    <Button variant="outline" asChild className="h-auto py-4 flex flex-col items-center gap-2">
                      <Link href="/tools">
                        <Bot className="w-5 h-5 text-blue-500" />
                        <span className="text-xs font-semibold">AI Sandbox</span>
                      </Link>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" onClick={() => document.getElementById("consultation-section")?.scrollIntoView({ behavior: "smooth" })}>
                      <Sparkles className="w-5 h-5 text-purple-500" />
                      <span className="text-xs font-semibold">Book Scoping</span>
                    </Button>
                    <Button variant="outline" asChild className="h-auto py-4 flex flex-col items-center gap-2">
                      <Link href="/projects">
                        <Code className="w-5 h-5 text-emerald-500" />
                        <span className="text-xs font-semibold">Case Studies</span>
                      </Link>
                    </Button>
                  </div>
                </div>
              </StitchCard>
            </SectionWrapper>

            {/* AI Business Tools Launchpad */}
            <SectionWrapper id="tools" className="min-h-0 py-4 px-0">
              <ToolsLaunchpad />
            </SectionWrapper>

            {/* Freelance Services & Client Packages */}
            <SectionWrapper id="services" className="min-h-0 py-4 px-0">
              <ServicesPortal />
            </SectionWrapper>

            {/* Direct Client Consultation & Scope Booking Form */}
            <SectionWrapper id="consultation-section" className="min-h-0 py-4 px-0">
              <ClientConsultation />
            </SectionWrapper>

          </Container>
        </main>
      </div>
    </>
  );
}
