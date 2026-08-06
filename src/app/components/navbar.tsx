"use client";

import { LayoutDashboard, LogOut, Sparkles, User, Code, Bot, Briefcase } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSession, signIn } from "next-auth/react";
import { ThemeToggle } from "@/components/ui/toggle";
import { Container } from "@/components/ui/container";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { SignOutModal } from "@/components/auth/sign-out-modal";
import { motion } from "framer-motion";

const PUBLIC_SECTIONS = [
  { id: "home", label: "Home" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "3D Skills" },
  { id: "showcase", label: "Showcase" },
  { id: "experience", label: "Experience" },
  { id: "contact", label: "Contact" },
];

const DASHBOARD_NAV = [
  { id: "home", label: "Overview", icon: LayoutDashboard },
  { id: "tools", label: "AI Tools", icon: Bot },
  { id: "services", label: "Services", icon: Briefcase },
  { id: "consultation-section", label: "Book Consultation", icon: Sparkles },
];

export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [active, setActive] = useState("home");
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const isDashboard = pathname.startsWith("/dashboard");

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      let current = "home";

      const navItems = isDashboard ? DASHBOARD_NAV : PUBLIC_SECTIONS;
      navItems.forEach(({ id }) => {
        const section = document.getElementById(id);
        if (section && scrollY >= section.offsetTop - 100) {
          current = id;
        }
      });

      setActive(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isDashboard]);

  const firstName = useMemo(
    () => session?.user?.name?.split(" ")?.[0] || "User",
    [session?.user?.name]
  );

  return (
    <>
      <header className="fixed top-3 left-0 right-0 z-50 px-4 md:px-8 max-w-7xl mx-auto pointer-events-none">
        <div className="w-full stitch-glass border border-white/10 dark:border-white/10 rounded-2xl md:rounded-full shadow-2xl backdrop-blur-xl pointer-events-auto px-4 py-2.5 transition-all duration-300">
          <div className="flex justify-between items-center">
            
            {/* Brand Logo */}
            <Link
              href="/"
              className="text-lg sm:text-xl font-extrabold tracking-tight flex items-center gap-2 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-sky-400 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-foreground font-bold">
                Nova<span className="text-gradient">Sphere AI</span>
              </span>
            </Link>

            {/* Nav Links */}
            <nav className="hidden lg:flex items-center gap-1 bg-muted/30 p-1 rounded-full border border-border/40">
              {!isDashboard ? (
                PUBLIC_SECTIONS.map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => {
                      if (pathname !== "/") {
                        router.push(`/#${id}`);
                      } else {
                        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
                        setActive(id);
                      }
                    }}
                    className={cn(
                      "relative px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 select-none",
                      active === id
                        ? "text-primary font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {active === id && (
                      <motion.div
                        layoutId="activeNavPill"
                        className="absolute inset-0 bg-background rounded-full border border-primary/20 shadow-sm -z-10"
                        transition={{ type: "spring", stiffness: 350, damping: 28 }}
                      />
                    )}
                    {label}
                  </button>
                ))
              ) : (
                DASHBOARD_NAV.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => {
                      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
                      setActive(id);
                    }}
                    className={cn(
                      "relative px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 select-none",
                      active === id
                        ? "text-primary font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {active === id && (
                      <motion.div
                        layoutId="activeNavPill"
                        className="absolute inset-0 bg-background rounded-full border border-primary/20 shadow-sm -z-10"
                        transition={{ type: "spring", stiffness: 350, damping: 28 }}
                      />
                    )}
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                ))
              )}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle />

              {status === "loading" ? (
                <div className="h-8 w-8 rounded-full border-2 border-primary/50 border-t-primary animate-spin shadow-sm" />
              ) : session ? (
                <div className="flex items-center gap-2">
                  {!isDashboard && (
                    <Button size="sm" variant="default" asChild className="hidden sm:flex rounded-full text-xs font-semibold gap-1.5">
                      <Link href="/dashboard">
                        <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                      </Link>
                    </Button>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                        <Avatar className="h-9 w-9 border border-primary/30 shadow-sm hover:scale-105 transition-transform">
                          <AvatarImage src={session.user?.image || ""} alt="profile" />
                          <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {firstName?.[0]?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-60 p-2 rounded-2xl shadow-2xl border-border/50 bg-card/95 backdrop-blur-xl" align="end">
                      <DropdownMenuLabel className="font-normal px-2 py-1.5">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-bold text-foreground leading-none">{session.user?.name || "Client"}</p>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{session.user?.email || "guest@example.com"}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="my-1 bg-border/50" />
                      <DropdownMenuItem
                        className="flex items-center gap-2 cursor-pointer rounded-xl px-2.5 py-2 hover:bg-muted font-medium text-xs"
                        onClick={() => router.push("/dashboard")}
                      >
                        <LayoutDashboard className="w-4 h-4 text-primary" />
                        <span>Client Dashboard</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex items-center gap-2 cursor-pointer rounded-xl px-2.5 py-2 hover:bg-muted font-medium text-xs"
                        onClick={() => router.push("/")}
                      >
                        <Code className="w-4 h-4 text-indigo-500" />
                        <span>Public Portfolio</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="my-1 bg-border/50" />
                      <DropdownMenuItem
                        className="flex items-center gap-2 text-red-500 cursor-pointer rounded-xl px-2.5 py-2 hover:bg-red-500/10 font-medium text-xs"
                        onClick={() => setIsSignOutModalOpen(true)}
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => router.push("/login?callbackUrl=/dashboard")}
                  className="rounded-full text-xs font-semibold px-4 py-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-md hover:shadow-lg transition-all"
                >
                  <User className="w-3.5 h-3.5 mr-1" /> Sign In
                </Button>
              )}
            </div>

          </div>
        </div>
      </header>

      <SignOutModal
        isOpen={isSignOutModalOpen}
        onClose={() => setIsSignOutModalOpen(false)}
      />
    </>
  );
}
