import { NextRequest, NextResponse } from "next/server";
import { getOrCreateSession } from "@/lib/session";
import { buildSessionState } from "@/lib/sessionMapper";
import { db } from "@/lib/db";
import { parseUploadedDocument } from "@/lib/agents/documentParser";
import { processVoiceMessage } from "@/lib/agents/voiceProcessor";
import { chatLimiter, getRateLimitToken } from "@/lib/rate-limit";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    // 1. Rate limiting
    const token = getRateLimitToken(req);
    const { success: withinLimit } = chatLimiter.check(15, token);
    if (!withinLimit) {
      return NextResponse.json(
        { success: false, requestId, error: "Rate limit exceeded. Please wait a moment." },
        { status: 429 }
      );
    }

    // 2. Session verification
    const cookieStore = await cookies();
    const lockoutUntilStr = cookieStore.get("guest-chat-lockout-until")?.value || null;
    const { dbSession } = await getOrCreateSession();
    const sessionState = await buildSessionState(dbSession, lockoutUntilStr);

    if (!sessionState.canChat) {
      return NextResponse.json(
        { success: false, requestId, error: "Session limit reached. Please sign in to continue." },
        { status: 429 }
      );
    }

    // 3. Process Multipart Form Data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const fileType = formData.get("type") as string || "document"; // "document" | "voice"

    if (!file) {
      return NextResponse.json(
        { success: false, requestId, error: "No file payload provided." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filename = file.name || "upload";
    const mimeType = file.type || "application/octet-stream";

    let resultMessage = "";
    let metadata: Record<string, any> = { filename, mimeType, fileSizeBytes: buffer.length };

    if (fileType === "voice" || mimeType.startsWith("audio/")) {
      const voiceResult = await processVoiceMessage(buffer, mimeType, filename);
      resultMessage = `[Client Voice Note Transcribed]: "${voiceResult.transcript}"`;
      metadata = { ...metadata, isVoice: true, ...voiceResult };
    } else {
      const docResult = await parseUploadedDocument(buffer, filename, mimeType);
      resultMessage = `[Client Document Uploaded]: ${docResult.filename}\n\nSummary: ${docResult.summary}\n\nExtracted Requirements:\n${docResult.technicalRequirements.map((r) => `- ${r}`).join("\n")}`;
      metadata = { ...metadata, isDocument: true, ...docResult };
    }

    // 4. Save to Database Session
    db.addMessage(dbSession.id, "user", resultMessage, metadata);
    db.updateSessionActivity(dbSession.id);

    return NextResponse.json({
      success: true,
      requestId,
      filename,
      mimeType,
      messageAdded: resultMessage,
      metadata,
    });
  } catch (err: any) {
    console.error("[Document Upload Error]", err);
    return NextResponse.json(
      { success: false, requestId, error: "Failed to process uploaded file." },
      { status: 500 }
    );
  }
}
