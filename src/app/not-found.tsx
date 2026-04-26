"use client";

import { Button } from "@/components/ui/button";
import NotFoundAnimation from "@/components/ui/not-found-animation";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <NotFoundAnimation />
      <h1 className="text-3xl font-bold mt-6">Page Not Found</h1>
      <p className="text-muted-foreground mb-6">
        Oops! The page you’re looking for doesn’t exist.
      </p>
      <Button variant="outline" asChild>
        <Link href="/">Go Home</Link>
      </Button>
    </div>
  );
}

