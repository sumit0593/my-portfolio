"use client";

import { useState } from "react";
import { Loader2, ArrowLeft, CheckCircle2, Lock, LucideIcon } from "lucide-react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeSanitize from "rehype-sanitize";
import Link from "next/link";
import Navbar from "@/app/components/navbar";
import { Container } from "@/components/ui/container";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

interface ToolLayoutProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  placeholder: string;
  toolId: string;
  buttonText: string;
  buttonLoadingText: string;
}

export default function ToolLayout({
  title,
  description,
  icon: Icon,
  iconColor,
  iconBg,
  placeholder,
  toolId,
  buttonText,
  buttonLoadingText
}: ToolLayoutProps) {
  const { data: session, status } = useSession();
  const [jd, setJd] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const executeTool = async () => {
    if (!session) return;
    setIsLoading(true);
    setResponse("");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jd, tool: toolId }),
      });

      if (!res.ok) {
        if (res.status === 429) {
            setResponse("Rate limit exceeded. Please try again later.");
            return;
        }
        throw new Error("Network response was not ok");
      }

      if (res.headers.get("Content-Type")?.includes("application/json")) {
        const data = await res.json();
        setResponse(data.result);
      } else {
        const reader = res.body?.getReader();
        if (!reader) return;

        const decoder = new TextDecoder();
        let done = false;

        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          const chunkValue = decoder.decode(value, { stream: true });
          setResponse((prev) => prev + chunkValue);
        }
      }
    } catch {
      setResponse("An error occurred while generating the response.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background pt-24 pb-16">
        <Container className="max-w-4xl">
          <Link
            href="/tools"
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Tools
          </Link>

          <div className="text-center mb-12">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${iconBg} ${iconColor} mb-6`}>
              <Icon className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              {title}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {description}
            </p>
          </div>

          <div className="bg-card border rounded-3xl p-6 md:p-8 shadow-sm mb-8 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <label className="block text-sm font-medium mb-2">Input Details</label>
              <textarea
                className="w-full h-48 p-4 bg-muted/50 border rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
                placeholder={placeholder}
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                disabled={isLoading || status !== "authenticated"}
              />

              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" /> Powered by Gemini Pro
                </p>
                
                {status === "authenticated" ? (
                  <Button
                    size="lg"
                    onClick={executeTool}
                    disabled={isLoading || !jd.trim()}
                    className="w-full sm:w-auto font-semibold px-8"
                  >
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {isLoading ? buttonLoadingText : buttonText}
                  </Button>
                ) : (
                  <Button size="lg" disabled variant="secondary" className="w-full sm:w-auto gap-2">
                    <Lock className="w-4 h-4" /> Sign in to use
                  </Button>
                )}
              </div>
            </div>
          </div>

          {response && (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              {/* AI Response Header */}
              <div className="flex items-center gap-3 mb-3 px-1">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-md">
                  AI
                </div>
                <span className="text-sm font-semibold text-foreground">Nova AI Response</span>
                <div className="h-px flex-1 bg-border/50" />
              </div>
              {/* Response bubble styled like chatbot */}
              <div className="bg-card border border-border rounded-2xl rounded-tl-sm p-6 md:p-8 shadow-lg">
                <div className="prose prose-slate dark:prose-invert max-w-none text-sm md:text-base prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-a:text-primary hover:prose-a:text-primary/80 prose-strong:text-foreground prose-ul:list-disc prose-ol:list-decimal break-words">
                  <Markdown remarkPlugins={[remarkGfm, remarkBreaks]} rehypePlugins={[rehypeSanitize]}>
                    {response}
                  </Markdown>
                </div>
              </div>
            </div>
          )}
        </Container>
      </div>
    </>
  );
}
