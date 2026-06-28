import { ai, CHAT_MODEL } from "@/lib/gemini";
import { retrieveHybridContext, buildOrchestratedPrompt, conversationMemory } from "@/lib/orchestrator";
import { requireAuth } from "@/lib/api-auth";
import { chatLimiter, getRateLimitToken, guestChatCache } from "@/lib/rate-limit";
import { chatRequestSchema } from "@/lib/validations";
import { escapeHtml, sanitizePromptInput, sanitizeAIOutput } from "@/lib/security";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { auth } from "@/auth";
import { cookies } from "next/headers";

export const maxDuration = 60;

async function sendEmailViaNodemailer(email: string, message: string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // Escape user input to prevent HTML injection in emails
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message);

  await transporter.sendMail({
    from: `"Portfolio Contact" <${process.env.SMTP_EMAIL}>`,
    to: process.env.CONTACT_EMAIL || process.env.SMTP_EMAIL,
    replyTo: email,
    subject: `Portfolio Contact from ${safeEmail} (via AI Assistant)`,
    text: `From: ${email}\n\n${message}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6366f1;">New Portfolio Contact (via AI Assistant)</h2>
        <p><strong>From:</strong> ${safeEmail}</p>
        <hr style="border: 1px solid #e2e8f0;" />
        <p style="white-space: pre-wrap; color: #334155;">${safeMessage}</p>
        <hr style="border: 1px solid #e2e8f0;" />
        <p style="color: #94a3b8; font-size: 12px;">Sent from your portfolio AI assistant chatbot</p>
      </div>
    `,
  });
}

const CHAT_TOOLS = [
  {
    functionDeclarations: [
      {
        name: "send_message_by_guest",
        description: "Sends a contact message to Sumit Kumar from a visitor/guest.",
        parameters: {
          type: "OBJECT",
          properties: {
            email: {
              type: "STRING",
              description: "The email address of the guest wishing to contact Sumit."
            },
            message: {
              type: "STRING",
              description: "The message/content the guest wants to send to Sumit."
            }
          },
          required: ["email", "message"]
        }
      }
    ]
  }
];

export async function POST(req: Request) {
  try {
    // Authentication check
    const session = await auth();
    const isAuthenticated = !!session?.user;

    // Rate limiting
    const token = getRateLimitToken(req);
    const { success: withinLimit } = chatLimiter.check(15, token); // 15 req/min
    if (!withinLimit) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    // Validate request body
    const body = await req.json();
    const parseResult = chatRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request format.", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { messages } = parseResult.data;

    let guestSessionId = "";
    if (!isAuthenticated) {
      // Retrieve or set guest session ID cookie
      const cookieStore = await cookies();
      let cookieId = cookieStore.get("guest-chat-session-id")?.value;
      if (!cookieId) {
        cookieId = crypto.randomUUID();
        cookieStore.set("guest-chat-session-id", cookieId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 30, // 30 days
          path: "/",
        });
      }
      guestSessionId = cookieId;

      // 1. Verify the client-submitted messages count
      const clientUserMsgCount = messages.filter((m) => m.role === "user").length;
      
      // 2. Verify server-side cache message count
      const currentCount = guestChatCache.get(guestSessionId) || 0;
      if (currentCount >= 4 || clientUserMsgCount > 4) {
        return NextResponse.json(
          { error: "You have reached the free limit of 4 messages." },
          { status: 403 }
        );
      }

      // Increment count on server
      guestChatCache.set(guestSessionId, currentCount + 1);
    }

    const lastUserMessage = messages.filter((m) => m.role === "user").pop();
    let userQuery = "";
    if (lastUserMessage) {
      userQuery = lastUserMessage.content ||
        (Array.isArray(lastUserMessage.parts) ? lastUserMessage.parts.map((p) => p.text || "").join(" ") : "");
    }

    if (!userQuery.trim()) {
      return new Response(JSON.stringify({ error: "Empty query received." }), { status: 400 });
    }

    // Sanitize user input to mitigate prompt injection
    const sanitizedQuery = sanitizePromptInput(userQuery);

    const sessionId = isAuthenticated 
      ? (req.headers.get("x-session-id") || "default-session")
      : guestSessionId;

    // Retrieve via Orchestrator (Pinecone + MiniSearch)
    const { chunks: retrievedChunks, intent } = await retrieveHybridContext(sanitizedQuery, 5);
    const conversationHistory = conversationMemory.getHistory(sessionId);

    const systemPrompt = buildOrchestratedPrompt(retrievedChunks, conversationHistory, sanitizedQuery, intent);

    conversationMemory.addMessage(sessionId, { role: "user", content: sanitizedQuery });

    // AbortController handling for stream cancellation
    const abortController = new AbortController();
    req.signal.addEventListener("abort", () => {
      abortController.abort();
    });

    const stream = await ai.models.generateContentStream({
      model: CHAT_MODEL,
      contents: sanitizedQuery,
      config: {
        systemInstruction: systemPrompt + "\nIf the user wants to leave a message, send a message, or contact Sumit, you can initiate the message send by calling the `send_message_by_guest` tool. You must ask the user for their email and message if they haven't provided them. Make sure to call this tool to send the message.",
        temperature: 0.15,
        topP: 0.8,
        maxOutputTokens: 512,
        tools: CHAT_TOOLS as any,
      },
    });

    const textId = "0";
    let fullResponse = "";

    const sseStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        const send = (data: object) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

        send({ type: "start" });
        send({ type: "start-step" });
        send({ type: "text-start", id: textId });

        try {
          for await (const chunk of stream) {
            if (abortController.signal.aborted) break;

            const calls = chunk.functionCalls;
            if (calls && calls.length > 0) {
              for (const call of calls) {
                if (call.name === "send_message_by_guest") {
                  const args = call.args as { email?: string; message?: string };
                  if (args.email && args.message) {
                    try {
                      console.log("[Chat Tool] Sending email from", args.email);
                      await sendEmailViaNodemailer(args.email, args.message);
                      send({ type: "text-delta", id: textId, delta: "\n\n*System: Message sent successfully to Sumit on your behalf!* 🚀" });
                      fullResponse += "\n\n*System: Message sent successfully to Sumit on your behalf!* 🚀";
                    } catch (mailErr: any) {
                      console.error("Failed to send email inside tool:", mailErr?.message);
                      send({ type: "text-delta", id: textId, delta: "\n\n*System: Failed to send your message. Please try again.*" });
                    }
                  }
                }
              }
            }

            const text = chunk.text ?? "";
            if (text) {
              // Sanitize AI output before sending to client
              const safeText = sanitizeAIOutput(text);
              fullResponse += safeText;
              send({ type: "text-delta", id: textId, delta: safeText });
            }
          }
        } catch {
          if (!abortController.signal.aborted) {
            send({ type: "text-delta", id: textId, delta: "I'm having trouble connecting right now. Please try again." });
          }
        }

        if (!abortController.signal.aborted) {
          send({ type: "text-end", id: textId });
          send({ type: "finish-step" });
          send({ type: "finish", finishReason: "stop" });
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));

          if (fullResponse) {
            conversationMemory.addMessage(sessionId, { role: "assistant", content: fullResponse });
          }
        }
        controller.close();
      },
    });

    return new Response(sseStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Vercel-AI-UI-Message-Stream": "v1",
      },
    });
  } catch (err: any) {
    console.error("Chat API Error:", err?.message);
    return new Response(
      JSON.stringify({ error: "Failed to process chat request." }),
      { status: 500 }
    );
  }
}
