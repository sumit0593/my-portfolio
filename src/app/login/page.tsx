"use client";

import { GalleryVerticalEnd } from "lucide-react"
import { Suspense } from "react";
import Link from "next/link";

import { LoginForm } from "@/components/auth/login-form"
import { ThemeToggle } from "@/components/ui/toggle"

export default function LoginPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 relative">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link href="/" className="flex items-center gap-2 self-center font-medium cursor-pointer">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-4" />
          </div>
          Showcase Hub.
        </Link>
        <Suspense fallback={<div className="text-center text-sm text-muted-foreground">Loading form...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
