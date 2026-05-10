"use client";

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

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
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

  if (status === "loading") return <p>Loading...</p>;

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-background/70 backdrop-blur-md border-b border-border shadow-sm">
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

          {session ? (
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
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{session.user?.name || "Guest"}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user?.email || "guest@example.com"}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/settings")}>
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-500 cursor-pointer"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    Log out
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
  );
}
