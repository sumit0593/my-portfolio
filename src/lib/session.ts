import { db, ChatSession } from "./db";
import { cookies } from "next/headers";
import { auth } from "@/auth";

export async function getOrCreateSession(): Promise<{
  dbSession: ChatSession;
  isNew: boolean;
  isExpired: boolean;
  isAuthenticated: boolean;
  triggerSignOut?: boolean;
}> {
  const session = await auth();
  const isAuthenticated = !!session?.user;
  const isGuestAuth = session?.user && (session.user as any).role === "guest";
  const isUserAuth = session?.user && (session.user as any).role !== "guest";

  const cookieStore = await cookies();
  let cookieToken = cookieStore.get("guest-chat-session-id")?.value;

  let dbSession: ChatSession;
  let isNew = false;
  let isExpired = false;
  let triggerSignOut = false;

  // Ensure guest-chat-session-id cookie exists
  if (!cookieToken) {
    cookieToken = crypto.randomUUID();
    cookieStore.set("guest-chat-session-id", cookieToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });
  }

  const now = Date.now();

  if (isUserAuth) {
    cookieStore.delete("guest-chat-lockout-until");
    // Authenticated users use a session key derived from email/id
    const identity = session.user?.email || session.user?.id;
    const userToken = `user-${identity}`;
    let activeSession = db.getActiveSessionByToken(userToken);

    if (!activeSession) {
      // Check if there is an active cookie session to migrate
      const cookieSession = db.getActiveSessionByToken(cookieToken);
      if (cookieSession) {
        if (now > new Date(cookieSession.expiresAt).getTime()) {
          db.deleteSession(cookieSession.id);
          isExpired = true;
          dbSession = db.createSession(userToken);
          db.updateSessionPromptSuppression(dbSession.id, true);
          isNew = true;
        } else {
          // Migrate existing anonymous session to authenticated user session
          db.migrateSessionToken(cookieToken, userToken);
          activeSession = db.getActiveSessionByToken(userToken);
          dbSession = activeSession!;
        }
      } else {
        dbSession = db.createSession(userToken);
        db.updateSessionPromptSuppression(dbSession.id, true);
        isNew = true;
      }
    } else {
      // Check if session has passed its expiry time
      if (now > new Date(activeSession.expiresAt).getTime()) {
        db.deleteSession(activeSession.id);
        isExpired = true;
        dbSession = db.createSession(userToken);
        db.updateSessionPromptSuppression(dbSession.id, true);
        isNew = true;
      } else {
        dbSession = activeSession;
      }
    }
  } else {
    // Anonymous & Guest sessions both use the guest-chat-session-id cookie directly as token
    let activeSession = db.getActiveSessionByToken(cookieToken);

    if (!activeSession) {
      const existing = db.getSessionByToken(cookieToken);
      if (existing) {
        isExpired = true;
        // Delete expired chat session and history
        db.deleteSession(existing.id);
      }
      cookieStore.delete("guest-chat-lockout-until");
      dbSession = db.createSession(cookieToken);
      isNew = true;

      // If a guest Auth.js session still exists, automatically clear the authentication cookies
      if (isGuestAuth) {
        triggerSignOut = true;
        cookieStore.delete("authjs.session-token");
        cookieStore.delete("__Secure-authjs.session-token");
      }
    } else {
      // Sliding/Passive expiry check
      if (now > new Date(activeSession.expiresAt).getTime()) {
        db.deleteSession(activeSession.id);
        isExpired = true;
        cookieStore.delete("guest-chat-lockout-until");
        cookieStore.delete("guest-chat-message-count");
        dbSession = db.createSession(cookieToken);
        isNew = true;

        if (isGuestAuth) {
          triggerSignOut = true;
          cookieStore.delete("authjs.session-token");
          cookieStore.delete("__Secure-authjs.session-token");
        }
      } else {
        dbSession = activeSession;
      }
    }
  }

  return { dbSession, isNew, isExpired, isAuthenticated, triggerSignOut };
}

export async function resetSession(): Promise<ChatSession> {
  const session = await auth();
  const isUserAuth = session?.user && (session.user as any).role !== "guest";

  const cookieStore = await cookies();
  let token = cookieStore.get("guest-chat-session-id")?.value;

  if (isUserAuth) {
    const identity = session.user?.email || session.user?.id;
    const userToken = `user-${identity}`;
    const activeSession = db.getActiveSessionByToken(userToken);
    if (activeSession) {
      db.deleteSession(activeSession.id);
    }
    const dbSession = db.createSession(userToken);
    db.updateSessionPromptSuppression(dbSession.id, true);
    return dbSession;
  } else {
    // Clear NextAuth credentials guest session
    const isGuestAuth = session?.user && (session.user as any).role === "guest";
    if (isGuestAuth) {
      cookieStore.delete("authjs.session-token");
      cookieStore.delete("__Secure-authjs.session-token");
    }

    if (token) {
      const activeSession = db.getActiveSessionByToken(token);
      if (activeSession) {
        db.deleteSession(activeSession.id);
      }
    }
    const newToken = crypto.randomUUID();
    const dbSession = db.createSession(newToken);
    
    db.updateSessionPromptSuppression(dbSession.id, true);

    cookieStore.set("guest-chat-session-id", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    cookieStore.delete("guest-chat-lockout-until");
    cookieStore.delete("guest-chat-message-count");
    return dbSession;
  }
}


