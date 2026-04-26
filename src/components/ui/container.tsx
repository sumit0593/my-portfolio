import { cn } from "@/lib/utils";

export function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-10",
        className
      )}
    >
      {children}
    </div>
  );
}
