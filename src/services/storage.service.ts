import type { ChatMessage, StorageConfig, ChatSession } from "../core/types";
import { STORAGE_KEY_PARTS } from "../config/default.config";

export class StorageService {
  private config: StorageConfig;
  private namespace: string;

  constructor(config: StorageConfig) {
    this.config = config;
    this.namespace = config.namespace || "chatbot-widget";
  }

  private getStorageKey(part: keyof typeof STORAGE_KEY_PARTS): string {
    return `${this.namespace}:${STORAGE_KEY_PARTS[part]}`;
  }

  /**
   * Save session data to localStorage
   */
  saveSession(sessionId: string, session: ChatSession): void {
    try {
      const sessions = this.getAllSessions().filter(
        (s) => s && typeof s.session_id === "string",
      );
      const existingIndex = sessions.findIndex(
        (s) => s.session_id === sessionId,
      );

      if (existingIndex >= 0) {
        sessions[existingIndex] = session;
      } else {
        sessions.push(session);
      }

      // Keep only recent sessions (max 50)
      const maxSessions = this.config.maxSessions || 50;
      const sortedSessions = sessions
        .sort(
          (a, b) =>
            new Date(b.created_at || 0).getTime() -
            new Date(a.created_at || 0).getTime(),
        )
        .slice(0, maxSessions);

      localStorage.setItem(
        this.getStorageKey("SESSION"),
        JSON.stringify(sortedSessions),
      );
    } catch (error) {
      console.error("Failed to save session:", error);
    }
  }

  /**
   * Get session from localStorage
   */
  getSession(sessionId: string): ChatSession | null {
    try {
      const sessions = this.getAllSessions();
      if (!Array.isArray(sessions) || sessions.length === 0) return null;
      const safeSessions = sessions.filter(
        (s) => s && typeof s.session_id === "string",
      );
      return safeSessions.find((s) => s.session_id === sessionId) || null;
    } catch (error) {
      console.error("Failed to get session:", error);
      return null;
    }
  }

  /**
   * Get all sessions from localStorage
   */
  getAllSessions(): ChatSession[] {
    try {
      const raw = localStorage.getItem(this.getStorageKey("SESSION"));
      if (!raw) return [];

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];

      // filter null/malformed entries so callers don't get s === null
      return parsed.filter((p) => p && typeof p.session_id === "string");
    } catch (error) {
      console.error("Failed to get all sessions:", error);
      return [];
    }
  }

  /**
   * Save messages to localStorage
   */
  saveMessages(sessionId: string, messages: ChatMessage[]): void {
    try {
      const allMessages = this.getAllMessages();
      const maxMessages = this.config.maxMessagesPerSession;
      const truncatedMessages =
        typeof maxMessages === "number" && maxMessages > 0
          ? (messages || []).slice(-maxMessages)
          : messages || [];

      // normalize timestamps to ISO string
      allMessages[sessionId] = truncatedMessages.map((msg) => {
        let tsIso = new Date().toISOString();
        try {
          if (msg.timestamp instanceof Date) {
            tsIso = msg.timestamp.toISOString();
          } else if (typeof msg.timestamp === "string") {
            tsIso = new Date(msg.timestamp).toISOString();
          } else if (typeof msg.created_at === "string") {
            tsIso = new Date(msg.created_at).toISOString();
          }
        } catch (e) {
          // fallback to now
          tsIso = new Date().toISOString();
        }

        return {
          ...msg,
          timestamp: tsIso,
        };
      });

      localStorage.setItem(
        this.getStorageKey("MESSAGES"),
        JSON.stringify(allMessages),
      );
    } catch (error) {
      console.error("Failed to save messages:", error);
    }
  }

  /**
   * Get messages from localStorage
   */
  getMessages(sessionId: string): ChatMessage[] {
    try {
      const allMessages = this.getAllMessages();
      const sessionMessages = Array.isArray(allMessages[sessionId])
        ? allMessages[sessionId]
        : [];

      return sessionMessages.map((msg) => {
        // convert timestamp back to Date safely
        try {
          return {
            ...msg,
            timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
          };
        } catch (e) {
          return {
            ...msg,
            timestamp: new Date(),
          };
        }
      });
    } catch (error) {
      console.error("Failed to get messages:", error);
      return [];
    }
  }

  /**
   * Get all messages grouped by session
   */
  private getAllMessages(): Record<string, any[]> {
    try {
      const raw = localStorage.getItem(this.getStorageKey("MESSAGES"));
      if (!raw) return {};

      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return {};

      // ensure each session key has an array
      const safe: Record<string, any[]> = {};
      Object.keys(parsed).forEach((k) => {
        if (Array.isArray(parsed[k])) {
          safe[k] = parsed[k].filter((m) => m != null);
        }
      });

      return safe;
    } catch (error) {
      console.error("Failed to get all messages:", error);
      return {};
    }
  }

  /**
   * Clear session data
   */
  clearSession(sessionId: string): void {
    try {
      // Remove from sessions
      const sessions = this.getAllSessions().filter(
        (s) => s.session_id !== sessionId,
      );
      localStorage.setItem(
        this.getStorageKey("SESSION"),
        JSON.stringify(sessions),
      );

      // Remove messages
      const allMessages = this.getAllMessages();
      delete allMessages[sessionId];
      localStorage.setItem(
        this.getStorageKey("MESSAGES"),
        JSON.stringify(allMessages),
      );
    } catch (error) {
      console.error("Failed to clear session:", error);
    }
  }

  /**
   * Clear all data
   */
  clearAll(): void {
    try {
      Object.keys(STORAGE_KEY_PARTS).forEach((part) => {
        localStorage.removeItem(
          this.getStorageKey(part as keyof typeof STORAGE_KEY_PARTS),
        );
      });
    } catch (error) {
      console.error("Failed to clear all storage:", error);
    }
  }

  /**
   * Get storage usage info
   */
  getStorageInfo(): { used: number; total: number; percentage: number } {
    try {
      let used = 0;
      Object.keys(STORAGE_KEY_PARTS).forEach((part) => {
        const item = localStorage.getItem(
          this.getStorageKey(part as keyof typeof STORAGE_KEY_PARTS),
        );
        if (item) {
          used += new Blob([item]).size;
        }
      });

      const total = 5 * 1024 * 1024; // 5MB typical localStorage limit
      return {
        used,
        total,
        percentage: Math.round((used / total) * 100),
      };
    } catch (error) {
      console.error("Failed to get storage info:", error);
      return { used: 0, total: 0, percentage: 0 };
    }
  }
}
