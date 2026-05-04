"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const EXPERIENCES = [
  {
    year: "Apr 2024 - Present",
    role: "Software Engineer",
    company: "Kent RO Systems Pvt Ltd",
    description: "Integrated OCR-based invoice parsing to automate data extraction, implemented NGINX load balancing, built secure JWT/OAuth2 authentication, and integrated dynamic Zoho Analytics dashboards.",
  },
  {
    year: "Aug 2023 - Mar 2024",
    role: "Associate Software Developer",
    company: "TechnoIdentity",
    description: "Revamped HRMS platform using Next.js and TypeScript improving UI performance. Developed scalable UI components for the Hectare platform and automated end-to-end test cases using Cypress and Playwright.",
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
    <section ref={containerRef} className="relative w-full bg-background py-32 px-4 md:px-0">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-20 text-center">
          Experience Timeline
        </h2>

        <div className="relative">
          {/* Central Line */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-[2px] bg-border -translate-x-1/2" />
          
          <motion.div 
            className="absolute left-6 md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-500 -translate-x-1/2 origin-top"
            style={{ scaleY: lineHeight }}
          />

          {EXPERIENCES.map((exp, index) => (
            <div 
              key={index}
              className={`relative flex items-center justify-between mb-16 md:mb-24 ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} flex-col w-full`}
            >
              {/* Timeline Dot */}
              <div className="absolute left-6 md:left-1/2 w-5 h-5 rounded-full bg-background border-4 border-indigo-500 -translate-x-1/2 z-10 shadow-[0_0_15px_rgba(79,70,229,1)]" />

              <div className="hidden md:block md:w-[45%]" />
              
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className={`w-full md:w-[45%] pl-16 md:pl-0 ${index % 2 === 0 ? "md:text-right md:pr-12" : "md:text-left md:pl-12"}`}
              >
                <div className="p-8 rounded-2xl bg-card/50 border border-border backdrop-blur-sm hover:border-indigo-500/30 transition-colors shadow-xl">
                  <span className="text-indigo-400 font-mono text-sm tracking-wider mb-3 block">
                    {exp.year}
                  </span>
                  <h3 className="text-2xl font-bold text-foreground mb-2">{exp.role}</h3>
                  <h4 className="text-lg text-muted-foreground font-medium mb-4">{exp.company}</h4>
                  <p className="text-muted-foreground font-light leading-relaxed">
                    {exp.description}
                  </p>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
