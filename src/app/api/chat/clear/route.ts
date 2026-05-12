import { NextResponse } from "next/server";
import { conversationMemory } from "@/lib/orchestrator";

export async function POST(req: Request) {
  try {
    const sessionId = req.headers.get("x-session-id") || "default-session";
    conversationMemory.clearSession(sessionId);
    return NextResponse.json({ success: true, message: "Session memory cleared." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to clear session memory." }, { status: 500 });
  }
}
