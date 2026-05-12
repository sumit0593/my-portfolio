"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, AlertCircle, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

interface SignOutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SignOutModal({ isOpen, onClose }: SignOutModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut({ callbackUrl: "/" });
    } catch (error) {
      console.error("Failed to sign out", error);
      setIsLoading(false);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !isLoading && onClose()}
            aria-hidden="true"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 300,
              duration: 0.2 
            }}
            className="relative w-full max-w-md bg-card border border-border shadow-2xl rounded-2xl overflow-hidden flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sign-out-title"
            aria-describedby="sign-out-description"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              disabled={isLoading}
              className="absolute top-4 right-4 p-1.5 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 sm:p-8 flex flex-col items-center text-center">
              {/* Icon Container */}
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6 relative">
                <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full" />
                <AlertCircle className="w-8 h-8 text-red-500 relative z-10" />
              </div>

              {/* Text Content */}
              <h2 id="sign-out-title" className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                Sign Out?
              </h2>
              <p id="sign-out-description" className="text-sm sm:text-base text-muted-foreground mb-8">
                Are you sure you want to sign out of your account? You will need to log in again to access the dashboard.
              </p>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row w-full gap-3 sm:gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={onClose}
                  disabled={isLoading}
                  className="w-full sm:w-1/2 font-medium"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={handleSignOut}
                  disabled={isLoading}
                  className="w-full sm:w-1/2 font-medium relative overflow-hidden group"
                >
                  <span className={`flex items-center gap-2 ${isLoading ? "opacity-0" : "opacity-100"}`}>
                    <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1 group-active:-translate-x-1" />
                    Sign Out
                  </span>
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin" />
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
