import { db, ChatSession } from "./db";
import { auth } from "@/auth";

export interface SessionState {
  sessionToken: string;
  authenticationState: "anonymous" | "guest" | "user";
  status: "ACTIVE" | "LOCKED" | "EXPIRED";
  lockReason: "FREE_LIMIT" | "GUEST_LIMIT" | "COOLDOWN" | null;
  canChat: boolean;
  messageCount: number;
  remainingMessages: number;
  maxMessages: number | null;
  guestMode: boolean;
  sessionVersion: number;
  allowedActions: ("signin" | "continue_guest" | "reset")[];
  expiresAt: string;
  serverNow: string;
  remainingCooldownSeconds: number;
  features: {
    unlimitedChat: boolean;
    guestMode: boolean;
    canExport: boolean;
  };
  health: {
    processing: boolean;
    expired: boolean;
    locked: boolean;
  };
  analytics: {
    messagesSent: number;
    startedAt: string;
    lastActivityAt: string;
  };
  ui: {
    showContinueAsGuest: boolean;
    showSignIn: boolean;
    showCountdown: boolean;
    showReset: boolean;
    disableInput: boolean;
    bannerType: "info" | "warning" | "success" | "error" | null;
    bannerMessage: string | null;
    primaryAction: "signin" | "continue_guest" | "reset" | null;
    secondaryAction: "signin" | "continue_guest" | "reset" | null;
  };
}

export async function buildSessionState(
  dbSession: ChatSession,
  lockoutUntilStr?: string | null
): Promise<SessionState> {
  const messages = db.getMessagesBySessionId(dbSession.id);
  const messageCount = messages.filter((m) => m.role === "user").length;

  const session = await auth();
  const rawIsGuestSession = session?.user && (session.user as any).role === "guest";
  const rawIsUserSession = session?.user && (session.user as any).role !== "guest";

  let authenticationState: "anonymous" | "guest" | "user" = "anonymous";
  if (rawIsUserSession) {
    authenticationState = "user";
  } else if (rawIsGuestSession || dbSession.guestMode) {
    authenticationState = "guest";
  }

  let maxMessages: number | null = 4;
  if (authenticationState === "user") {
    maxMessages = null;
  } else if (authenticationState === "guest") {
    maxMessages = 8;
  }

  const remainingMessages = maxMessages === null ? 9999 : Math.max(0, maxMessages - messageCount);

  // Determine lockout state
  let isGuestLockedOut = false;
  let guestLockoutUntil = null;
  if (lockoutUntilStr) {
    const lockoutTime = new Date(lockoutUntilStr).getTime();
    if (Date.now() < lockoutTime) {
      isGuestLockedOut = true;
      guestLockoutUntil = lockoutUntilStr;
    }
  }

  // A session is locked if:
  // 1. Not user AND (messageCount >= maxMessages OR isGuestLockedOut)
  // 2. Logout preservation: user was logged in as guest previously but is now logged out
  const isLoggedOutGuest = !session?.user && dbSession.guestMode;
  const isLocked = authenticationState !== "user" && 
    (messageCount >= (maxMessages || 4) || isGuestLockedOut || isLoggedOutGuest);

  let lockReason: "FREE_LIMIT" | "GUEST_LIMIT" | "COOLDOWN" | null = null;
  if (isLocked) {
    // Priority: GUEST_LIMIT > FREE_LIMIT > COOLDOWN
    if (isLoggedOutGuest || (authenticationState === "guest" && messageCount >= (maxMessages || 8))) {
      lockReason = "GUEST_LIMIT";
    } else if (authenticationState === "anonymous" && messageCount >= (maxMessages || 4)) {
      lockReason = "FREE_LIMIT";
    } else if (isGuestLockedOut) {
      lockReason = "COOLDOWN";
    }
  }

  const remainingCooldownSeconds = guestLockoutUntil
    ? Math.max(0, Math.ceil((new Date(guestLockoutUntil).getTime() - Date.now()) / 1000))
    : 0;

  const expiresTimestamp = guestLockoutUntil
    ? new Date(guestLockoutUntil)
    : dbSession.expiresAt;

  const serverNowDate = new Date();
  
  let status: "ACTIVE" | "LOCKED" | "EXPIRED" = "ACTIVE";
  if (dbSession.status === "EXPIRED" || serverNowDate.getTime() > dbSession.expiresAt.getTime()) {
    status = "EXPIRED";
  } else if (isLocked) {
    status = "LOCKED";
  }

  const canChat = !isLocked && status === "ACTIVE";

  const allowedActions: ("signin" | "continue_guest" | "reset")[] = ["reset"];
  if (lockReason === "FREE_LIMIT") {
    allowedActions.push("signin", "continue_guest");
  } else if (lockReason === "GUEST_LIMIT") {
    allowedActions.push("signin");
  }

  const isExpiredStatus = status === "EXPIRED";

  const ui = {
    showContinueAsGuest: lockReason === "FREE_LIMIT",
    showSignIn: lockReason === "FREE_LIMIT" || lockReason === "GUEST_LIMIT" || lockReason === "COOLDOWN",
    showCountdown: lockReason === "COOLDOWN",
    showReset: isExpiredStatus,
    disableInput: isLocked || dbSession.isProcessing || isExpiredStatus,
    bannerType: (
      isExpiredStatus ? "info" :
      lockReason === "FREE_LIMIT" ? "warning" :
      lockReason === "GUEST_LIMIT" ? "error" :
      lockReason === "COOLDOWN" ? "warning" : null
    ) as any,
    bannerMessage:
      isExpiredStatus
        ? "Your session has expired. Start a new conversation to continue."
        : lockReason === "FREE_LIMIT"
        ? "You've used all 4 free messages."
        : lockReason === "GUEST_LIMIT"
        ? "You've reached the guest message limit. Please Sign In to continue chatting."
        : lockReason === "COOLDOWN"
        ? "Guest session expired or cooldown active."
        : null,
    primaryAction: (
      isExpiredStatus ? "reset" :
      lockReason === "FREE_LIMIT" ? "continue_guest" :
      lockReason === "GUEST_LIMIT" ? "signin" :
      null
    ) as "signin" | "continue_guest" | "reset" | null,
    secondaryAction: (
      isExpiredStatus ? "signin" :
      lockReason === "FREE_LIMIT" ? "signin" : null
    ) as "signin" | "continue_guest" | "reset" | null,
  };

  return {
    sessionToken: dbSession.sessionToken,
    authenticationState,
    status,
    lockReason,
    canChat,
    messageCount,
    remainingMessages,
    maxMessages,
    guestMode: dbSession.guestMode,
    sessionVersion: dbSession.sessionVersion,
    allowedActions,
    expiresAt: expiresTimestamp.toISOString(),
    serverNow: serverNowDate.toISOString(),
    remainingCooldownSeconds,
    features: {
      unlimitedChat: authenticationState === "user",
      guestMode: authenticationState === "guest",
      canExport: authenticationState === "user",
    },
    health: {
      processing: dbSession.isProcessing,
      expired: status === "EXPIRED",
      locked: isLocked,
    },
    analytics: {
      messagesSent: messageCount,
      startedAt: dbSession.createdAt.toISOString(),
      lastActivityAt: dbSession.lastActiveAt.toISOString(),
    },
    ui,
  };
}
