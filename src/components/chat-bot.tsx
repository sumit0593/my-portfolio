"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Loader2, AlertCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { useChat } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

export function ChatBot() {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [input, setInput] = useState("");


    const { messages, status, error, sendMessage, setMessages } = useChat();

    const isLoading = status === "submitted" || status === "streaming";

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        sendMessage({ text: input });
        setInput("");
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
                    { type: "text", text: "AskNova — AI Assistant for Intelligent Conversations?" }
                ],
            },
        ]);
    }, []);

    if (!session) return null;

    // Helper to extract text content from a message's parts
    const getMessageText = (m: (typeof messages)[number]) => {
        if (m.parts && m.parts.length > 0) {
            return m.parts
                .map((p) => (p.type === "text" ? p.text : ""))
                .join("");
        }
        // fallback for legacy content field
        return (m as any).content || "";
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {isOpen ? (
                <Card className="w-80 shadow-2xl flex flex-col h-[400px] border-border/50 animate-in slide-in-from-bottom-5 fade-in-50 duration-300">
                    <CardHeader className="p-3 border-b border-border/50 bg-muted/50 flex flex-row items-center justify-between pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <MessageCircle className="h-4 w-4 text-primary" />
                            AI Assistant
                        </CardTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-foreground"
                            onClick={() => setIsOpen(false)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="flex-1 p-4 flex flex-col bg-background/50 overflow-hidden">
                        <div className="flex-1 overflow-y-auto w-full mb-4 space-y-3 pr-2 custom-scrollbar">
                            {messages.map((m) => (
                                <div
                                    key={m.id}
                                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`p-3 rounded-lg text-sm max-w-[85%] ${m.role === "user"
                                            ? "bg-primary text-primary-foreground rounded-tr-none"
                                            : "bg-primary/10 text-foreground rounded-tl-none"
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
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-primary/10 text-foreground p-3 rounded-lg rounded-tl-none text-sm inline-block max-w-[85%]">
                                        <Loader2 className="h-4 w-4 animate-spin opacity-50" />
                                    </div>
                                </div>
                            )}
                            {error && (
                                <div className="flex justify-start mt-2">
                                    <div className="bg-destructive/10 text-destructive flex gap-2 items-center p-3 rounded-lg rounded-tl-none text-sm inline-block max-w-[85%]">
                                        <AlertCircle className="h-4 w-4 shrink-0" />
                                        <span>
                                            We are currently down due to traffic. Please wait some
                                            time.
                                        </span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                        <form onSubmit={handleSubmit} className="mt-auto flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={handleInputChange}
                                placeholder="Write your query here..."
                                disabled={isLoading}
                                className="flex-1 text-sm rounded-md border border-input bg-transparent px-3 py-2 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                            />
                            <Button type="submit" disabled={isLoading} size="sm" className="px-3">
                                Send
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            ) : (
                <div className="relative flex flex-col items-end">
                    {/* Bouncing Tooltip with Dancing GIF */}
                    <div className="absolute bottom-full mb-4 right-0 flex flex-col items-end animate-bounce">
                        <div className="bg-primary text-primary-foreground px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-3 whitespace-nowrap cursor-pointer hover:scale-105 transition-transform" onClick={() => setIsOpen(true)}>
                            {/* <img
                                src="https://media.giphy.com/media/13HgwGsXF0aiGY/giphy.gif"
                                alt="Dancing AI"
                                className="w-10 h-10 rounded-full object-cover border-2 border-primary-foreground/30 bg-background"
                            /> */}
                            <div className="text-left">
                                <p className="text-sm font-bold leading-none mb-1">Hi there! 👋</p>
                                <p className="text-xs font-medium opacity-90 leading-none">I'm your AI Assistant Nova</p>
                            </div>
                        </div>
                        {/* Pointer Tail */}
                        <div className="w-4 h-4 bg-primary transform rotate-45 -mt-2 mr-6 -z-10" />
                    </div>

                    <Button
                        size="icon"
                        className="h-14 w-14 rounded-full shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:scale-110 transition-all duration-300"
                        onClick={() => setIsOpen(true)}
                    >
                        <MessageCircle className="h-6 w-6" />
                    </Button>
                </div>
            )}
        </div>
    );
}
