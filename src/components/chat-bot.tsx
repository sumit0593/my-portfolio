"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Loader2, AlertCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { useChat } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import Markdown from "react-markdown";

export function ChatBot() {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [input, setInput] = useState("");

    const { messages, status, error, sendMessage, stop } = useChat({
        messages: [
            {
                id: 'init-msg',
                role: 'assistant',
                parts: [{ type: 'text', text: `Hi ${session?.user?.name?.split(' ')?.[0] || 'there'}! I am Sumit's AI Assistant. How can I help you today?` }]
            }
        ] as import("ai").UIMessage[]
    });

    const isLoading = status === 'submitted' || status === 'streaming';

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        sendMessage({ id: Date.now().toString(), role: 'user', parts: [{ type: 'text', text: input }] });
        setInput("");
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    if (!session) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {isOpen ? (
                <Card className="w-80 shadow-2xl flex flex-col h-[400px] border-border/50 animate-in slide-in-from-bottom-5 fade-in-50 duration-300">
                    <CardHeader className="p-3 border-b border-border/50 bg-muted/50 flex flex-row items-center justify-between pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <MessageCircle className="h-4 w-4 text-primary" />
                            AI Assistant
                        </CardTitle>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => setIsOpen(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="flex-1 p-4 flex flex-col bg-background/50 overflow-hidden">

                        <div className="flex-1 overflow-y-auto w-full mb-4 space-y-3 pr-2 custom-scrollbar">
                            {messages.map(m => (
                                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`p-3 rounded-lg text-sm max-w-[85%] ${m.role === 'user'
                                        ? 'bg-primary text-primary-foreground rounded-tr-none'
                                        : 'bg-primary/10 text-foreground rounded-tl-none'
                                        }`}>
                                        <div className="prose prose-sm dark:prose-invert max-w-none break-words">
                                            <Markdown
                                                remarkPlugins={[remarkGfm, remarkBreaks]}
                                            >
                                                {m.parts?.length ? m.parts.map((p) => p.type === "text" ? p.text : "").join("") : (m as any).content || ""}
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
                                        <span>we are currenlty down due to traffice Please wait some time</span>
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
                            <Button type="submit" disabled={isLoading} size="sm" className="px-3">Send</Button>
                        </form>
                    </CardContent>
                </Card>
            ) : (
                <Button
                    size="icon"
                    className="h-14 w-14 rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105 transition-all duration-300"
                    onClick={() => setIsOpen(true)}
                >
                    <MessageCircle className="h-6 w-6" />
                </Button>
            )}
        </div>
    );
}
