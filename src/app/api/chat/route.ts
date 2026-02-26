import { createOpenAI } from '@ai-sdk/openai';
import { streamText, convertToModelMessages, createUIMessageStreamResponse } from 'ai';
import fs from 'fs/promises';
import path from 'path';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(req: Request) {
    const { messages } = await req.json();

    let resumeContent = "";
    try {
        const resumePath = path.join(process.cwd(), 'resume.txt');
        resumeContent = await fs.readFile(resumePath, 'utf8');
    } catch (error) {
        console.error("Error reading resume:", error);
    }

    let lastMessageText = "";
    const lastMsgObj = messages[messages.length - 1];
    if (lastMsgObj) {
        if (lastMsgObj.content) {
            lastMessageText = lastMsgObj.content;
        } else if (lastMsgObj.parts && lastMsgObj.parts.length > 0) {
            lastMessageText = lastMsgObj.parts.map((p: any) => p.text || "").join(" ");
        }
    }
    const lastMessage = lastMessageText.toLowerCase();

    // Intercept keywords locally
    const isResumeQuery = lastMessage.includes("skill") ||
        lastMessage.includes("experience") ||
        lastMessage.includes("project") ||
        lastMessage.includes("education") ||
        lastMessage.includes("profile") ||
        lastMessage.includes("resume") ||
        lastMessage.includes("achievement") ||
        lastMessage.includes("certificat") ||
        lastMessage.includes("work");

    if (isResumeQuery || !process.env.OPENAI_API_KEY) {
        let extractedData = resumeContent;

        if (lastMessage.includes("skill")) {
            const match = resumeContent.match(/TECHNICAL SKILLS[\s\S]*?(?=PROFESSIONAL EXPERIENCE)/i);
            if (match) extractedData = match[0];
        } else if (lastMessage.includes("experience") || lastMessage.includes("work")) {
            const match = resumeContent.match(/PROFESSIONAL EXPERIENCE[\s\S]*?(?=PROJECTS)/i);
            if (match) extractedData = match[0];
        } else if (lastMessage.includes("project")) {
            const match = resumeContent.match(/PROJECTS[\s\S]*?(?=KEY ACHIEVEMENTS)/i);
            if (match) extractedData = match[0];
        } else if (lastMessage.includes("education")) {
            const match = resumeContent.match(/EDUCATION[\s\S]*?(?=CERTIFICATIONS)/i);
            if (match) extractedData = match[0];
        } else if (lastMessage.includes("profile") || lastMessage.includes("summary")) {
            const match = resumeContent.match(/PROFILE SUMMARY[\s\S]*?(?=TECHNICAL SKILLS)/i);
            if (match) extractedData = match[0];
        }

        const fallbackText = isResumeQuery
            ? `Here is the information directly from my resume:\n\n${extractedData.trim()}`
            : `Local Mode: Please provide a valid OpenAI API Key. I can still answer questions about my skills, experience, projects, or education based on my local resume!`;

        // If we don't have an API key, we must manually format the stream using the built-in Vercel SDK format
        // The Vercel SDK expects chunks in the format `0:"text"\n` but text formatting must be stringified properly.
        // The Vercel SDK expects chunks in the format `0:"text"\n` but text formatting must be stringified properly.
        const stream = new ReadableStream({
            start(controller) {
                // The AI SDK `useChat` hook expects each streamed text chunk to be formatted
                // as `0:"string_content"\n` where the content is a JSON-serialized string.
                // We stringify the entire text block so newlines and tabs are properly escaped.
                const chunk = `0:${JSON.stringify(fallbackText)}\n`;
                controller.enqueue(new TextEncoder().encode(chunk));
                controller.close();
            }
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'X-Vercel-AI-Data-Stream': 'v1'
            }
        });
    }

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
        const stream = new ReadableStream({
            start(controller) {
                controller.enqueue(new TextEncoder().encode(`0:${JSON.stringify("OpenAI API Error: " + e.message)}\n`));
                controller.close();
            }
        });
        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'X-Vercel-AI-Data-Stream': 'v1'
            }
        });
    }
}
