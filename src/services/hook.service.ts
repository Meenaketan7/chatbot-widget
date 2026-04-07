import type { ChatHooks, ChatSession, MailConfig } from "../core/types";

interface HookSessionStore {
  getSession(
    sessionId: string,
  ): Promise<{ session: ChatSession; messages: any[] } | null>;
  updateSession(
    sessionId: string,
    updates: Partial<ChatSession>,
  ): Promise<ChatSession | null>;
}

export interface HookFunction<T = any> {
  (...args: any[]): Promise<T>;
  enabled?: boolean;
  config?: any;
}

export interface ExposedHooks {
  sendEmail: HookFunction<boolean>;
  onComplete: HookFunction<any>;
  onOpen: HookFunction<any>;
}

export class HooksService {
  private config: ChatHooks;
  private sessionStore?: HookSessionStore;
  private sessionId: string;
  private chatbotInstance: any;

  constructor(
    config: ChatHooks = {},
    sessionStore?: HookSessionStore,
    sessionId?: string,
  ) {
    this.config = config;
    this.sessionStore = sessionStore;
    this.sessionId = sessionId || "";
  }

  setContext(sessionId: string, chatbotInstance: any) {
    this.sessionId = sessionId;
    this.chatbotInstance = chatbotInstance;
  }

  async executeOnOpen(sessionId?: string, chatbotInstance?: any): Promise<any> {
    const finalSessionId = sessionId || this.sessionId;
    const finalInstance = chatbotInstance || this.chatbotInstance;
    const onOpenConfig = this.config.onOpen;

    if (!onOpenConfig?.enabled) return null;

    try {
      if (onOpenConfig.customAction) {
        return await onOpenConfig.customAction(finalSessionId, finalInstance);
      }

      if (onOpenConfig.defaultAction !== false) {
        return {
          sessionId: finalSessionId,
          timestamp: new Date().toISOString(),
          action: "opened",
        };
      }
    } catch (error) {
      console.error("onOpen hook failed:", error);
      throw error;
    }

    return null;
  }

  async executeSendEmail(
    sessionId?: string,
    mailConfig?: MailConfig,
    extraData?: Record<string, any>,
  ): Promise<boolean> {
    const finalSessionId = sessionId || this.sessionId;
    const sendEmailConfig = this.config.sendEmail;

    if (!sendEmailConfig?.enabled) {
      console.warn("SendEmail hook is not enabled");
      return false;
    }

    try {
      const baseConfig = mailConfig || sendEmailConfig.config;
      if (!baseConfig) throw new Error("No email configuration provided");

      const isPlainObj = (value: any) =>
        !!value && typeof value === "object" && !Array.isArray(value);
      const normalizedExtra =
        extraData == null
          ? {}
          : typeof extraData === "object"
            ? extraData
            : { value: extraData };
      const extraMetadata = isPlainObj(normalizedExtra.metadata)
        ? normalizedExtra.metadata
        : {};
      const extraRest = isPlainObj(normalizedExtra)
        ? { ...normalizedExtra }
        : {};
      delete extraRest.metadata;

      const finalConfig: MailConfig = {
        ...baseConfig,
        metadata: {
          ...(isPlainObj(baseConfig.metadata) ? baseConfig.metadata : {}),
          ...extraRest,
          ...extraMetadata,
        },
      };

      if (sendEmailConfig.customAction) {
        return !!(await sendEmailConfig.customAction(
          finalSessionId,
          finalConfig,
        ));
      }

      if (sendEmailConfig.defaultAction === false) {
        return false;
      }

      if (!this.sessionStore) {
        console.warn("No local session store available for sendEmail hook");
        return false;
      }

      const requestedAt = new Date().toISOString();
      const existingSession = await this.sessionStore.getSession(finalSessionId);
      const metadata = existingSession?.session.metadata || {};
      const emailRequests = Array.isArray(metadata.emailRequests)
        ? metadata.emailRequests
        : [];

      await this.sessionStore.updateSession(finalSessionId, {
        metadata: {
          ...metadata,
          lastEmailRequest: {
            ...finalConfig,
            requestedAt,
          },
          emailRequests: [
            ...emailRequests,
            {
              ...finalConfig,
              requestedAt,
            },
          ],
        },
      });

      return true;
    } catch (error) {
      console.error("sendEmail hook failed:", error);
      return false;
    }
  }

  async executeOnComplete(sessionId?: string, sessionData?: any): Promise<any> {
    const finalSessionId = sessionId || this.sessionId;
    const onCompleteConfig = this.config.onComplete;

    if (!onCompleteConfig?.enabled) {
      console.warn("OnComplete hook is not enabled");
      return null;
    }

    try {
      let emailSent = false;
      if (this.config.sendEmail?.enabled) {
        emailSent = await this.executeSendEmail(
          finalSessionId,
          undefined,
          sessionData,
        );
      }

      if (onCompleteConfig.customAction) {
        return await onCompleteConfig.customAction(finalSessionId, {
          ...sessionData,
          emailSent,
        });
      }

      const completedAt =
        sessionData?.completedAt || new Date().toISOString();

      if (onCompleteConfig.defaultAction !== false && this.sessionStore) {
        const existingSession = await this.sessionStore.getSession(finalSessionId);
        await this.sessionStore.updateSession(finalSessionId, {
          status: "completed",
          expires_at: completedAt,
          metadata: {
            ...(existingSession?.session.metadata || {}),
            completionData: sessionData || null,
            completedAt,
            emailSent,
          },
        });
      }

      return {
        sessionId: finalSessionId,
        status: "completed",
        emailSent,
        completedAt,
      };
    } catch (error) {
      console.error("onComplete hook failed:", error);
      throw error;
    }
  }

  getHooks(): ExposedHooks {
    const sendEmail: HookFunction<boolean> = (mailConfig?: MailConfig) =>
      this.executeSendEmail(undefined, mailConfig);
    sendEmail.enabled = this.config.sendEmail?.enabled || false;
    sendEmail.config = this.config.sendEmail?.config;

    const onComplete: HookFunction<any> = (sessionData?: any) =>
      this.executeOnComplete(undefined, sessionData);
    onComplete.enabled = this.config.onComplete?.enabled || false;

    const onOpen: HookFunction<any> = () => this.executeOnOpen();
    onOpen.enabled = this.config.onOpen?.enabled || false;

    return {
      sendEmail,
      onComplete,
      onOpen,
    };
  }

  updateConfig(config: Partial<ChatHooks>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): ChatHooks {
    return { ...this.config };
  }
}
