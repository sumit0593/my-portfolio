import { NextResponse } from "next/server";
import { conversationMemory } from "@/lib/orchestrator";
import { requireAuth } from "@/lib/api-auth";

export async function POST(req: Request) {
  try {
    // Authentication check
    const { error: authError } = await requireAuth();
    if (authError) return authError;

    const sessionId = req.headers.get("x-session-id") || "default-session";
    conversationMemory.clearSession(sessionId);
    return NextResponse.json({ success: true, message: "Session memory cleared." });
  } catch (error: any) {
    console.error("Chat Clear API Error:", error?.message);
    return NextResponse.json(
      { error: "Failed to clear session memory." },
      { status: 500 }
    );
  }
}
