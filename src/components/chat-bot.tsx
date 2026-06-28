"use client";

import { useState, useRef, useEffect } from "react";
import { X, Loader2, AlertCircle, Sparkles, Maximize2, Minimize2, Info } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useSession, signIn } from "next-auth/react";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeSanitize from "rehype-sanitize";

type Category = {
    id: string;
    label: string;
    icon: string;
    title: string;
    description: string;
    questions: string[];
};

const CATEGORIES: Category[] = [
    {
        id: "education",
        label: "🎓 Education",
        icon: "🎓",
        title: "🎓 Education & Academic History",
        description: "Explore Sumit's university degrees and educational qualifications.",
        questions: [
            "Where did Sumit study?",
            "Tell me about his MTech in Computer Science.",
            "What did he study at Monad University?",
            "Where did he study Mechanical Engineering?",
        ]
    },
    {
        id: "experience",
        label: "💼 Experience",
        icon: "💼",
        title: "💼 Experience & Timeline",
        description: "Review Sumit's roles, company timelines, and professional journey.",
        questions: [
            "What was his role at Kent RO Systems?",
            "What projects did he do at TechnoIdentity?",
            "Tell me about his work at Kent RO.",
            "Show me his professional timeline.",
        ]
    },
    {
        id: "projects",
        label: "🚀 Projects",
        icon: "🚀",
        title: "🚀 Explore Projects & Architecture",
        description: "Discover AI systems, full-stack applications, enterprise solutions, and workflows built by Sumit.",
        questions: [
            "Tell me about HireFlow AI.",
            "Explain the architecture of Scam Detection AI.",
            "Which project demonstrates LangGraph?",
            "What RAG systems has he built?",
            "Show me his enterprise projects.",
            "What is his most challenging project?",
            "Which projects use multi-agent systems?",
        ]
    },
    {
        id: "skills",
        label: "🛠 Skills",
        icon: "🛠",
        title: "🛠 Technical Skills & Tools",
        description: "Explore the technologies, languages, and tools Sumit is skilled in.",
        questions: [
            "What are his full-stack core skills?",
            "Does he know Next.js and React?",
            "What vector databases does he use?",
            "Show me his Deployment & MLOps tools.",
        ]
    },
    {
        id: "genai",
        label: "🤖 GenAI Expertise",
        icon: "🤖",
        title: "🤖 GenAI & LLM Expertise",
        description: "Learn about Sumit's deep experience with LLMs, RAG, and AI agent frameworks.",
        questions: [
            "What is his experience with LLMs?",
            "Explain his RAG architecture expertise.",
            "Which LLM models has he worked with?",
            "What agentic frameworks does he know?",
            "Has he built Multi-Agent Systems?",
        ]
    },
    {
        id: "certifications",
        label: "📜 Certifications",
        icon: "📜",
        title: "📜 Academic & Pro Certifications",
        description: "View credentials earned by Sumit from institutions like IIT Mandi and Newton School.",
        questions: [
            "Tell me about his IIT Mandi certification.",
            "Do you have a Prompt Engineering certificate?",
            "Tell me about his Newton School certificate.",
            "Show me his RAG Engineering certification.",
        ]
    },
    {
        id: "achievements",
        label: "🏆 Achievements",
        icon: "🏆",
        title: "🏆 Milestones & Achievements",
        description: "Check key career milestones, automation deliverables, and performance metrics.",
        questions: [
            "What are his key achievements?",
            "Show me his software automation achievements.",
            "What security achievements does he have?",
        ]
    },
    {
        id: "contact",
        label: "📞 Contact",
        icon: "📞",
        title: "📞 Get In Touch",
        description: "Find contact links, email, phone numbers, and messaging avenues.",
        questions: [
            "How can I contact Sumit?",
            "Can you share Sumit's LinkedIn or GitHub?",
            "What is Sumit's phone number or email?",
            "Send a message to Sumit.",
            "Get Sumit's Resume",
            "Connect with Sumit (Get link & send message)",
        ]
    }
];

export function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [isEnlarged, setIsEnlarged] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [input, setInput] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const { messages, status, error, sendMessage, setMessages } = useChat();

    const { data: session } = useSession();
    const isAuthenticated = !!session?.user;

    const isLoading = status === "submitted" || status === "streaming";
    const userMessageCount = messages.filter((m) => m.role === "user").length;
    const isLimitReached = !isAuthenticated && userMessageCount >= 4 && !isLoading;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || isLimitReached) return;

        const text = input.trim().toLowerCase();
        if (text === "quit" || text === "exit") {
            if (typeof window !== "undefined") {
                localStorage.removeItem("nova_chat_messages");
            }
            setMessages([
                {
                    id: "init-msg",
                    role: "assistant",
                    parts: [
                        { type: "text", text: "Chat memory cleared! How can I help you explore Sumit's portfolio?" }
                    ],
                },
            ]);
            setSelectedCategory(null);
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
        if (isLimitReached) return;
        sendMessage({ text: suggestion });
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Save messages to localStorage
    useEffect(() => {
        if (typeof window !== "undefined" && messages.length > 0) {
            localStorage.setItem("nova_chat_messages", JSON.stringify(messages));
        }
    }, [messages]);

    // Load messages from localStorage on mount
    useEffect(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("nova_chat_messages");
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        setMessages(parsed);
                        return;
                    }
                } catch (e) {
                    console.error("Failed to parse saved chat messages:", e);
                }
            }
        }
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

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

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
        <div className={`fixed z-50 ${isOpen ? (isEnlarged ? "inset-0 md:inset-6" : "inset-0 md:top-auto md:left-auto md:bottom-6 md:right-6") : "bottom-6 right-6"}`}>
            {isOpen ? (
                <Card className={`w-full h-full shadow-2xl flex flex-col border-0 md:border border-border bg-card/95 backdrop-blur-xl animate-in slide-in-from-bottom-5 fade-in-50 duration-300 overflow-hidden rounded-none md:rounded-3xl ${isEnlarged ? "md:w-full md:h-full" : "md:w-96 md:h-[500px]"}`} style={{ opacity: 1 }}>
                    <CardHeader className="p-3 border-b border-border bg-muted/80 flex flex-row items-center justify-between pb-3">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <div className="p-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 overflow-hidden h-7 w-7 flex items-center justify-center shrink-0">
                                <img src="/assets/nova.png" alt="Nova logo" className="h-full w-full object-cover rounded-full" />
                            </div>
                            Nova AI
                        </CardTitle>
                        <div className="flex items-center gap-1.5 shrink-0">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-full text-indigo-500 dark:text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-300 transition-all cursor-pointer hidden md:flex items-center justify-center border border-indigo-500/20 bg-indigo-500/5 hover:border-indigo-500/40"
                                onClick={() => setIsEnlarged(!isEnlarged)}
                            >
                                {isEnlarged ? (
                                    <Minimize2 className="h-4 w-4" />
                                ) : (
                                    <Maximize2 className="h-4 w-4" />
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-full text-red-500 dark:text-red-400 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-300 transition-all cursor-pointer flex items-center justify-center border border-red-500/20 bg-red-500/5 hover:border-red-500/40"
                                onClick={() => {
                                    setIsOpen(false);
                                    setIsEnlarged(false);
                                }}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
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
                                            <Markdown
                                                remarkPlugins={[remarkGfm, remarkBreaks]}
                                                rehypePlugins={[rehypeSanitize]}
                                                components={{
                                                    a: ({ href, children, ...props }) => {
                                                        if (!href) {
                                                            return <a {...props}>{children}</a>;
                                                        }
                                                        const isResume = href.toLowerCase().includes("resume") && (
                                                            href.toLowerCase().endsWith(".pdf") ||
                                                            href.toLowerCase().endsWith(".docx") ||
                                                            href.toLowerCase().includes("pdf") ||
                                                            href.toLowerCase().includes("docx")
                                                        );
                                                        if (isResume) {
                                                            const isPdf = href?.toLowerCase().includes("pdf");
                                                            const isDocx = href?.toLowerCase().includes("docx") || href?.toLowerCase().includes("doc");
                                                            const label = isPdf ? "Download Resume (PDF)" : isDocx ? "Download Resume (DOCX)" : "Download Resume";
                                                            return (
                                                                <a
                                                                    href={href}
                                                                    download
                                                                    className="inline-flex items-center gap-2 px-4 py-2 mt-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all duration-200 shadow-md hover:shadow-lg no-underline cursor-pointer text-xs"
                                                                    {...props}
                                                                >
                                                                    <span>📥 {label}</span>
                                                                </a>
                                                            );
                                                        }

                                                        const isLinkedIn = href?.toLowerCase().includes("linkedin.com");
                                                        if (isLinkedIn) {
                                                            return (
                                                                <a
                                                                    href={href}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-2 px-4 py-2 mt-2 rounded-xl bg-[#0077b5] hover:bg-[#0077b5]/90 text-white font-semibold transition-all duration-200 shadow-md hover:shadow-lg no-underline cursor-pointer text-xs"
                                                                    {...props}
                                                                >
                                                                    <span>🔗 LinkedIn Profile</span>
                                                                </a>
                                                            );
                                                        }

                                                        const isGitHub = href?.toLowerCase().includes("github.com");
                                                        if (isGitHub) {
                                                            const isProfile = href.toLowerCase().endsWith("sumit0593") || href.toLowerCase().endsWith("sumit0593/");
                                                            const label = isProfile ? "GitHub Profile" : "GitHub Repository";
                                                            return (
                                                                <a
                                                                    href={href}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-2 px-4 py-2 mt-2 rounded-xl bg-[#24292e] dark:bg-[#404448] hover:bg-[#24292e]/90 text-white font-semibold transition-all duration-200 shadow-md hover:shadow-lg no-underline cursor-pointer text-xs"
                                                                    {...props}
                                                                >
                                                                    <span>💻 {label}</span>
                                                                </a>
                                                            );
                                                        }

                                                        const isLeetCode = href?.toLowerCase().includes("leetcode.com");
                                                        if (isLeetCode) {
                                                            return (
                                                                <a
                                                                    href={href}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-2 px-4 py-2 mt-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-semibold transition-all duration-200 shadow-md hover:shadow-lg no-underline cursor-pointer text-xs"
                                                                    {...props}
                                                                >
                                                                    <span>💡 LeetCode Profile</span>
                                                                </a>
                                                            );
                                                        }

                                                        const isNewtonSchool = href?.toLowerCase().includes("newton") || href?.toLowerCase().includes("full_stack_web_certificate");
                                                        if (isNewtonSchool) {
                                                            let label = "Newton School Certificate";
                                                            if (href.toLowerCase().includes("scorecard_newton_1")) label = "Newton School Scorecard 1";
                                                            else if (href.toLowerCase().includes("scorecard_newton_2")) label = "Newton School Scorecard 2";
                                                            else if (href.toLowerCase().includes("full_stack_web_certificate")) label = "Newton School Certificate (PDF)";
                                                            return (
                                                                <a
                                                                    href={href}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-2 px-4 py-2 mt-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all duration-200 shadow-md hover:shadow-lg no-underline cursor-pointer text-xs"
                                                                    {...props}
                                                                >
                                                                    <span>📜 {label}</span>
                                                                </a>
                                                            );
                                                        }

                                                        const isIITMandi = href?.toLowerCase().includes("prompt_engineering") || href?.toLowerCase().includes("excellence_rag");
                                                        if (isIITMandi) {
                                                            let label = "IIT Mandi Certificate";
                                                            if (href.toLowerCase().includes("prompt_engineering")) label = "IIT Mandi Prompt Engineering (PDF)";
                                                            else if (href.toLowerCase().includes("excellence_rag")) label = "IIT Mandi RAG Engineering (PDF)";
                                                            return (
                                                                <a
                                                                    href={href}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-2 px-4 py-2 mt-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all duration-200 shadow-md hover:shadow-lg no-underline cursor-pointer text-xs"
                                                                    {...props}
                                                                >
                                                                    <span>🎓 {label}</span>
                                                                </a>
                                                            );
                                                        }

                                                        return (
                                                            <a href={href} className="text-indigo-400 hover:underline" {...props}>
                                                                {children}
                                                            </a>
                                                        );
                                                    }
                                                }}
                                            >
                                                {getMessageText(m)}
                                            </Markdown>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {messages.length === 1 && !isLoading && (
                                <div className="space-y-4 mt-2 border-t border-border/40 pt-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    {selectedCategory === null ? (
                                        <div className="space-y-4">
                                            <div className="text-center md:text-left">
                                                <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                                                    Choose a category below to explore Sumit&apos;s background, projects, experience, and expertise.
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                {CATEGORIES.map((cat) => (
                                                    <button
                                                        key={cat.id}
                                                        onClick={() => setSelectedCategory(cat.id)}
                                                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-card border border-border/50 text-left text-xs font-semibold text-foreground/85 hover:bg-indigo-500/10 hover:text-indigo-500 hover:border-indigo-500/30 transition-all cursor-pointer shadow-sm select-none"
                                                    >
                                                        <span>{cat.label}</span>
                                                    </button>
                                                ))}
                                            </div>

                                            <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-border/20">
                                                <p className="text-[10px] text-muted-foreground font-semibold px-1">Quick Suggestions:</p>
                                                <div className="flex flex-col gap-1.5">
                                                    <button
                                                        onClick={() => handleSuggestionClick("Get Sumit's Resume")}
                                                        className="text-left text-xs px-3.5 py-2.5 rounded-xl bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/20 hover:border-indigo-500/40 text-indigo-600 dark:text-indigo-400 font-semibold transition-all cursor-pointer shadow-sm flex items-center gap-2"
                                                    >
                                                        <span>📄</span>
                                                        <span>Get Sumit&apos;s Resume</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleSuggestionClick("Connect with Sumit (Get link & send message)")}
                                                        className="text-left text-xs px-3.5 py-2.5 rounded-xl bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/20 hover:border-indigo-500/40 text-indigo-600 dark:text-indigo-400 font-semibold transition-all cursor-pointer shadow-sm flex items-center gap-2"
                                                    >
                                                        <span>✉️</span>
                                                        <span>Connect with Sumit (Get link & send message)</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {(() => {
                                                const cat = CATEGORIES.find(c => c.id === selectedCategory);
                                                if (!cat) return null;
                                                return (
                                                    <div className="space-y-3 bg-muted/20 p-3 rounded-2xl border border-border/30">
                                                        <div className="flex items-center justify-between gap-2 border-b border-border/30 pb-2">
                                                            <h4 className="text-xs font-bold text-foreground leading-none flex items-center gap-1">
                                                                {cat.title}
                                                            </h4>
                                                            <button
                                                                onClick={() => setSelectedCategory(null)}
                                                                className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer select-none"
                                                            >
                                                                ← Back
                                                            </button>
                                                        </div>
                                                        <p className="text-[10px] text-muted-foreground leading-normal">
                                                            {cat.description}
                                                        </p>
                                                        <div className="flex flex-col gap-1.5 mt-2">
                                                            {cat.questions.map((q, idx) => (
                                                                <button
                                                                    key={idx}
                                                                    onClick={() => handleSuggestionClick(q)}
                                                                    className="text-left text-[11px] px-3 py-2 rounded-xl bg-card border border-border/50 text-foreground/80 hover:bg-indigo-500/10 hover:text-indigo-500 hover:border-indigo-500/30 transition-all cursor-pointer shadow-sm select-none"
                                                                >
                                                                    • {q}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    )}

                                    <div className="border-t border-border/30 pt-3 space-y-2.5">
                                        <div className="text-center md:text-left">
                                            <h4 className="text-[11px] font-bold text-foreground/90">
                                                Didn&apos;t find what you&apos;re looking for?
                                            </h4>
                                            <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-500/10 dark:bg-indigo-500/20 px-2 py-1 rounded-lg inline-flex items-center gap-1.5 mt-1 border border-indigo-500/20 shadow-sm animate-pulse">
                                                <Info className="w-3.5 h-3.5 text-indigo-500" />
                                                <span>💬 Type your own question below</span>
                                            </p>
                                        </div>
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
                            {isLimitReached && (
                                <div className="mb-3 p-3 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-background backdrop-blur-md shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="flex flex-col gap-2.5">
                                        <div className="flex items-start gap-2">
                                            <AlertCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                                            <div className="space-y-0.5">
                                                <p className="text-xs font-bold text-foreground">
                                                    You have reached the free limit of 4 messages.
                                                </p>
                                                <p className="text-[10px] text-muted-foreground leading-normal">
                                                    For more features & unlimited chatting, Please Sign In or Login as guest.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                onClick={() => {
                                                    window.location.href = "/login";
                                                }}
                                                className="flex-1 text-xs py-2 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all shadow-sm cursor-pointer"
                                            >
                                                Sign In
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    signIn("credentials", { callbackUrl: "/dashboard" });
                                                }}
                                                className="flex-1 text-xs py-2 h-9 rounded-xl border border-indigo-500/30 hover:bg-indigo-500/10 hover:text-indigo-600 text-foreground font-semibold transition-all cursor-pointer"
                                            >
                                                Login as Guest
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <form onSubmit={handleSubmit} className="flex gap-2">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={handleInputChange}
                                    placeholder={isLimitReached ? "Limit reached. Please sign in or continue as guest." : "Ask anything about Sumit...or Enter quit and exit to reset chat"}
                                    disabled={isLoading || isLimitReached}
                                    className="flex-1 text-sm rounded-xl border border-indigo-500/35 hover:border-indigo-500/60 bg-card text-foreground px-4 py-2.5 shadow-[0_0_10px_rgba(99,102,241,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 disabled:opacity-50 placeholder:text-[11px] placeholder:text-muted-foreground/50 transition-all duration-200"
                                />
                                <Button type="submit" disabled={isLoading || isLimitReached} size="icon" className="h-auto w-10 shrink-0 rounded-xl bg-indigo-600 hover:bg-indigo-500 cursor-pointer shadow-sm overflow-hidden p-2.5">
                                    <img src="/assets/nova.png" alt="Send" className="h-full w-full object-contain rounded-full" />
                                </Button>
                            </form>
                            {!isLimitReached && (
                                <div className="text-[9.5px] text-indigo-600 dark:text-indigo-400 text-center mt-2.5 leading-relaxed select-none bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 rounded-xl p-2 font-medium flex items-center gap-1.5 justify-center shadow-sm">
                                    <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                    <span>
                                        The Nova AI assistant will search across Sumit&apos;s portfolio and provide an accurate response.
                                    </span>
                                </div>
                            )}
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
