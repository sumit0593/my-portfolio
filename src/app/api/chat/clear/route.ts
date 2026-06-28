import { NextResponse } from "next/server";
import { conversationMemory } from "@/lib/orchestrator";
import { auth } from "@/auth";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const isAuthenticated = !!session?.user;

    let sessionId = req.headers.get("x-session-id") || "default-session";
    if (!isAuthenticated) {
      const cookieStore = await cookies();
      const cookieId = cookieStore.get("guest-chat-session-id")?.value;
      if (cookieId) {
        sessionId = cookieId;
      }
    }

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
