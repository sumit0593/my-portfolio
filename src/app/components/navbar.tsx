"use client";

import { LayoutDashboard, Settings, LogOut } from "lucide-react";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSession, signOut, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
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

const sections = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "gallery", label: "Gallery" },
  { id: "contact", label: "Contact" },
];

export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [active, setActive] = useState("home");
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [status, router]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      let current = "home";

      sections.forEach(({ id }) => {
        const section = document.getElementById(id);
        if (section && scrollY >= section.offsetTop - 80) {
          current = id;
        }
      });

      setActive(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const firstName = useMemo(
    () => session?.user?.name?.split(" ")?.[0] || "User",
    [session?.user?.name]
  );

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-md border-b border-border shadow-sm">
      <Container className="flex justify-between items-center py-3">
        {/* Left Logo */}
        <Link
          href="/dashboard"
          className="text-2xl font-bold cursor-pointer transition-colors hover:text-primary"
          onClick={(e) => {
            if (window.location.pathname === "/dashboard") {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
              setActive("home");
            }
          }}
        >
          Sumit Kumar
        </Link>

        {/* Center Navigation */}
        <div className="hidden md:flex gap-1 items-center">
          {sections.map(({ id, label }) => (
            <Button
              key={id}
              variant={active === id ? "default" : "ghost"}
              className={cn(
                "relative transition-colors px-4 py-2 rounded-lg text-sm font-medium",
                "hover:bg-primary/10 hover:text-primary"
              )}
              onClick={() => {
                if (window.location.pathname !== "/dashboard") {
                  router.push(`/dashboard#${id}`);
                } else {
                  document
                    .getElementById(id)
                    ?.scrollIntoView({ behavior: "smooth" });
                  setActive(id);
                }
              }}
            >
              {label}
              {active === id && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-[2px] rounded-full bg-primary" />
              )}
            </Button>
          ))}
          <div className="h-4 w-px bg-border mx-2" />
          <Button variant="ghost" asChild className="hover:text-primary hover:bg-primary/10">
            <Link href="/tools">AI Tools</Link>
          </Button>
          <Button variant="ghost" asChild className="hover:text-primary hover:bg-primary/10">
            <Link href="/services">Services</Link>
          </Button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle /> {/* ✅ Theme toggle button here */}

          {status === "loading" ? (
            <div className="h-9 w-9 rounded-full border-2 border-primary/50 border-t-primary animate-spin shadow-sm" />
          ) : session ? (
            <>
              <span className="hidden sm:block text-sm font-medium">
                Welcome, {firstName} 🎉
              </span>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9 border shadow-sm transition-transform hover:scale-105">
                      <AvatarImage src={session.user?.image || ""} alt="profile" />
                      <AvatarFallback>
                        {firstName?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 p-2 rounded-2xl shadow-xl border-border/50 bg-card/95 backdrop-blur-md" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal px-2 py-1.5">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold leading-none">{session.user?.name || "Guest"}</p>
                      <p className="text-xs leading-none text-muted-foreground mt-1">
                        {session.user?.email || "guest@example.com"}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="my-2 bg-border/50" />
                  <DropdownMenuItem 
                    className="flex items-center gap-2 cursor-pointer rounded-xl px-2 py-2 hover:bg-muted focus:bg-muted transition-colors"
                    onClick={() => router.push("/dashboard")}
                  >
                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                      <LayoutDashboard className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-sm">Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="flex items-center gap-2 cursor-pointer rounded-xl px-2 py-2 hover:bg-muted focus:bg-muted transition-colors mt-1"
                    onClick={() => router.push("/settings")}
                  >
                    <div className="p-1.5 rounded-lg bg-muted text-muted-foreground">
                      <Settings className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-sm">Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-2 bg-border/50" />
                  <DropdownMenuItem
                    className="flex items-center gap-2 text-red-600 focus:text-red-500 cursor-pointer rounded-xl px-2 py-2 hover:bg-red-50 focus:bg-red-50 dark:hover:bg-red-500/10 dark:focus:bg-red-500/10 transition-colors"
                    onClick={() => {
                      setIsSignOutModalOpen(true);
                    }}
                  >
                    <div className="p-1.5 rounded-lg bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-500">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-sm">Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button
              size="sm"
              onClick={() => signIn(undefined, { callbackUrl: "/dashboard" })}
              className="hover:bg-green-100 hover:text-green-600"
            >
              Sign In
            </Button>
          )}
        </div>
      </Container>
      </nav>

      <SignOutModal 
        isOpen={isSignOutModalOpen} 
        onClose={() => setIsSignOutModalOpen(false)} 
      />
    </>
  );
}
