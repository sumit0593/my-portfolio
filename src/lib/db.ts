import fs from "fs";
import path from "path";
import crypto from "crypto";

export interface ChatSession {
  id: string;
  sessionToken: string;
  status: "ACTIVE" | "EXPIRED" | "CLOSED";
  guestMode: boolean;
  promptSuppressed?: boolean;
  sessionVersion: number;
  
  // Auditing (Native Date Types)
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt: Date;
  lastMessageAt?: Date;
  expiresAt: Date;

  // Concurrency Lock
  isProcessing: boolean;
  processingStartedAt?: Date;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: "user" | "assistant" | "system";
  content: string;
  metadata?: Record<string, any> | null;
  createdAt: string;
}

interface DBData {
  sessions: ChatSession[];
  messages: ChatMessage[];
}

const DB_PATH = path.join(process.cwd(), "data", "db", "chats.json");

class LocalFileDB {
  private data: DBData = { sessions: [], messages: [] };
  private sessionsByToken = new Map<string, ChatSession>();
  private messagesBySessionId = new Map<string, ChatMessage[]>();

  constructor() {
    this.init();
  }

  private init() {
    try {
      const dir = path.dirname(DB_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, "utf-8");
        try {
          const parsed = JSON.parse(raw);
          parsed.sessions = (parsed.sessions || []).map((s: any) => ({
            ...s,
            createdAt: new Date(s.createdAt),
            updatedAt: new Date(s.updatedAt),
            lastActiveAt: new Date(s.lastActiveAt),
            lastMessageAt: s.lastMessageAt ? new Date(s.lastMessageAt) : undefined,
            expiresAt: new Date(s.expiresAt),
            processingStartedAt: s.processingStartedAt ? new Date(s.processingStartedAt) : undefined,
            sessionVersion: typeof s.sessionVersion === "number" ? s.sessionVersion : 1,
            isProcessing: !!s.isProcessing,
            guestMode: !!s.guestMode,
          }));
          this.data = parsed;
        } catch {
          this.data = { sessions: [], messages: [] };
        }
        if (!this.data.sessions) this.data.sessions = [];
        if (!this.data.messages) this.data.messages = [];
      } else {
        this.data = { sessions: [], messages: [] };
        this.save();
      }

      // Rebuild indexes
      this.rebuildIndexes();

      // Run automatic cleanups
      this.cleanupExpiredSessions();
      this.cleanupStaleLocks();
      this.cleanupOldAnonymousChats();
    } catch (err) {
      console.error("[DB INIT ERROR]", err);
    }
  }

  private rebuildIndexes() {
    this.sessionsByToken.clear();
    this.messagesBySessionId.clear();

    for (const session of this.data.sessions) {
      this.sessionsByToken.set(session.sessionToken, session);
    }

    for (const msg of this.data.messages) {
      const msgs = this.messagesBySessionId.get(msg.sessionId) || [];
      msgs.push(msg);
      this.messagesBySessionId.set(msg.sessionId, msgs);
    }
  }

  private save() {
    try {
      const tempPath = DB_PATH + ".tmp";
      fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2), "utf-8");
      fs.renameSync(tempPath, DB_PATH);
    } catch (err) {
      console.error("[DB SAVE ERROR]", err);
    }
  }

  public getSessionByToken(token: string): ChatSession | undefined {
    return this.sessionsByToken.get(token);
  }

  public getSessionById(id: string): ChatSession | undefined {
    return this.data.sessions.find((s) => s.id === id);
  }

  public getActiveSessionByToken(token: string): ChatSession | undefined {
    const session = this.getSessionByToken(token);
    if (session && session.status === "ACTIVE") {
      return session;
    }
    return undefined;
  }

  public createSession(token: string, expiryMs = 60 * 60 * 1000): ChatSession { // Default to 1 hour
    const now = new Date();
    const expiresAt = new Date(Date.now() + expiryMs);

    // Close any existing active sessions with this token to prevent fixation
    const existing = this.sessionsByToken.get(token);
    if (existing && existing.status === "ACTIVE") {
      existing.status = "CLOSED";
      existing.updatedAt = now;
      existing.sessionVersion += 1;
    }

    const session: ChatSession = {
      id: crypto.randomUUID(),
      sessionToken: token,
      status: "ACTIVE",
      createdAt: now,
      updatedAt: now,
      lastActiveAt: now,
      expiresAt,
      promptSuppressed: false,
      guestMode: false,
      sessionVersion: 1,
      isProcessing: false,
    };

    this.data.sessions.push(session);
    this.sessionsByToken.set(token, session);
    this.save();
    return session;
  }

  public getMessagesBySessionId(sessionId: string): ChatMessage[] {
    return this.messagesBySessionId.get(sessionId) || [];
  }

  public addMessage(
    sessionId: string,
    role: "user" | "assistant" | "system",
    content: string,
    metadata?: any
  ): ChatMessage {
    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      sessionId,
      role,
      content,
      metadata: metadata || null,
      createdAt: new Date().toISOString(),
    };

    this.data.messages.push(msg);

    // Update index
    const msgs = this.messagesBySessionId.get(sessionId) || [];
    msgs.push(msg);
    this.messagesBySessionId.set(sessionId, msgs);

    // Update session audit fields
    const session = this.data.sessions.find((s) => s.id === sessionId);
    if (session) {
      const now = new Date();
      session.updatedAt = now;
      session.lastActiveAt = now;
      if (role === "user") {
        session.lastMessageAt = now;
      }
      session.sessionVersion += 1;
    }

    this.save();
    return msg;
  }

  public tryAcquireProcessingLock(sessionId: string, staleThresholdMs = 30000): boolean {
    const now = new Date();
    const session = this.data.sessions.find((s) => s.id === sessionId);
    if (!session) return false;

    const isStale = session.isProcessing && session.processingStartedAt &&
      (now.getTime() - session.processingStartedAt.getTime() > staleThresholdMs);

    if (!session.isProcessing || isStale) {
      session.isProcessing = true;
      session.processingStartedAt = now;
      session.updatedAt = now;
      session.sessionVersion += 1;
      this.save();
      return true;
    }
    return false;
  }

  public releaseProcessingLock(sessionId: string) {
    const session = this.data.sessions.find((s) => s.id === sessionId);
    if (session && session.isProcessing) {
      session.isProcessing = false;
      session.processingStartedAt = undefined;
      session.updatedAt = new Date();
      session.sessionVersion += 1;
      this.save();
    }
  }

  public expireSession(sessionId: string) {
    const session = this.data.sessions.find((s) => s.id === sessionId);
    if (session) {
      session.status = "EXPIRED";
      session.updatedAt = new Date();
      session.sessionVersion += 1;
      this.save();
    }
  }

  public closeSession(sessionId: string) {
    const session = this.data.sessions.find((s) => s.id === sessionId);
    if (session) {
      session.status = "CLOSED";
      session.updatedAt = new Date();
      session.sessionVersion += 1;
      this.save();
    }
  }

  public updateSessionActivity(sessionId: string, expiryMs = 60 * 60 * 1000) { // Default to 1 hour
    const session = this.data.sessions.find((s) => s.id === sessionId);
    if (session) {
      const now = new Date();
      const expiresAt = new Date(Date.now() + expiryMs);
      session.lastActiveAt = now;
      session.expiresAt = expiresAt;
      session.updatedAt = now;
      session.sessionVersion += 1;
      this.save();
    }
  }

  public updateSessionPromptSuppression(sessionId: string, suppressed: boolean) {
    const session = this.data.sessions.find((s) => s.id === sessionId);
    if (session) {
      session.promptSuppressed = suppressed;
      session.updatedAt = new Date();
      session.sessionVersion += 1;
      this.save();
    }
  }

  public enableGuestMode(sessionId: string, expiryMs = 60 * 60 * 1000) {
    const session = this.data.sessions.find((s) => s.id === sessionId);
    if (session) {
      const now = new Date();
      session.guestMode = true;
      session.expiresAt = new Date(now.getTime() + expiryMs);
      session.updatedAt = now;
      session.sessionVersion += 1;
      this.save();
    }
  }

  public disableGuestMode(sessionId: string) {
    const session = this.data.sessions.find((s) => s.id === sessionId);
    if (session) {
      session.guestMode = false;
      session.updatedAt = new Date();
      session.sessionVersion += 1;
      this.save();
    }
  }

  public deleteSession(sessionId: string) {
    this.data.sessions = this.data.sessions.filter((s) => s.id !== sessionId);
    this.data.messages = this.data.messages.filter((m) => m.sessionId !== sessionId);
    this.rebuildIndexes();
    this.save();
  }

  public migrateSessionToken(oldToken: string, newToken: string) {
    const session = this.data.sessions.find((s) => s.sessionToken === oldToken && s.status === "ACTIVE");
    if (session) {
      // Close any active session already holding the newToken
      const existing = this.data.sessions.find((s) => s.sessionToken === newToken && s.status === "ACTIVE" && s.id !== session.id);
      if (existing) {
        existing.status = "CLOSED";
        existing.updatedAt = new Date();
        existing.sessionVersion += 1;
      }
      
      session.sessionToken = newToken;
      session.updatedAt = new Date();
      session.sessionVersion += 1;
      this.rebuildIndexes();
      this.save();
    }
  }

  public clearSessionMessages(sessionId: string) {
    this.data.messages = this.data.messages.filter((m) => m.sessionId !== sessionId);
    const session = this.data.sessions.find((s) => s.id === sessionId);
    if (session) {
      session.promptSuppressed = true;
      session.updatedAt = new Date();
      session.sessionVersion += 1;
    }
    this.rebuildIndexes();
    this.save();
  }

  public softClearSessionMessages(sessionId: string) {
    let updated = false;
    for (const msg of this.data.messages) {
      if (msg.sessionId === sessionId) {
        if (!msg.metadata) {
          msg.metadata = {};
        }
        if (!msg.metadata.cleared) {
          msg.metadata.cleared = true;
          updated = true;
        }
      }
    }
    const session = this.data.sessions.find((s) => s.id === sessionId);
    if (session) {
      session.promptSuppressed = true;
      session.updatedAt = new Date();
      session.sessionVersion += 1;
      updated = true;
    }
    if (updated) {
      this.save();
    }
  }

  public cleanupExpiredSessions(daysToPrune = 30) {
    const threshold = Date.now() - daysToPrune * 24 * 60 * 60 * 1000;
    this.data.sessions = this.data.sessions.filter((s) => {
      const isOld = s.lastActiveAt.getTime() < threshold;
      return !(s.status === "EXPIRED" && isOld);
    });
    this.rebuildIndexes();
    this.save();
  }

  public cleanupStaleLocks(staleThresholdMs = 30000) {
    const now = Date.now();
    let updated = false;
    for (const session of this.data.sessions) {
      if (session.isProcessing && session.processingStartedAt) {
        if (now - session.processingStartedAt.getTime() > staleThresholdMs) {
          session.isProcessing = false;
          session.processingStartedAt = undefined;
          session.updatedAt = new Date();
          session.sessionVersion += 1;
          updated = true;
        }
      }
    }
    if (updated) {
      this.save();
    }
  }

  public cleanupOldAnonymousChats(daysToKeep = 7) {
    const threshold = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;
    
    const expiredAnonymousSessionIds = new Set(
      this.data.sessions
        .filter((s) => s.status !== "ACTIVE" && !s.guestMode && s.lastActiveAt.getTime() < threshold)
        .map((s) => s.id)
    );

    if (expiredAnonymousSessionIds.size > 0) {
      this.data.sessions = this.data.sessions.filter((s) => !expiredAnonymousSessionIds.has(s.id));
      this.data.messages = this.data.messages.filter((m) => !expiredAnonymousSessionIds.has(m.sessionId));
      this.rebuildIndexes();
      this.save();
    }
  }
}

// Global safe DB instance for Next.js HMR
const globalForDB = globalThis as unknown as {
  dbInstance?: LocalFileDB;
};

export const db = globalForDB.dbInstance || new LocalFileDB();

if (process.env.NODE_ENV !== "production") {
  globalForDB.dbInstance = db;
}
