"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { BriefcaseBusiness, Calendar, MapPin } from "lucide-react";

const EXPERIENCES = [
  {
    year: "Apr 2024 - Present",
    role: "Software Engineer",
    company: "Kent RO Systems Pvt Ltd",
    location: "Noida, India",
    description: "Engineered an AI-driven OCR invoice parsing microservice using AWS (Textract, Lambda, DynamoDB) and Node.js. Built browser automation using Playwright, a custom HTML scraper, and a text extractor to automate client data. Developed custom tools on MCP servers to automate software engineering tasks. Implemented secure JWT/OAuth2 RBAC and dynamic Zoho Analytics dashboards.",
    skills: ["Node.js", "React", "AWS", "Playwright", "MCP", "Web Scraping", "JWT", "OAuth2", "Zoho Analytics", "GitHub Actions", "DynamoDB", "Lambda"]
  },
  {
    year: "Aug 2023 - Mar 2024",
    role: "Associate Software Developer",
    company: "TechnoIdentity",
    location: "Hyderabad, India",
    description: "Spearheaded the legacy-to-modern migration of an enterprise HRMS platform using Next.js and TypeScript. Developed scalable MERN-stack UI components for the US Toll Authority (Hectare). Established robust CI/CD testing pipelines using Cypress and Playwright.",
    skills: ["Next.js", "MERN Stack", "TypeScript", "Cypress", "Playwright"]
  }
];

export function ExperienceSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "center center"],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section ref={containerRef} className="relative w-full bg-background py-32 px-4 md:px-0 overflow-hidden">
      <div className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 backdrop-blur-md">
            <span className="text-sm font-medium text-indigo-300 tracking-wide">
              My journey building enterprise scalable systems (Aug 2023 - Present)
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-4">
            Professional Experience
          </h2>
        </div>

        <div className="relative">
          {/* Central Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-[2px] bg-border -translate-x-1/2" />

          <motion.div
            className="absolute left-8 md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-500 -translate-x-1/2 origin-top"
            style={{ scaleY: lineHeight }}
          />

          {EXPERIENCES.map((exp, index) => (
            <div
              key={index}
              className={`relative flex items-center justify-between mb-16 md:mb-24 ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} flex-col w-full`}
            >
              {/* Timeline Dot */}
              <div className="absolute left-8 md:left-1/2 w-6 h-6 rounded-full bg-background border-4 border-indigo-500 -translate-x-1/2 z-10 shadow-[0_0_15px_rgba(79,70,229,0.8)]" />

              <div className="hidden md:block md:w-[45%]" />

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className={`w-full md:w-[45%] pl-20 md:pl-0 ${index % 2 === 0 ? "md:text-right md:pr-12" : "md:text-left md:pl-12"}`}
              >
                <div className="p-8 rounded-3xl glass hover:border-indigo-500/30 transition-all duration-300 shadow-xl group">
                  <div className={`flex items-center gap-2 mb-3 text-indigo-400 font-mono text-sm tracking-wider ${index % 2 === 0 ? "md:justify-end" : "md:justify-start"}`}>
                    <Calendar className="w-4 h-4" />
                    <span>{exp.year}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2 group-hover:text-indigo-400 transition-colors">{exp.role}</h3>

                  <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-4 text-muted-foreground font-medium ${index % 2 === 0 ? "md:justify-end" : "md:justify-start"}`}>
                    <div className="flex items-center gap-1.5">
                      <BriefcaseBusiness className="w-4 h-4" />
                      <span>{exp.company}</span>
                    </div>
                    <div className="hidden sm:block w-1 h-1 rounded-full bg-muted-foreground/50" />
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      <span>{exp.location}</span>
                    </div>
                  </div>

                  <p className="text-muted-foreground font-light leading-relaxed mb-6">
                    {exp.description}
                  </p>

                  {/* Skills tags */}
                  <div className={`flex flex-wrap gap-2 ${index % 2 === 0 ? "md:justify-end" : "md:justify-start"}`}>
                    {exp.skills.map(skill => (
                      <span key={skill} className="px-3 py-1 text-xs font-medium rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
