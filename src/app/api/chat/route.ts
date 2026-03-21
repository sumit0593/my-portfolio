import { createOpenAI } from '@ai-sdk/openai';
import {
    streamText,
    convertToModelMessages,
    createUIMessageStream,
    createUIMessageStreamResponse,
    UIMessage,
} from 'ai';
import fs from 'fs/promises';
import path from 'path';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
});

// ---------------------------------------------------------------------------
// Helper: Build a proper UI Message Stream Response from a plain string.
//   AI SDK v6 uses SSE-based "UI Message Stream" protocol, so we cannot just
//   push raw text. We need start → text-start → text-delta(s) → text-end →
//   finish-step → finish, wrapped with createUIMessageStreamResponse.
// ---------------------------------------------------------------------------
function buildFallbackStreamResponse(text: string) {
    const msgId = `msg-${Date.now()}`;
    const textId = `text-${Date.now()}`;

    const stream = createUIMessageStream({
        execute: ({ writer }) => {
            writer.write({ type: 'start', messageId: msgId });
            writer.write({ type: 'start-step' });
            writer.write({ type: 'text-start', id: textId });

            // Send text in small chunks so the UI feels streamed
            const chunkSize = 80;
            for (let i = 0; i < text.length; i += chunkSize) {
                writer.write({
                    type: 'text-delta',
                    id: textId,
                    delta: text.slice(i, i + chunkSize),
                });
            }

            writer.write({ type: 'text-end', id: textId });
            writer.write({ type: 'finish-step' });
            writer.write({ type: 'finish' });
        },
    });

    return createUIMessageStreamResponse({ stream });
}

// ---------------------------------------------------------------------------
// RAG: Extract relevant section from resume based on keyword matching
// ---------------------------------------------------------------------------
function extractResumeSection(resumeContent: string, query: string): string {
    const q = query.toLowerCase();

    if (q.includes('skill')) {
        const match = resumeContent.match(/TECHNICAL SKILLS[\s\S]*?(?=PROFESSIONAL EXPERIENCE)/i);
        if (match) return match[0].trim();
    }
    if (q.includes('experience') || q.includes('work')) {
        const match = resumeContent.match(/PROFESSIONAL EXPERIENCE[\s\S]*?(?=PROJECTS)/i);
        if (match) return match[0].trim();
    }
    if (q.includes('project')) {
        const match = resumeContent.match(/PROJECTS[\s\S]*?(?=KEY ACHIEVEMENTS)/i);
        if (match) return match[0].trim();
    }
    if (q.includes('achievement')) {
        const match = resumeContent.match(/KEY ACHIEVEMENTS[\s\S]*?(?=EDUCATION)/i);
        if (match) return match[0].trim();
    }
    if (q.includes('education')) {
        const match = resumeContent.match(/EDUCATION[\s\S]*?(?=CERTIFICATIONS)/i);
        if (match) return match[0].trim();
    }
    if (q.includes('certificat') || q.includes('training')) {
        const match = resumeContent.match(/CERTIFICATIONS & TRAINING[\s\S]*/i);
        if (match) return match[0].trim();
    }
    if (q.includes('profile') || q.includes('summary') || q.includes('about')) {
        const match = resumeContent.match(/PROFILE SUMMARY[\s\S]*?(?=TECHNICAL SKILLS)/i);
        if (match) return match[0].trim();
    }
    if (q.includes('contact')) {
        const match = resumeContent.match(/^[\s\S]*?(?=PROFILE SUMMARY)/i);
        if (match) return match[0].trim();
    }

    // Default: return the full resume
    return resumeContent.trim();
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------
export async function POST(req: Request) {
    const { messages }: { messages: UIMessage[] } = await req.json();

    // 1. Load resume content (RAG knowledge base)
    let resumeContent = '';
    try {
        const resumePath = path.join(process.cwd(), 'resume.txt');
        resumeContent = await fs.readFile(resumePath, 'utf8');
    } catch (error) {
        console.error('Error reading resume:', error);
    }

    // 2. Extract the last user message text
    let lastMessageText = '';
    const lastMsgObj = messages[messages.length - 1];
    if (lastMsgObj) {
        if (lastMsgObj.parts && lastMsgObj.parts.length > 0) {
            lastMessageText = lastMsgObj.parts
                .map((p: { type: string; text?: string }) => (p.type === 'text' ? p.text || '' : ''))
                .join(' ');
        } else if ((lastMsgObj as any).content) {
            lastMessageText = (lastMsgObj as any).content;
        }
    }
    const lastMessage = lastMessageText.toLowerCase();

    // 3. Determine if the query matches a resume keyword (local RAG)
    const resumeKeywords = [
        'skill', 'experience', 'project', 'education',
        'profile', 'resume', 'achievement', 'certificat',
        'work', 'about', 'summary', 'contact', 'training',
    ];
    const isResumeQuery = resumeKeywords.some((kw) => lastMessage.includes(kw));

    // 4a. Local fallback: either a resume query or no API key → serve from local RAG
    if (isResumeQuery || !process.env.OPENAI_API_KEY) {
        const extractedData = extractResumeSection(resumeContent, lastMessage);

        const fallbackText = isResumeQuery
            ? `Here is the information directly from my resume:\n\n${extractedData}`
            : `Local Mode: Please provide a valid OpenAI API Key. I can still answer questions about my skills, experience, projects, or education based on my local resume!`;

        return buildFallbackStreamResponse(fallbackText);
    }

    // 4b. OpenAI path: stream via the AI SDK
    try {
        const result = streamText({
            model: openai('gpt-4o'),
            system: `You are Sumit's AI Assistant. You should answer questions about him based ONLY on the provided resume context below.
If the information is not in the resume, you must state that you do not know.
If the question is NOT about Sumit (e.g., asking for a joke, general knowledge, greetings), answer it normally and creatively.

--- RESUME CONTEXT ---
${resumeContent}
-----------------------`,
            messages: await convertToModelMessages(messages),
        });

        return result.toUIMessageStreamResponse();
    } catch (e: any) {
        return buildFallbackStreamResponse(
            `OpenAI API Error: ${e.message}. Please try again later.`,
        );
    }
}
