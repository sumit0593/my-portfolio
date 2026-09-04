import { ai, CHAT_MODEL } from "@/lib/gemini";
import { retrieveHybridContext, buildOrchestratedPrompt, conversationMemory } from "@/lib/orchestrator";
import { chatLimiter, getRateLimitToken } from "@/lib/rate-limit";
import { chatRequestSchema } from "@/lib/validations";
import { escapeHtml, sanitizePromptInput, sanitizeAIOutput } from "@/lib/security";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { db, PendingContactState } from "@/lib/db";
import { getOrCreateSession } from "@/lib/session";
import { buildSessionState } from "@/lib/sessionMapper";
import { cookies } from "next/headers";
import crypto from "crypto";
import { detectLanguage, buildLanguageInstruction } from "@/lib/agents/languageDetector";
import { classifyAgentRole, AGENT_PERSONAS } from "@/lib/agents/agentDispatcher";
import { extractLeadQualification, buildLeadQualificationDirective } from "@/lib/agents/leadQualifier";

export const maxDuration = 60;

function extractTextFromMessage(msg: any): string {
  if (!msg) return "";
  if (typeof msg.content === "string" && msg.content.trim()) {
    return msg.content.trim();
  }
  if (Array.isArray(msg.parts)) {
    return msg.parts
      .map((p: any) => {
        if (typeof p === "string") return p;
        if (p && typeof p.text === "string") return p.text;
        return "";
      })
      .join("")
      .trim();
  }
  return "";
}

function cleanUserDraftText(text: string): string {
  return text
    .replace(/^(just\s+)?(send\s+(a\s+|one\s+more\s+|another\s+)?(msg|message)(\s+to\s+sumit)?(\s+saying|\s+that)?[:,\s]*)/i, "")
    .replace(/^["']|["']$/g, "")
    .trim();
}

function findPreviousUserDraft(messages: { role: string; content: string }[]): string | null {
  const controlCommandRegex = /^(yes|yeah|yep|sure|no|nope|cancel|stop|nevermind|edit|change|ok|okay|what\s+email|clear|admin:clear|send\s+it|do\s+it)\b/i;
  const isRefRegex = /\b(previous|earlier|last|old)\s+(msg|message|draft|text)\b|\bwhat\s+i\s+(said|wrote|sent)\s+earlier\b/i;

  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.role === "user") {
      const trimmed = m.content.trim();
      if (isRefRegex.test(trimmed)) continue;
      if (controlCommandRegex.test(trimmed) && trimmed.length < 40) continue;
      if (/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}$/.test(trimmed)) continue;
      // Skip generic connect or send-msg commands that have no message body
      if (/^(just\s+)?send\s+(a\s+|one\s+more\s+|another\s+)?(msg|message)(\s+i\s+give\s+email|\s+to\s+sumit)?$/i.test(trimmed)) continue;
      if (/^connect\s+with\s+sumit/i.test(trimmed)) continue;

      const cleaned = cleanUserDraftText(trimmed);
      if (cleaned.length > 0) {
        return cleaned;
      }
    }
  }
  return null;
}

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
  let dbSession: Awaited<ReturnType<typeof getOrCreateSession>>["dbSession"] | null = null;
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
    ({ dbSession } = await getOrCreateSession());
    const session = dbSession; // narrowed non-null reference for use inside this try block
    const sessionState = await buildSessionState(session, lockoutUntilStr);

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
      const dbMessages = db.getMessagesBySessionId(session.id);
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
              
              const state = await buildSessionState(session, lockoutUntilStr);
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
    const locked = db.tryAcquireProcessingLock(session.id);
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
      cookieStore.set("guest-chat-lockout-until", session.expiresAt.toISOString(), {
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });
    }

    const lastUserMessage = messages.filter((m) => m.role === "user").pop();
    let userQuery = extractTextFromMessage(lastUserMessage);

    if (!userQuery.trim()) {
      db.releaseProcessingLock(session.id);
      return new Response(JSON.stringify({ error: "Empty query received." }), { status: 400 });
    }

    const sanitizedQuery = sanitizePromptInput(userQuery);
    const tRequest = Date.now();

    // 1. Language Detection Engine
    const detectedLang = detectLanguage(sanitizedQuery);
    const langInstruction = buildLanguageInstruction(detectedLang);

    // 2. Retrieve contextual chunks
    const { chunks: retrievedChunks, intent } = await retrieveHybridContext(sanitizedQuery, 5);
    const ragMs = Date.now() - tRequest;

    // 3. Multi-Agent Persona Dispatcher
    let activeAgent = classifyAgentRole(sanitizedQuery, intent);

    // 4. Build history & Lead Qualification Extraction
    const dbMessages = db.getMessagesBySessionId(session.id);
    const activeDbMessages = dbMessages.filter((m) => !m.metadata?.cleared);
    const conversationHistory = activeDbMessages.map((m) => ({
      role: m.role === "user" ? "user" as const : "assistant" as const,
      content: m.content,
    }));

    // ── Pending Contact Workflow State Machine ─────────────────────────────
    let pendingContact = db.getPendingContact(session.id);
    let contactDirective = "";
    let canSendToolExecute = false;

    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/i;
    const queryEmailMatch = sanitizedQuery.match(emailRegex);

    // Track active email: current query > pendingContact > history
    let currentEmail: string | undefined = queryEmailMatch ? queryEmailMatch[0] : (pendingContact?.recipientEmail || undefined);
    if (!currentEmail) {
      for (let i = conversationHistory.length - 1; i >= 0; i--) {
        const m = conversationHistory[i].content.match(emailRegex);
        if (m) {
          currentEmail = m[0];
          break;
        }
      }
    }

    const assistantMessages = conversationHistory.filter((m) => m.role === "assistant");
    const lastAssistantContent = assistantMessages[assistantMessages.length - 1]?.content || "";

    const isAskingForMessage =
      /(what\s+message|what\s+would\s+you\s+like(\s+me)?\s+to\s+(send|say)|what('s|\s+is)\s+the\s+message|provide\s+(the|a|your)\s+message|message\s+you('d|\s+would)\s+like\s+to\s+send)/i.test(
        lastAssistantContent
      );

    const isAskingForEmail =
      /(what('s|\s+is)\s+your\s+email|provide\s+your\s+email|your\s+email\s+address|email\s+so\s+sumit)/i.test(
        lastAssistantContent
      );

    const trimmedQuery = sanitizedQuery.trim();
    const isRefToPreviousMsg = /\b(previous|earlier|last|old)\s+(msg|message|draft|text)\b|\bwhat\s+i\s+(said|wrote|sent)\s+earlier\b/i.test(trimmedQuery);
    const isCancelOrChange = /\b(no\b|nope\b|cancel|stop|nevermind|never mind|don't send|do not send|change\s+it|edit\s+it|clear)\b/i.test(trimmedQuery);
    const isEmailInquiry = /\b(what|which)\s+(is\s+my\s+email|email\s+address|email\s+do\s+you\s+have|email\s+you\s+got)\b/i.test(trimmedQuery);

    const inlineSendMsgRegex = /^(just\s+)?send\s+(a\s+|one\s+more\s+|another\s+)?(msg|message)(\s+to\s+sumit)?(\s+saying|\s+that)?[:,\s]*/i;
    const hasInlineMatch = inlineSendMsgRegex.test(trimmedQuery);
    const cleanedInline = hasInlineMatch ? cleanUserDraftText(trimmedQuery) : "";
    const isNewInlineMessage = hasInlineMatch && cleanedInline.length > 0 && !/^(i\s+give\s+email|to\s+sumit)$/i.test(cleanedInline);

    const isExplicitConfirmation =
      /^(yes|yeah|yep|sure|send\s+it(\s+now|\s+please)?|send\s+now|send\s+the\s+message|send|please|do\s+it|ok|okay|yup|confirm|absolutely|yes\s+please|go\s+ahead)$/i.test(
        trimmedQuery.replace(/[.!]+$/, "")
      ) && !isRefToPreviousMsg && !isCancelOrChange && !isNewInlineMessage;

    // Resolve any active or quoted draft from pendingContact, assistant quote, or conversation history
    const resolvedDraft = pendingContact?.draftMessage ||
      (lastAssistantContent.match(/["“']([^"”']{2,})["”']/) ? lastAssistantContent.match(/["“']([^"”']{2,})["”']/)?.[1] : null) ||
      findPreviousUserDraft(conversationHistory);

    const isAssistantAskingToSend = /(would\s+you\s+like\s+me\s+to\s+send|should\s+i\s+send|ready\s+to\s+send|send\s+that\s+message|confirm\s+before\s+sending)/i.test(lastAssistantContent);
    const isPendingConfirmation = (pendingContact?.awaitingConfirmation && !!pendingContact?.draftMessage) || isAssistantAskingToSend;

    // 1. Case A: Reference to previous message ("yes now send previous msg", "send previous message")
    if (isRefToPreviousMsg) {
      activeAgent = AGENT_PERSONAS.Scheduling;
      const previousDraft = findPreviousUserDraft(conversationHistory);
      if (previousDraft) {
        pendingContact = {
          recipientEmail: currentEmail || null,
          draftMessage: previousDraft,
          awaitingConfirmation: true,
          lastUpdated: new Date().toISOString(),
        };
        db.updatePendingContact(session.id, pendingContact);

        contactDirective = `The user is referring to their previous message draft: "${previousDraft.replace(/"/g, '\\"')}".
Recipient email on record: ${currentEmail || "not provided yet"}.

CRITICAL POLICY:
- DO NOT call the \`send_message_by_guest\` tool in this turn.
- You must acknowledge the found previous message and ask for explicit confirmation:
"I found your previous message:
\\"${previousDraft.replace(/"/g, '\\"')}\\"

Would you like me to send "${previousDraft.replace(/"/g, '\\"')}" to Sumit using ${currentEmail || "your email address"}?"`;
      } else {
        contactDirective = `The user referred to a previous message, but no previous draft was found in earlier turns. Ask them what message they would like to send to Sumit.`;
      }
      canSendToolExecute = false;
    }
    // 2. Case A2: Inline new message draft ("send one more msg hello buddy", "send message can we meet tomorrow")
    else if (isNewInlineMessage) {
      activeAgent = AGENT_PERSONAS.Scheduling;
      pendingContact = {
        recipientEmail: currentEmail || null,
        draftMessage: cleanedInline,
        awaitingConfirmation: true,
        lastUpdated: new Date().toISOString(),
      };
      db.updatePendingContact(session.id, pendingContact);
      canSendToolExecute = false;

      if (currentEmail) {
        contactDirective = `The user provided a new message to send to Sumit:
- Recipient: Sumit Kumar
- Sender Email: ${currentEmail}
- Message Draft: "${cleanedInline.replace(/"/g, '\\"')}"

CRITICAL POLICY:
- DO NOT call the \`send_message_by_guest\` tool in this turn.
- Acknowledge their message and ask for explicit confirmation before sending:
"I have your message: \\"${cleanedInline.replace(/"/g, '\\"')}\\" (from ${currentEmail}). Would you like me to go ahead and send this to Sumit?"`;
      } else {
        contactDirective = `You noted their message: "${cleanedInline.replace(/"/g, '\\"')}".
Ask for their email address so Sumit can reply:
"Got your message: \\"${cleanedInline.replace(/"/g, '\\"')}\\"! What is your email address so Sumit can get back to you?"`;
      }
    }
    // 2. Case B: Explicit user confirmation ("send it", "yes", "confirm") when message & email are ready
    else if (isExplicitConfirmation && isPendingConfirmation && currentEmail && resolvedDraft) {
      activeAgent = AGENT_PERSONAS.Scheduling;
      canSendToolExecute = true; // HARD GATE UNLOCKED!
      pendingContact = {
        recipientEmail: currentEmail,
        draftMessage: resolvedDraft,
        awaitingConfirmation: true,
        lastUpdated: new Date().toISOString(),
      };
      db.updatePendingContact(session.id, pendingContact);

      contactDirective = `CRITICAL ACTION DIRECTIVE:
The user has EXPLICITLY CONFIRMED sending the draft message.
You MUST IMMEDIATELY call the \`send_message_by_guest\` tool now with:
- email: "${currentEmail}"
- message: "${resolvedDraft.replace(/"/g, '\\"')}"
Do NOT ask for confirmation again. Call the tool now to send the email to Sumit.
In your response, confirm to the user that their message has been sent to Sumit from ${currentEmail}.`;
    }
    // 3. Case C: User cancels or asks to change ("no change it", "cancel", "wait don't send")
    else if (isCancelOrChange && (pendingContact?.awaitingConfirmation || pendingContact?.draftMessage)) {
      activeAgent = AGENT_PERSONAS.Scheduling;
      pendingContact = {
        recipientEmail: currentEmail || null,
        draftMessage: null,
        awaitingConfirmation: false,
        lastUpdated: new Date().toISOString(),
      };
      db.updatePendingContact(session.id, pendingContact);
      canSendToolExecute = false;

      contactDirective = `The user requested to cancel or change their draft.
Acknowledge politely:
"Sure, I've cleared that draft. What message would you like to change it to instead?"`;
    }
    // 4. Case D: User asks what email is on record ("what email address do you have?")
    else if (isEmailInquiry) {
      activeAgent = AGENT_PERSONAS.Scheduling;
      canSendToolExecute = false;
      contactDirective = `The user is inquiring about their email address on record.
Tell them: ${currentEmail ? `Your email on file is **${currentEmail}**.` : "I don't have an email address recorded for you yet."}
If they have a draft or want to send a message, let them know you're ready when they are.`;
    }
    // 5. Case E: User provides only an email address
    else if (queryEmailMatch && trimmedQuery.length < queryEmailMatch[0].length + 20) {
      activeAgent = AGENT_PERSONAS.Scheduling;
      currentEmail = queryEmailMatch[0];
      const draft = resolvedDraft;

      pendingContact = {
        recipientEmail: currentEmail,
        draftMessage: draft || null,
        awaitingConfirmation: !!draft,
        lastUpdated: new Date().toISOString(),
      };
      db.updatePendingContact(session.id, pendingContact);
      canSendToolExecute = false;

      if (pendingContact.draftMessage) {
        contactDirective = `You noted the updated email: ${currentEmail}.
You have their message draft: "${pendingContact.draftMessage.replace(/"/g, '\\"')}".
Ask them for confirmation: "Got your email: ${currentEmail}! Would you like me to send '${pendingContact.draftMessage.replace(/"/g, '\\"')}' to Sumit?"`;
      } else {
        contactDirective = `You noted the email: ${currentEmail}.
Ask them: "Got your email: ${currentEmail}! What message would you like me to send to Sumit?"`;
      }
    }
    // 6. Case F: User provides the message draft
    else if (isAskingForMessage && !isCancelOrChange && !isExplicitConfirmation) {
      activeAgent = AGENT_PERSONAS.Scheduling;
      const draft = sanitizedQuery;
      pendingContact = {
        recipientEmail: currentEmail || null,
        draftMessage: draft,
        awaitingConfirmation: true,
        lastUpdated: new Date().toISOString(),
      };
      db.updatePendingContact(session.id, pendingContact);
      canSendToolExecute = false;

      if (currentEmail) {
        contactDirective = `PENDING ACTION - SENDING MESSAGE TO SUMIT:
- Recipient: Sumit Kumar
- Sender Email: ${currentEmail}
- Message Content: "${draft.replace(/"/g, '\\"')}"

Ask them for a quick confirmation:
"I have your message: \\"${draft.replace(/"/g, '\\"')}\\" (from ${currentEmail}). Would you like me to go ahead and send this to Sumit?"
Do NOT call \`send_message_by_guest\` yet until they explicitly confirm.`;
      } else {
        contactDirective = `You received their message draft: "${draft.replace(/"/g, '\\"')}".
Now ask for their email address so Sumit can reply:
"Got your message! What is your email address so Sumit can get back to you?"`;
      }
    }
    // 7. Case G: User provides email when asked for email
    else if (isAskingForEmail && currentEmail && !isAskingForMessage) {
      activeAgent = AGENT_PERSONAS.Scheduling;
      canSendToolExecute = false;
      contactDirective = `The user provided their email: ${currentEmail}.
Now ask: "Got your email: ${currentEmail}! What message would you like me to send to Sumit?"`;
    }
    // 8. Case H: General contact queries
    else if (intent === "contact_query" || /\b(send\s+(a\s+)?message|contact\s+sumit|email\s+sumit|reach\s+out\s+to\s+sumit)\b/i.test(trimmedQuery)) {
      activeAgent = AGENT_PERSONAS.Scheduling;
      canSendToolExecute = false;
      if (!currentEmail) {
        contactDirective = `The user wants to contact Sumit. Warmly ask for their email address and what message they would like to send so Sumit can respond directly.`;
      } else if (!pendingContact?.draftMessage) {
        contactDirective = `The user wants to contact Sumit. You have their email (${currentEmail}). Ask what message they would like you to send to Sumit.`;
      }
    }

    const allMessagesForLeadEval = [...conversationHistory, { role: "user", content: sanitizedQuery }];
    const leadResult = extractLeadQualification(allMessagesForLeadEval);
    const leadDirective = buildLeadQualificationDirective(leadResult);

    // 5. Persist lead intelligence & active agent role to database session
    db.updateLeadQualification(
      session.id,
      leadResult.leadScore,
      leadResult,
      activeAgent.role,
      detectedLang.language
    );

    const basePrompt = buildOrchestratedPrompt(retrievedChunks, conversationHistory, sanitizedQuery, intent);
    const multiAgentPrompt = `
${basePrompt}

═══════════════════════════════════════════
ACTIVE AI AGENT PERSONA: ${activeAgent.title} (${activeAgent.role} Agent)
═══════════════════════════════════════════
${activeAgent.systemDirective}
${contactDirective ? `\n═══════════════════════════════════════════\nPENDING CONTACT WORKFLOW DIRECTIVE:\n═══════════════════════════════════════════\n${contactDirective}\n` : ""}
${leadDirective}

${langInstruction}
`;

    // Save User Message
    db.addMessage(session.id, "user", sanitizedQuery, { clientMessageId });
    db.updateSessionActivity(session.id);
    conversationMemory.addMessage(session.sessionToken, { role: "user", content: sanitizedQuery });

    // Update guest-chat-message-count cookie for robust serverless tracking
    if (sessionState.authenticationState !== "user") {
      const currentCount = parseInt(cookieStore.get("guest-chat-message-count")?.value || "0", 10);
      cookieStore.set("guest-chat-message-count", String(currentCount + 1), {
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });
    }

    // AbortController handling
    const abortController = new AbortController();
    req.signal.addEventListener("abort", () => {
      abortController.abort();
    });

    const stream = await ai.models.generateContentStream({
      model: CHAT_MODEL,
      contents: sanitizedQuery,
      config: {
        systemInstruction: multiAgentPrompt + `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEND_MESSAGE SAFETY POLICY & RULES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. NEVER call \`send_message_by_guest\` merely because the user mentions "send", "message", or provides an email.
2. A message must first be resolved, and the recipient's email must be known.
3. The exact message content must be known and presented to the user.
4. The user must explicitly confirm the exact message and recipient in a separate turn before sending.
5. If the user says "yes", "okay", "do it", etc., ONLY treat it as confirmation when there is an active pending confirmation state.
6. If the user refers to "previous message" or "earlier msg", resolve that message from history, display it, and ask for confirmation. NEVER send in the same turn.
7. If the user says "no", "change it", or "cancel", do NOT call the tool; acknowledge and ask what they would like to change.
8. Only call \`send_message_by_guest\` when you receive a CRITICAL ACTION DIRECTIVE explicitly instructing you to execute it now.
9. When the user supplies a new message draft (e.g. "send one more msg hello buddy"), NEVER call \`send_message_by_guest\` immediately. Present the draft to the user and ask for their confirmation first!`,
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

        const tGemini = Date.now();
        let ttftMs: number | null = null;

        send({ type: "start" });
        send({ type: "start-step" });
        send({ type: "text-start", id: textId });

        try {
          for await (const chunk of stream) {
            if (abortController.signal.aborted) break;

            // Capture time-to-first-token on first text chunk from Gemini
            if (ttftMs === null && (chunk.text || chunk.functionCalls?.length)) {
              ttftMs = Date.now() - tGemini;
            }

            const calls = chunk.functionCalls;
            if (calls && calls.length > 0) {
              for (const call of calls) {
                if (call.name === "send_message_by_guest") {
                  const args = call.args as { email?: string; message?: string };
                  const targetEmail = args.email || pendingContact?.recipientEmail;
                  const targetMessage = args.message || pendingContact?.draftMessage;

                  if (!canSendToolExecute) {
                    console.warn("[Chat Tool Gate] BLOCKED unauthorized send_message_by_guest: confirmation gate not satisfied.");
                    const draftToConfirm = targetMessage || pendingContact?.draftMessage;
                    const emailToConfirm = targetEmail || currentEmail;
                    if (draftToConfirm && !fullResponse.includes("Would you like me to")) {
                      pendingContact = {
                        recipientEmail: emailToConfirm || null,
                        draftMessage: draftToConfirm,
                        awaitingConfirmation: true,
                        lastUpdated: new Date().toISOString(),
                      };
                      db.updatePendingContact(session.id, pendingContact);
                      const confirmationPrompt = `\n\nI have your message: "${draftToConfirm}"${emailToConfirm ? ` (from ${emailToConfirm})` : ""}. Would you like me to go ahead and send this to Sumit?`;
                      send({ type: "text-delta", id: textId, delta: confirmationPrompt });
                      fullResponse += confirmationPrompt;
                    }
                    continue;
                  }

                  if (targetEmail && targetMessage) {
                    try {
                      console.log("[Chat Tool] Sending email from", targetEmail);
                      await sendEmailViaNodemailer(targetEmail, targetMessage);
                      db.updatePendingContact(session.id, null); // Clear state after successful send
                      const successNotice = `\n\n✅ **Message sent successfully to Sumit!** 🚀\n\n- **From:** \`${targetEmail}\`\n- **Message:** *"${targetMessage}"*\n\nSumit has received your note in his inbox and will follow up with you at **${targetEmail}** soon!`;
                      send({ type: "text-delta", id: textId, delta: successNotice });
                      fullResponse += successNotice;
                    } catch (mailErr: any) {
                      console.error("Failed to send email inside tool:", mailErr?.message);
                      const failureNotice = `\n\n⚠️ **Delivery failed**: We were unable to send your message from **${targetEmail}**. Please try again shortly or contact Sumit directly via [WhatsApp](https://wa.me/917011676185) or [LinkedIn](https://www.linkedin.com/in/sumit-kumar0509/).`;
                      send({ type: "text-delta", id: textId, delta: failureNotice });
                      fullResponse += failureNotice;
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
          db.releaseProcessingLock(session.id);

          // Save assistant message to DB (partial if interrupted)
          if (fullResponse) {
            const metadata = isFinished ? null : { interrupted: true };
            db.addMessage(session.id, "assistant", fullResponse, metadata);
            db.updateSessionActivity(session.id);
            conversationMemory.addMessage(session.sessionToken, { role: "assistant", content: fullResponse });
          }

          // Build final sessionState for the client
          const finalLockoutStr = isFinished && sessionState.authenticationState !== "user" && limit && (userMsgCount + 1 >= limit)
            ? session.expiresAt.toISOString()
            : lockoutUntilStr;
          
          const updatedSession = await buildSessionState(session, finalLockoutStr);

          if (process.env.NODE_ENV === "development") {
            console.debug("[CHAT]", {
              ragMs,
              ttftMs,
              totalStreamMs: Date.now() - tGemini,
            });
          }

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
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
        "X-Vercel-AI-UI-Message-Stream": "v1",
      },
    });
  } catch (err: any) {
    console.error("Chat API Error:", err?.stack || err?.message || err);
    // Always release the processing lock on error to prevent the chat input
    // from being permanently disabled for the remainder of the session.
    if (dbSession) {
      try { db.releaseProcessingLock(dbSession.id); } catch (_) {}
    }
    return new Response(
      JSON.stringify({ error: "Failed to process chat request." }),
      { status: 500 }
    );
  }
}
