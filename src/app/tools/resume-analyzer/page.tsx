"use client";

import { useState } from "react";
import { Loader2, ArrowLeft, FileSearch, CheckCircle2, Lock } from "lucide-react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeSanitize from "rehype-sanitize";
import Link from "next/link";
import Navbar from "@/app/components/navbar";
import { Container } from "@/components/ui/container";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function ResumeAnalyzer() {
  const { data: session, status } = useSession();
  const [jd, setJd] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const analyzeResume = async () => {
    if (!session) return;
    setIsLoading(true);
    setResponse("");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jd, tool: "resume-analyzer" }),
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
      setResponse("An error occurred while analyzing the resume.");
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
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-500 mb-6">
              <FileSearch className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              AI Resume Analyzer
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Paste a Job Description below to see how well my resume matches the role. The AI will generate an ATS score and identify key strengths and gaps.
            </p>
          </div>

          <div className="bg-card border rounded-3xl p-6 md:p-8 shadow-sm mb-8 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <label className="block text-sm font-medium mb-2">Job Description</label>
              <textarea
                className="w-full h-48 p-4 bg-muted/50 border rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
                placeholder="Paste the target job description here..."
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
                    onClick={analyzeResume}
                    disabled={isLoading || !jd.trim()}
                    className="w-full sm:w-auto font-semibold px-8"
                  >
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {isLoading ? "Analyzing Match..." : "Analyze Match"}
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
            <div className="bg-card border rounded-3xl p-6 md:p-10 shadow-lg animate-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 border-b pb-4">
                <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm">AI</span>
                Analysis Results
              </h3>
              <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-a:text-primary hover:prose-a:text-primary/80 prose-strong:text-foreground prose-ul:list-disc prose-ol:list-decimal">
                <Markdown remarkPlugins={[remarkGfm, remarkBreaks]} rehypePlugins={[rehypeSanitize]}>
                  {response}
                </Markdown>
              </div>
            </div>
          )}
        </Container>
      </div>
    </>
  );
}