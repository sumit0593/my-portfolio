import { NextResponse } from "next/server";
import { conversationMemory } from "@/lib/orchestrator";
import { getOrCreateSession } from "@/lib/session";
import { db } from "@/lib/db";

export async function POST() {
  try {
    const { dbSession } = await getOrCreateSession();
    db.clearSessionMessages(dbSession.id);
    conversationMemory.clearSession(dbSession.sessionToken);

    return NextResponse.json({ success: true, message: "Session memory cleared." });
  } catch (error: any) {
    console.error("Chat Clear API Error:", error?.message);
    return NextResponse.json(
      { error: "Failed to clear session memory." },
      { status: 500 }
    );
  }
}
