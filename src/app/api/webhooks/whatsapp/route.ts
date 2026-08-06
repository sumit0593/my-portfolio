import { NextRequest, NextResponse } from "next/server";
import { sendWhatsAppMessage } from "@/lib/agents/whatsappService";
import { detectLanguage, buildLanguageInstruction } from "@/lib/agents/languageDetector";
import { classifyAgentRole } from "@/lib/agents/agentDispatcher";
import { extractLeadQualification } from "@/lib/agents/leadQualifier";
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

  if (mode === "subscribe" && token === verifyToken) {
    console.log("[WhatsApp Webhook] Verification successful.");
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Verification failed." }, { status: 403 });
}

/**
 * POST Webhook for Incoming WhatsApp Messages from Clients.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check if this is a WhatsApp message notification
    const entry = body?.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const message = value?.messages?.[0];

    if (!message) {
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

    if (!userText.trim()) {
      return NextResponse.json({ status: "empty" }, { status: 200 });
    }

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

    // 5. Build System Prompt
    const basePrompt = buildOrchestratedPrompt(chunks, [], sanitizedText, intent);
    const whatsappPrompt = `
${basePrompt}

ACTIVE WHATSAPP AI AGENT: ${activeAgent.title} (${activeAgent.role} Agent)
${activeAgent.systemDirective}

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

    const replyText = sanitizeAIOutput(aiResponse.text || "Hello! Thanks for reaching out. How can I assist with your AI engineering or full-stack project?");

    // 7. Send Response back to WhatsApp Cloud API
    const sendResult = await sendWhatsAppMessage({
      toPhone: fromPhone,
      text: replyText,
      phoneId: incomingPhoneId,
    });

    return NextResponse.json({
      status: sendResult.success ? "success" : "send_failed",
      fromPhone,
      activeAgent: activeAgent.role,
      leadScore: leadResult.leadScore,
      sendResult,
    });
  } catch (err: any) {
    console.error("[WhatsApp Webhook Error]", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
