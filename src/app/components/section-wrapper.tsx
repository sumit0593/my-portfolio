import { ReactNode } from "react";

interface SectionWrapperProps {
  id: string;
  children: ReactNode;
  className?: string;
}

export default function SectionWrapper({ id, children, className }: SectionWrapperProps) {
  return (
    <section
      id={id}
      className={`min-h-screen flex items-center justify-center p-12 ${className}`}
    >
      {children}
    </section>
  );
}
