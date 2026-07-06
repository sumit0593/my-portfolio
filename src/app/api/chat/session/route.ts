import { db } from "@/lib/db";
import { getOrCreateSession, resetSession } from "@/lib/session";
import { buildSessionState } from "@/lib/sessionMapper";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const requestId = crypto.randomUUID();
  try {
    const cookieStore = await cookies();
    const lockoutUntilStr = cookieStore.get("guest-chat-lockout-until")?.value || null;

    const { dbSession, isNew, isExpired, triggerSignOut } = await getOrCreateSession();
    const sessionState = await buildSessionState(dbSession, lockoutUntilStr);

    // Get messages for restoration/rendering
    const messages = db.getMessagesBySessionId(dbSession.id);
    const activeMessages = messages.filter((m) => !m.metadata?.cleared);
    const sdkMessages = activeMessages.map((m) => ({
      id: m.id,
      role: m.role as "user" | "assistant",
      content: m.content,
      createdAt: new Date(m.createdAt),
    }));

    const sessionStatus = isNew ? "new" : isExpired ? "expired" : "restored";

    return NextResponse.json({
      success: true,
      requestId,
      data: {
        messages: sdkMessages,
        sessionStatus,
        promptSuppressed: dbSession.promptSuppressed || false,
        triggerSignOut: !!triggerSignOut,
      },
      sessionState,
    });
  } catch (err: any) {
    console.error("[SESSION GET ROUTE ERROR]", err?.stack || err?.message || err);
    return NextResponse.json(
      {
        success: false,
        requestId,
        code: "SESSION_NOT_FOUND",
        message: "Failed to load session",
        sessionState: null,
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();
  try {
    let action = "reset";
    try {
      const body = await req.json();
      if (body?.action) action = body.action;
    } catch {
      // Default to reset if no body
    }

    const cookieStore = await cookies();
    const lockoutUntilStr = cookieStore.get("guest-chat-lockout-until")?.value || null;

    if (action === "enable_guest") {
      const { dbSession } = await getOrCreateSession();
      db.enableGuestMode(dbSession.id);
      cookieStore.delete("guest-chat-lockout-until");
      
      const sessionState = await buildSessionState(dbSession, null);
      return NextResponse.json({
        success: true,
        requestId,
        data: {},
        sessionState,
      });
    } else {
      // Reset action
      const { dbSession } = await getOrCreateSession();
      const session = await auth();
      const isUserAuth = session?.user && (session.user as any).role !== "guest";

      if (isUserAuth) {
        const resetDbSession = await resetSession();
        cookieStore.delete("guest-chat-lockout-until");

        const sessionState = await buildSessionState(resetDbSession, null);
        return NextResponse.json({
          success: true,
          requestId,
          data: {
            messages: [],
            sessionStatus: "new",
            promptSuppressed: true,
          },
          sessionState,
        });
      } else {
        // For anonymous/guest users, soft-clear messages to preserve limits
        db.softClearSessionMessages(dbSession.id);
        const sessionState = await buildSessionState(dbSession, lockoutUntilStr);
        return NextResponse.json({
          success: true,
          requestId,
          data: {
            messages: [],
            sessionStatus: "new",
            promptSuppressed: true,
          },
          sessionState,
        });
      }
    }
  } catch (err: any) {
    console.error("[SESSION POST ROUTE ERROR]", err?.stack || err?.message || err);
    return NextResponse.json(
      {
        success: false,
        requestId,
        code: "SESSION_NOT_FOUND",
        message: "Failed to handle session action",
        sessionState: null,
      },
      { status: 500 }
    );
  }
}
