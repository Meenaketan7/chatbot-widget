import type {
  ChatMessage,
  ChatSession,
  CreateSessionRequest,
  AddMessageRequest,
  StorageConfig,
} from "../core/types";
import { StorageService } from "./storage.service";
import { generateId } from "../core/utils";

export class MessageService {
  private storageService: StorageService;

  constructor(storageConfig: StorageConfig = { strategy: "localStorage" }) {
    this.storageService = new StorageService({
      strategy: "localStorage",
      ...storageConfig,
    });
  }

  async ensureSession(
    sessionId: string,
    sessionData?: CreateSessionRequest,
  ): Promise<ChatSession> {
    const existingSession = this.storageService.getSession(sessionId);

    if (existingSession && existingSession.status === "active") {
      return existingSession;
    }

    const newSession: ChatSession = {
      session_id: sessionId,
      bot_id: sessionData?.bot_id || null,
      user_id: sessionData?.user_id || null,
      status: "active",
      metadata: sessionData?.metadata || {},
      created_at:
        existingSession?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      expires_at: existingSession?.expires_at,
    };

    this.storageService.saveSession(sessionId, newSession);
    return newSession;
  }

  async addMessage(
    sessionId: string,
    messageData: AddMessageRequest,
  ): Promise<ChatMessage> {
    await this.ensureSession(sessionId);

    const messages = this.storageService.getMessages(sessionId);
    const timestamp = new Date();
    const message: ChatMessage = {
      id: generateId(),
      message_id: messageData.message_id || generateId(),
      session_id: sessionId,
      type: messageData.type || "text",
      content: messageData.content || "",
      role: messageData.role,
      payload: messageData.payload || {},
      disabled: messageData.disabled || false,
      sequence_number: messages.length + 1,
      timestamp,
      created_at: timestamp.toISOString(),
      updated_at: timestamp.toISOString(),
    };

    messages.push(message);
    this.storageService.saveMessages(sessionId, messages);
    await this.updateSession(sessionId, {
      updated_at: timestamp.toISOString(),
      status: "active",
    });

    return message;
  }

  async sendMessage(
    sessionId: string,
    content: string,
    type: "text" | "option_selection" = "text",
    payload?: any,
  ): Promise<ChatMessage> {
    return this.addMessage(sessionId, {
      message_id: generateId(),
      type,
      content,
      role: "user",
      payload,
    });
  }

  async getSession(
    sessionId: string,
  ): Promise<{ session: ChatSession; messages: ChatMessage[] } | null> {
    const session = this.storageService.getSession(sessionId);
    if (!session) return null;

    return {
      session,
      messages: this.storageService.getMessages(sessionId),
    };
  }

  async updateSession(
    sessionId: string,
    updates: Partial<ChatSession>,
  ): Promise<ChatSession | null> {
    const existingSession =
      this.storageService.getSession(sessionId) ||
      (await this.ensureSession(sessionId));

    const nextMetadata =
      updates.metadata && typeof updates.metadata === "object"
        ? {
            ...(existingSession.metadata || {}),
            ...updates.metadata,
          }
        : existingSession.metadata;

    const updatedSession: ChatSession = {
      ...existingSession,
      ...updates,
      metadata: nextMetadata,
      updated_at: new Date().toISOString(),
    };

    this.storageService.saveSession(sessionId, updatedSession);
    return updatedSession;
  }

  async updateMessage(
    sessionId: string,
    messageId: string,
    updates: Partial<ChatMessage>,
  ): Promise<ChatMessage | null> {
    const messages = this.storageService.getMessages(sessionId);
    const messageIndex = messages.findIndex((m) => m.message_id === messageId);

    if (messageIndex === -1) return null;

    messages[messageIndex] = {
      ...messages[messageIndex],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    this.storageService.saveMessages(sessionId, messages);
    await this.updateSession(sessionId, {
      updated_at: new Date().toISOString(),
    });

    return messages[messageIndex];
  }

  async deleteSession(sessionId: string): Promise<void> {
    this.storageService.clearSession(sessionId);
  }

  async expireSession(sessionId: string): Promise<void> {
    this.storageService.clearSession(sessionId);
  }

  getAllSessions(): ChatSession[] {
    return this.storageService.getAllSessions();
  }

  canSync(): boolean {
    return false;
  }

  async sync(): Promise<void> {
    return Promise.resolve();
  }

  getSyncStatus(): {
    canSync: boolean;
    queueSize: number;
    lastSync?: Date;
  } {
    return {
      canSync: false,
      queueSize: 0,
    };
  }
}
