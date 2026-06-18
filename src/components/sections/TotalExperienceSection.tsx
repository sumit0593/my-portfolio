"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Briefcase, BrainCircuit, Code2, Building2 } from "lucide-react";

function AnimatedCounter({ value, duration = 2 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = value;
      const totalMiliseconds = duration * 1000;
      const incrementTime = totalMiliseconds / end;

      const timer = setInterval(() => {
        start += 1;
        setCount(start);
        if (start === end) clearInterval(timer);
      }, incrementTime);

      return () => clearInterval(timer);
    }
  }, [value, duration, isInView]);

  return <span ref={ref}>{count}</span>;
}

const STATS = [
  {
    id: 1,
    label: "Years Total Experience",
    value: 4,
    icon: Briefcase,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    id: 2,
    label: "Years GenAI Experience",
    value: 2,
    icon: BrainCircuit,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    id: 3,
    label: "Years Full-Stack Experience",
    value: 3,
    icon: Code2,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    id: 4,
    label: "Enterprise Projects",
    value: 10,
    icon: Building2,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
];

export function TotalExperienceSection() {
  return (
    <section className="relative w-full py-10 md:py-16 lg:py-20 bg-background overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
          {STATS.map((stat, index) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col items-center justify-center text-center p-6 rounded-2xl glass hover:bg-card/80 transition-colors"
            >
              <div className={`p-4 rounded-xl ${stat.bg} mb-4`}>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
              <h3 className="text-4xl md:text-5xl font-extrabold text-foreground mb-2 flex items-center justify-center">
                <AnimatedCounter value={stat.value} />
                <span className={stat.color}>+</span>
              </h3>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
