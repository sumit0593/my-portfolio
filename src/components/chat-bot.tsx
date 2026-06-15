"use client";

import { useState, useRef, useEffect } from "react";
import { X, Loader2, AlertCircle } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

const SUGGESTIONS = [
    "Explain Scam Guard AI",
    "Show enterprise experience",
    "Tell me about Kent projects",
    "Explain RAG architecture",
    "What are Sumit's skills?"
];

export function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [input, setInput] = useState("");

    const { messages, status, error, sendMessage, setMessages } = useChat();

    const isLoading = status === "submitted" || status === "streaming";

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const text = input.trim().toLowerCase();
        if (text === "quit" || text === "exit()") {
            setMessages([
                {
                    id: "init-msg",
                    role: "assistant",
                    parts: [
                        { type: "text", text: "Chat memory cleared! How can I help you explore Sumit's portfolio?" }
                    ],
                },
            ]);
            setInput("");
            try {
                await fetch("/api/chat/clear", { method: "POST" });
            } catch (err) {
                console.error("Failed to clear server session:", err);
            }
            return;
        }

        sendMessage({ text: input });
        setInput("");
    };

    const handleSuggestionClick = (suggestion: string) => {
        sendMessage({ text: suggestion });
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        setMessages([
            {
                id: "init-msg",
                role: "assistant",
                parts: [
                    { type: "text", text: "Hi, I am Nova, Sumit's AI Assistant. How can I help you explore his portfolio?" }
                ],
            },
        ]);
    }, [setMessages]);

    // Helper to extract text content from a message's parts
    const getMessageText = (m: (typeof messages)[number]) => {
        if (m.parts && m.parts.length > 0) {
            return m.parts
                .map((p) => (p.type === "text" ? p.text : ""))
                .join("");
        }
        // fallback for legacy content field
        return (m as { content?: string }).content || "";
    };

    return (
        <div className={`fixed z-50 ${isOpen ? "inset-0 md:top-auto md:left-auto md:bottom-6 md:right-6" : "bottom-6 right-6"}`}>
            {isOpen ? (
                <Card className="w-full h-full md:w-96 md:h-[500px] shadow-2xl flex flex-col border-0 md:border border-border bg-card/95 backdrop-blur-xl animate-in slide-in-from-bottom-5 fade-in-50 duration-300 overflow-hidden md:rounded-3xl rounded-none" style={{ opacity: 1 }}>
                    <CardHeader className="p-3 border-b border-border bg-muted/80 flex flex-row items-center justify-between pb-3">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <div className="p-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 overflow-hidden h-7 w-7 flex items-center justify-center shrink-0">
                                <img src="/assets/nova.png" alt="Nova logo" className="h-full w-full object-cover rounded-full" />
                            </div>
                            Nova AI
                        </CardTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full text-muted-foreground hover:bg-black/10 hover:text-foreground transition-colors cursor-pointer"
                            onClick={() => setIsOpen(false)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 flex flex-col bg-background/50 overflow-hidden">
                        <div className="flex-1 overflow-y-auto w-full p-4 space-y-4 custom-scrollbar">
                            {messages.map((m) => (
                                <div
                                    key={m.id}
                                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`p-3 rounded-2xl text-sm max-w-[85%] shadow-sm ${m.role === "user"
                                            ? "bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-br-sm"
                                            : "bg-card border border-border text-foreground rounded-bl-sm"
                                            }`}
                                    >
                                        <div className="prose prose-sm dark:prose-invert max-w-none break-words">
                                            <Markdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                                                {getMessageText(m)}
                                            </Markdown>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {messages.length === 1 && !isLoading && (
                                <div className="flex flex-col gap-2 mt-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <p className="text-xs text-muted-foreground font-medium px-1">Suggested questions:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {SUGGESTIONS.map((s, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleSuggestionClick(s)}
                                                className="text-left text-xs px-3 py-2 rounded-xl bg-muted/50 border border-border/50 text-foreground/80 hover:bg-indigo-500/10 hover:text-indigo-500 hover:border-indigo-500/30 transition-all cursor-pointer shadow-sm"
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-card border border-border text-foreground p-3 rounded-2xl rounded-bl-sm text-sm inline-block shadow-sm">
                                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                    </div>
                                </div>
                            )}
                            {error && (
                                <div className="flex justify-start mt-2">
                                    <div className="bg-destructive/10 text-destructive flex gap-2 items-center p-3 rounded-2xl rounded-bl-sm text-sm inline-block max-w-[85%] shadow-sm">
                                        <AlertCircle className="h-4 w-4 shrink-0" />
                                        <span>
                                            {"I'm having trouble connecting to my brain. Please try again later."}
                                        </span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="p-3 bg-muted/30 border-t border-border">
                            <form onSubmit={handleSubmit} className="flex gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={handleInputChange}
                                    placeholder="Ask anything... (type 'quit' to clear memory)"
                                    disabled={isLoading}
                                    className="flex-1 text-sm rounded-xl border border-input bg-card text-foreground px-4 py-2.5 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 disabled:opacity-50 placeholder:text-muted-foreground"
                                />
                                <Button type="submit" disabled={isLoading} size="icon" className="h-auto w-10 shrink-0 rounded-xl bg-indigo-600 hover:bg-indigo-500 cursor-pointer shadow-sm overflow-hidden p-2.5">
                                    <img src="/assets/nova.png" alt="Send" className="h-full w-full object-contain rounded-full" />
                                </Button>
                            </form>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="relative flex flex-col items-end">
                    {/* Bouncing Tooltip */}
                    <div className="absolute bottom-full mb-4 right-0 hidden md:flex flex-col items-end animate-bounce">
                        <div className="bg-indigo-600 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-3 whitespace-nowrap cursor-pointer hover:scale-105 transition-transform" onClick={() => setIsOpen(true)}>
                            <div className="text-left">
                                <p className="text-sm font-bold leading-none mb-1">Hi there! 👋</p>
                                <p className="text-xs font-medium opacity-90 leading-none">I&apos;m your AI Assistant Nova</p>
                            </div>
                        </div>
                        {/* Pointer Tail */}
                        <div className="w-4 h-4 bg-indigo-600 transform rotate-45 -mt-2 mr-6 -z-10 shadow-lg" />
                    </div>

                    <Button
                        size="icon"
                        className="h-14 w-14 rounded-full shadow-[0_8px_30px_rgb(99,102,241,0.4)] hover:shadow-[0_15px_35px_rgb(99,102,241,0.6)] hover:-translate-y-1.5 hover:rotate-[8deg] bg-indigo-600 hover:bg-indigo-500 hover:scale-105 active:scale-95 border-2 border-indigo-400/30 transition-all duration-300 cursor-pointer text-white overflow-hidden p-1"
                        onClick={() => setIsOpen(true)}
                    >
                        <img src="/assets/nova.png" alt="Nova Chat Bot" className="h-full w-full object-contain rounded-full" />
                    </Button>
                </div>
            )}
        </div>
    );
}
