import { ai, CHAT_MODEL } from "@/lib/gemini";
import { retrieveHybridContext, buildOrchestratedPrompt, conversationMemory } from "@/lib/orchestrator";
import { chatLimiter, getRateLimitToken } from "@/lib/rate-limit";
import { chatRequestSchema } from "@/lib/validations";
import { escapeHtml, sanitizePromptInput, sanitizeAIOutput } from "@/lib/security";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { db } from "@/lib/db";
import { getOrCreateSession } from "@/lib/session";
import { buildSessionState } from "@/lib/sessionMapper";
import { cookies } from "next/headers";
import crypto from "crypto";

export const maxDuration = 60;

async function sendEmailViaNodemailer(email: string, message: string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

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
  const requestId = crypto.randomUUID();
  try {
    // Hidden IP-Based Rate Limiting
    const token = getRateLimitToken(req);
    const { success: withinLimit } = chatLimiter.check(30, token); // 30 req/min/IP
    if (!withinLimit) {
      return NextResponse.json(
        {
          success: false,
          requestId,
          code: "RATE_LIMITED",
          message: "Rate limit exceeded. Please try again later.",
          sessionState: null,
        },
        { status: 429 }
      );
    }

    // Validate request body
    const body = await req.json();
    const parseResult = chatRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          requestId,
          code: "INVALID_TOKEN",
          message: "Invalid request format.",
          sessionState: null,
        },
        { status: 400 }
      );
    }

    const { messages, clientMessageId } = parseResult.data;

    const cookieStore = await cookies();
    const lockoutUntilStr = cookieStore.get("guest-chat-lockout-until")?.value || null;

    // Load active session from database (or create if missing/expired)
    const { dbSession } = await getOrCreateSession();
    const sessionState = await buildSessionState(dbSession, lockoutUntilStr);

    // Validate using the server-side sessionState
    if (!sessionState.canChat) {
      return NextResponse.json(
        {
          success: false,
          requestId,
          code: "SESSION_LOCKED",
          message: "Session limit reached. Please sign in to continue.",
          sessionState,
        },
        { status: 429 }
      );
    }

    // Check Idempotency
    if (clientMessageId) {
      const dbMessages = db.getMessagesBySessionId(dbSession.id);
      const existingUserMsg = dbMessages.find((m) => m.metadata?.clientMessageId === clientMessageId);
      if (existingUserMsg) {
        const userMsgIndex = dbMessages.indexOf(existingUserMsg);
        const assistantMsg = dbMessages.slice(userMsgIndex + 1).find((m) => m.role === "assistant");
        if (assistantMsg) {
          const sseStream = new ReadableStream({
            async start(controller) {
              const encoder = new TextEncoder();
              const send = (data: object) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
              send({ type: "start" });
              send({ type: "start-step" });
              send({ type: "text-start", id: "0" });
              send({ type: "text-delta", id: "0", delta: assistantMsg.content });
              send({ type: "text-end", id: "0" });
              send({ type: "finish-step" });
              send({ type: "finish", finishReason: "stop" });
              
              const state = await buildSessionState(dbSession, lockoutUntilStr);
              // SDK requires 'data-*' prefix for custom data chunks (strict schema)
              send({ type: "data-session-state", data: state });
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              controller.close();
            }
          });
          return new Response(sseStream, {
            headers: {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
              "Connection": "keep-alive",
              "X-Vercel-AI-UI-Message-Stream": "v1",
            },
          });
        }
      }
    }

    // Acquire Concurrency Lock
    const locked = db.tryAcquireProcessingLock(dbSession.id);
    if (!locked) {
      return NextResponse.json(
        {
          success: false,
          requestId,
          code: "PROCESSING_LOCK",
          message: "Another prompt is currently processing.",
          sessionState,
        },
        { status: 409 }
      );
    }

    // Save lockout cookie ONLY for guest users hitting their 8-message limit.
    // Anonymous users hitting 4 messages should NOT get this cookie —
    // they need to see "Continue as Guest", not get COOLDOWN.
    const userMsgCount = sessionState.messageCount;
    const limit = sessionState.maxMessages;
    if (sessionState.authenticationState === "guest" && limit && userMsgCount + 1 >= limit) {
      cookieStore.set("guest-chat-lockout-until", dbSession.expiresAt.toISOString(), {
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60,
        path: "/",
      });
    }

    const lastUserMessage = messages.filter((m) => m.role === "user").pop();
    let userQuery = "";
    if (lastUserMessage) {
      userQuery = lastUserMessage.content ||
        (Array.isArray(lastUserMessage.parts) ? lastUserMessage.parts.map((p) => p.text || "").join(" ") : "");
    }

    if (!userQuery.trim()) {
      db.releaseProcessingLock(dbSession.id);
      return new Response(JSON.stringify({ error: "Empty query received." }), { status: 400 });
    }

    const sanitizedQuery = sanitizePromptInput(userQuery);

    // Retrieve contextual chunks
    const { chunks: retrievedChunks, intent } = await retrieveHybridContext(sanitizedQuery, 5);

    // Build history
    const dbMessages = db.getMessagesBySessionId(dbSession.id);
    const activeDbMessages = dbMessages.filter((m) => !m.metadata?.cleared);
    const conversationHistory = activeDbMessages.map((m) => ({
      role: m.role === "user" ? "user" as const : "assistant" as const,
      content: m.content,
    }));

    const systemPrompt = buildOrchestratedPrompt(retrievedChunks, conversationHistory, sanitizedQuery, intent);

    // Save User Message
    db.addMessage(dbSession.id, "user", sanitizedQuery, { clientMessageId });
    db.updateSessionActivity(dbSession.id);
    conversationMemory.addMessage(dbSession.sessionToken, { role: "user", content: sanitizedQuery });

    // AbortController handling
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
    let isFinished = false;

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
              const safeText = sanitizeAIOutput(text);
              fullResponse += safeText;
              send({ type: "text-delta", id: textId, delta: safeText });
            }
          }

          if (!abortController.signal.aborted) {
            isFinished = true;
          }
        } catch (streamErr: any) {
          console.error("Error generating stream chunk:", streamErr?.message);
          if (!abortController.signal.aborted) {
            send({ type: "text-delta", id: textId, delta: "\n\n*(Error connecting to AI brain. Please try again later.)*" });
          }
        } finally {
          // Release Lock
          db.releaseProcessingLock(dbSession.id);

          // Save assistant message to DB (partial if interrupted)
          if (fullResponse) {
            const metadata = isFinished ? null : { interrupted: true };
            db.addMessage(dbSession.id, "assistant", fullResponse, metadata);
            db.updateSessionActivity(dbSession.id);
            conversationMemory.addMessage(dbSession.sessionToken, { role: "assistant", content: fullResponse });
          }

          // Build final sessionState for the client
          const finalLockoutStr = isFinished && sessionState.authenticationState !== "user" && limit && (userMsgCount + 1 >= limit)
            ? dbSession.expiresAt.toISOString()
            : lockoutUntilStr;
          
          const updatedSession = await buildSessionState(dbSession, finalLockoutStr);

          send({ type: "text-end", id: textId });
          send({ type: "finish-step" });
          send({ type: "finish", finishReason: "stop" });
          // SDK requires 'data-*' prefix for custom data chunks (strict schema)
          send({ type: "data-session-state", data: updatedSession });

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        }
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
    console.error("Chat API Error:", err?.stack || err?.message || err);
    return new Response(
      JSON.stringify({ error: "Failed to process chat request." }),
      { status: 500 }
    );
  }
}
