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
      className={`flex items-center justify-center p-4 sm:p-8 md:p-12 ${className}`}
    >
      {children}
    </section>
  );
}
