import { NextRequest, NextResponse } from "next/server";
import { sendWhatsAppMessage } from "@/lib/agents/whatsappService";
import { detectLanguage, buildLanguageInstruction } from "@/lib/agents/languageDetector";
import { classifyAgentRole } from "@/lib/agents/agentDispatcher";
import { extractLeadQualification, buildLeadQualificationDirective } from "@/lib/agents/leadQualifier";
import { retrieveHybridContext, buildOrchestratedPrompt } from "@/lib/orchestrator";
import { ai, CHAT_MODEL } from "@/lib/gemini";
import { sanitizePromptInput, sanitizeAIOutput } from "@/lib/security";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "portfolio_whatsapp_verify_token";

/**
 * GET Webhook Verification Handshake for Meta WhatsApp Cloud API.
 */
export async function GET(req: NextRequest) {
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || "portfolio_whatsapp_verify_token";
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  console.log(`[WhatsApp Webhook GET] Verification request received. Mode: ${mode} | Token: ${token}`);

  if (mode === "subscribe" && token === verifyToken) {
    console.log("[WhatsApp Webhook GET] Verification successful! Returning challenge.");
    return new Response(challenge, { status: 200 });
  }

  console.error("[WhatsApp Webhook GET] Verification failed. Invalid verify token.");
  return NextResponse.json({ error: "Verification failed." }, { status: 403 });
}

/**
 * POST Webhook for Incoming WhatsApp Messages from Clients.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[WhatsApp Webhook POST] Webhook event received from Meta:", JSON.stringify(body));

    // Check if this is a WhatsApp message notification
    const entry = body?.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const message = value?.messages?.[0];

    if (!message) {
      console.log("[WhatsApp Webhook POST] Status update or non-message payload received. Ignoring.");
      return NextResponse.json({ status: "ignored" }, { status: 200 });
    }

    const fromPhone = message.from; // Sender's phone number
    const incomingPhoneId = value?.metadata?.phone_number_id; // Phone Number ID from Meta payload
    const messageType = message.type;
    let userText = "";

    if (messageType === "text") {
      userText = message.text?.body || "";
    } else if (messageType === "button" || messageType === "interactive") {
      userText = message.button?.text || message.interactive?.button_reply?.title || "";
    } else {
      userText = `Client sent a ${messageType} attachment.`;
    }

    console.log(`[WhatsApp Webhook POST] 📩 Incoming Message | From: ${fromPhone} | Phone ID: ${incomingPhoneId} | Type: ${messageType} | Text: "${userText}"`);

    if (!userText.trim()) {
      console.warn("[WhatsApp Webhook POST] Empty message text received.");
      return NextResponse.json({ status: "empty" }, { status: 200 });
    }

    // Process AI response in background without blocking Meta's 3-second HTTP timeout
    (async () => {
      try {
        const sanitizedText = sanitizePromptInput(userText);

        // 1. Detect language
        const detectedLang = detectLanguage(sanitizedText);
        const langInstruction = buildLanguageInstruction(detectedLang);

        // 2. Retrieve hybrid context
        const { chunks, intent } = await retrieveHybridContext(sanitizedText, 4);

        // 3. Classify Multi-Agent Persona
        const activeAgent = classifyAgentRole(sanitizedText, intent);

        // 4. Lead Qualification Check
        const leadResult = extractLeadQualification([{ role: "user", content: sanitizedText }]);
        const leadDirective = buildLeadQualificationDirective(leadResult);

        // 5. Build System Prompt
        const basePrompt = buildOrchestratedPrompt(chunks, [], sanitizedText, intent);
        const whatsappPrompt = `
${basePrompt}

ACTIVE WHATSAPP AI AGENT: ${activeAgent.title} (${activeAgent.role} Agent)
${activeAgent.systemDirective}

${leadDirective}

${langInstruction}

FORMATTING RULE: Format your answer cleanly for WhatsApp messaging:
- Use *bold* for key headings or emphasis.
- Keep paragraphs concise.
- Include bullet points for lists.
`;

        // 6. Generate AI Response via Gemini
        const aiResponse = await ai.models.generateContent({
          model: CHAT_MODEL,
          contents: sanitizedText,
          config: {
            systemInstruction: whatsappPrompt,
            temperature: 0.2,
            maxOutputTokens: 400,
          },
        });

        const replyText = sanitizeAIOutput(
          aiResponse.text || "Hello! Thanks for reaching out. How can I assist with your AI engineering or full-stack project?"
        );

        // 7. Send Response back to WhatsApp Cloud API
        const sendResult = await sendWhatsAppMessage({
          toPhone: fromPhone,
          text: replyText,
          phoneId: incomingPhoneId,
        });

        console.log(`[WhatsApp Agent Sent] To: ${fromPhone} | Agent: ${activeAgent.role} | Success: ${sendResult.success} | Message ID: ${sendResult.messageId || "N/A"}`);
      } catch (bgErr) {
        console.error("[WhatsApp Async Agent Error]", bgErr);
      }
    })();

    // Immediately return HTTP 200 OK to Meta to comply with Meta's 3-second webhook timeout
    return NextResponse.json({
      status: "success",
      message: "Message received and dispatching to AI agent",
      fromPhone,
    }, { status: 200 });
  } catch (err: any) {
    console.error("[WhatsApp Webhook Error]", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
