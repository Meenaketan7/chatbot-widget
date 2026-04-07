import type {
  ChatbotConfig,
  ChatbotState,
  ChatMessage,
  MessageType,
  OptionSelectionMeta,
  SyncStatusInfo,
  MailConfig,
} from "./types";
import { createUI } from "../ui/ui";
import {
  generateId,
  sanitizeHtml,
  generateSessionId,
  deepMerge,
  createEventEmitter,
} from "./utils";
import { DEFAULT_CONFIG } from "../config/default.config";
import { MessageService } from "../services/message.service";
import { ExposedHooks, HooksService } from "../services/hook.service";

export class Chatbot {
  private config!: ChatbotConfig;
  private state!: ChatbotState;
  private root!: HTMLElement;
  private ui!: ReturnType<typeof createUI>;
  private sessionId!: string;
  private messageService!: MessageService;
  private eventEmitter = createEventEmitter();
  private static instance: Chatbot | null = null;
  // Add to existing private properties
  private hooksService?: HooksService;

  constructor(config: Partial<ChatbotConfig> = {}) {
    if (Chatbot.instance) {
      console.warn("Chatbot instance already exists. Use existing instance.");
      return Chatbot.instance;
    }

    // Merge with default config
    this.config = deepMerge(DEFAULT_CONFIG, config) as ChatbotConfig;

    // Initialize session
    this.sessionId = this.generateSessionId();

    // Initialize message service
    this.initializeMessageService();

    // Remove existing instance if any
    this.removeExistingInstance();

    // Initialize state - do this synchronously first
    this.initializeStateSync();

    // Create UI
    this.createUserInterface();

    // Set singleton instance
    Chatbot.instance = this;

    // Initialize features asynchronously
    this.initializeFeatures();
    // Initialize hooks service
    this.initializeHooksService();
  }
  /**
   * Initialize hooks service
   */
  private initializeHooksService(): void {
    if (this.config.ChatHooks) {
      this.hooksService = new HooksService(
        this.config.ChatHooks,
        this.messageService,
        this.sessionId,
      );

      // Set context for hooks
      this.hooksService.setContext(this.sessionId, this);
    }
  }
  /**
   * Initialize message service with local storage configuration
   */
  private initializeMessageService(): void {
    this.messageService = new MessageService({
      strategy: "localStorage",
      namespace: this.config.storage?.namespace || this.config.storageKey,
      maxSessions: this.config.storage?.maxSessions,
      maxMessagesPerSession:
        this.config.storage?.maxMessagesPerSession || this.config.maxMessages,
    });
  }

  /**
   * Remove existing chatbot instance
   */
  private removeExistingInstance(): void {
    const existingRoot = document.querySelector(
      ".chatbot-widget-root",
    ) as HTMLElement;
    if (existingRoot) {
      existingRoot.remove();
    }
  }

  /**
   * Initialize chatbot state synchronously
   */
  private initializeStateSync(): void {
    this.state = {
      isOpen: false,
      isTyping: false,
      messages: [], // Start with empty, load async
      currentInput: "",
      inputDisabled: false,
      waitingForOptionSelection: false,
      isOnline: navigator.onLine,
      syncStatus: "synced",
    };
  }

  /**
   * Initialize chatbot state asynchronously
   */
  private async initializeStateAsync(): Promise<void> {
    let persistedMessages: ChatMessage[] = [];

    if (this.config.persistMessages) {
      try {
        const sessionData = await this.messageService.getSession(
          this.sessionId,
        );
        if (sessionData) {
          persistedMessages = sessionData.messages;
        }
      } catch (error) {
        console.error("Failed to load persisted messages:", error);
      }
    }

    this.state.messages = persistedMessages;
    this.ui.renderMessages(this.state.messages);
  }

  /**
   * Create user interface
   */
  private createUserInterface(): void {
    this.root = document.createElement("div");
    this.root.className = "chatbot-widget-root";
    document.body.appendChild(this.root);

    this.ui = createUI(this.root, this.config, this.state, {
      onToggle: () => this.toggle(),
      onSend: (msg) => this.sendMessage(msg),
      onClose: () => this.close(),
      onReset: () => this.resetSession(),
      onOptionSelect: (optionId, optionText, messageId, meta) =>
        this.handleOptionSelection(optionId, optionText, messageId, meta),
      onSync: () => this.sync(),
      onRetry: () => this.retry(),
    });
  }

  /**
   * Initialize additional features
   */
  private async initializeFeatures(): Promise<void> {
    // Load persisted messages
    await this.initializeStateAsync();

    // Handle auto-open
    if (this.config.autoOpen) {
      setTimeout(() => {
        void this.open();
      }, this.config.autoOpenDelayMs ?? 0);
    }

    // Add welcome message if no messages exist
    if (this.state.messages.length === 0 && this.config.welcomeMessage) {
      setTimeout(() => this.addWelcomeMessage(), 300);
    }

    // Initialize online/offline handling
    this.initializeNetworkHandling();

    // Update input state
    this.updateInputState();

  }

  /**
   * Initialize network status handling
   */
  private initializeNetworkHandling(): void {
    window.addEventListener("online", () => {
      this.state.isOnline = true;
      this.eventEmitter.emit("online");
      this.ui.updateConnectionStatus(true);
      void this.sync();
    });

    window.addEventListener("offline", () => {
      this.state.isOnline = false;
      this.eventEmitter.emit("offline");
      this.ui.updateConnectionStatus(false);
    });
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return generateSessionId(
      "session",
      this.config.user_id,
      this.config.bot_id,
    );
  }

  /**
   * Add welcome message
   */
  private async addWelcomeMessage(): Promise<void> {
    if (!this.config.welcomeMessage) return;

    const welcomeMessage: ChatMessage = {
      id: generateId(),
      message_id: generateId(),
      type: "text",
      content: this.config.welcomeMessage,
      role: "assistant",
      timestamp: new Date(),
      session_id: this.sessionId,
    };

    await this.addMessageInternal(welcomeMessage);
  }

  /**
   * Reset session
   */
  async resetSession(): Promise<void> {
    try {
      const previousSessionId = this.sessionId;
      await this.messageService.expireSession(previousSessionId);

      // Generate new session ID
      this.sessionId = this.generateSessionId();

      // Clear local state
      this.state.messages = [];
      this.state.inputDisabled = false;
      this.state.waitingForOptionSelection = false;
      this.state.isTyping = false;

      // Clear browser storage
      this.clearLocalSessionData(previousSessionId);

      // Update UI
      this.ui.setInputDisabled(false);
      this.ui.setTyping(false);
      this.ui.renderMessages(this.state.messages);

      // Add welcome message for new session
      if (this.config.welcomeMessage) {
        setTimeout(() => this.addWelcomeMessage(), 500);
      }

      // Emit reset event
      this.eventEmitter.emit("reset");
      this.config.onReset?.();

      console.log(`New session started: ${this.sessionId}`);
    } catch (error) {
      console.error("Failed to reset session:", error);
      this.config.onError?.(error as Error);
    }
  }
  /**
   * Clear local session data
   */
  private clearLocalSessionData(_sessionId?: string): void {
    // Clear sessionStorage
    sessionStorage.removeItem("chatFlowStep");
    sessionStorage.removeItem("chatFlowData");
  }
  /**
   * Add message internally
   */
  private async addMessageInternal(message: ChatMessage): Promise<void> {
    try {
      this.state.messages.push(message);

      // Limit messages if configured
      if (
        this.config.maxMessages &&
        this.state.messages.length > this.config.maxMessages
      ) {
        this.state.messages = this.state.messages.slice(
          -this.config.maxMessages,
        );
      }

      // Update UI
      this.ui.renderMessages(this.state.messages);
      this.updateInputState();

      // Persist locally
      if (this.config.persistMessages) {
        await this.messageService.addMessage(this.sessionId, {
          message_id: message.message_id || message.id,
          type: message.type || "text",
          content: message.content || "",
          role: message.role,
          payload: message.payload,
          disabled: message.disabled,
        });
      }
    } catch (error) {
      console.error("Failed to add message:", error);
      this.state.syncStatus = "failed";
      this.ui.updateSyncStatus("failed");
    }
  }

  /**
   * Update input state based on active options
   */
  private updateInputState(): void {
    const hasActiveOptionSelection = this.state.messages.some(
      (msg) =>
        msg.type === "option_selection" &&
        !msg.disabled &&
        msg.role === "assistant",
    );

    this.state.inputDisabled = hasActiveOptionSelection;
    this.state.waitingForOptionSelection = hasActiveOptionSelection;

    this.ui.setInputDisabled(this.state.inputDisabled);
  }

  /**
   * Handle option selection
   */
  private async handleOptionSelection(
    optionId: string,
    optionText: string,
    messageId: string,
    meta?: OptionSelectionMeta,
  ): Promise<void> {
    try {
      // Disable the option message
      await this.updateMessage(messageId, { disabled: true });

      // Add user's selection as a message
      await this.addMessageInternal({
        id: generateId(),
        message_id: generateId(),
        type: "text",
        content: optionText,
        role: "user",
        timestamp: new Date(),
        session_id: this.sessionId,
      });

      // Handle response if callback provided
      if (this.config.onMessageSend) {
        this.handleOptionSelectionResponse(optionId, optionText, meta);
      }
    } catch (error) {
      console.error("Failed to handle option selection:", error);
      this.config.onError?.(error as Error);
    }
  }

  /**
   * Handle option selection response
   */
  private async handleOptionSelectionResponse(
    optionId: string,
    optionText: string,
    meta?: OptionSelectionMeta,
  ): Promise<void> {
    try {
      this.state.isTyping = true;
      this.ui.setTyping(true);

      const result = await Promise.resolve(
        this.config.onMessageSend?.({
          type: "option_selection",
          optionId,
          optionText,
          allowMultiple: !!meta?.allowMultiple,
          optionIds: meta?.optionIds,
          optionTexts: meta?.optionTexts,
          options: meta?.options,
          sessionId: this.sessionId,
        }),
      );

      if (result) {
        await this.handleMessageResult(result);
      }
    } catch (error) {
      console.error("Option selection response error:", error);
      this.config.onError?.(error as Error);
      await this.addErrorMessage();
    } finally {
      this.state.isTyping = false;
      this.ui.setTyping(false);
    }
  }

  /**
   * Handle message result from callback
   */
  private async handleMessageResult(result: any): Promise<void> {
    if (typeof result === "string") {
      await this.pushMessage(result, "assistant");
    } else if (Array.isArray(result)) {
      for (const item of result) {
        await this.addMessageInternal(
          typeof item === "string"
            ? this.createTextMessage(item, "assistant")
            : { ...item, role: "assistant", timestamp: new Date() },
        );
      }
    } else if (
      typeof result === "object" &&
      (result.type || result.content || result.payload)
    ) {
      await this.addMessageInternal({
        id: generateId(),
        message_id: generateId(),
        ...result,
        role: "assistant",
        timestamp: new Date(),
        session_id: this.sessionId,
      });
    } else {
      await this.pushMessage(String(result), "assistant");
    }
  }

  /**
   * Create text message object
   */
  private createTextMessage(
    content: string,
    role: "assistant" | "user" = "assistant",
  ): ChatMessage {
    return {
      id: generateId(),
      message_id: generateId(),
      type: "text",
      content: sanitizeHtml(content),
      role,
      timestamp: new Date(),
      session_id: this.sessionId,
    };
  }

  /**
   * Add error message
   */
  private async addErrorMessage(): Promise<void> {
    await this.addMessageInternal({
      id: generateId(),
      message_id: generateId(),
      type: "text",
      content: this.config.errorMessage || "Sorry, something went wrong.",
      role: "assistant",
      timestamp: new Date(),
      session_id: this.sessionId,
    });
  }

  /**
   * Update message
   */
  private async updateMessage(
    messageId: string,
    updates: Partial<ChatMessage>,
  ): Promise<void> {
    const messageIndex = this.state.messages.findIndex(
      (msg) => msg.id === messageId,
    );
    if (messageIndex === -1) return;

    // Update local message
    this.state.messages[messageIndex] = {
      ...this.state.messages[messageIndex],
      ...updates,
    };

    // Update UI
    this.ui.renderMessages(this.state.messages);

    // Persist locally
    if (this.config.persistMessages) {
      try {
        await this.messageService.updateMessage(
          this.sessionId,
          this.state.messages[messageIndex].message_id || messageId,
          updates,
        );
      } catch (error) {
        console.error("Failed to update message:", error);
      }
    }
  }

  /**
   * Public API Methods
   */

  /**
   * Push a message to the chat
   */
  async pushMessage(
    msg: ChatMessage | string,
    role: "assistant" | "user" = "assistant",
  ): Promise<void> {
    const message =
      typeof msg === "string"
        ? this.createTextMessage(msg, role)
        : {
            ...msg,
            id: msg.id || generateId(),
            message_id: msg.message_id || generateId(),
            timestamp: msg.timestamp || new Date(),
            session_id: this.sessionId,
          };

    await this.addMessageInternal(message);
  }

  /**
   * Push option selection message
   */
  async pushOptionSelection(
    question: string,
    options: Array<{ id: string; text: string; value?: any }>,
    cfg?: {
      allowMultiple?: boolean;
      minSelections?: number;
      maxSelections?: number;
      confirmButtonText?: string;
      required?: boolean;
    },
  ): Promise<void> {
    const message: ChatMessage = {
      id: generateId(),
      message_id: generateId(),
      type: "option_selection",
      content: question,
      role: "assistant",
      timestamp: new Date(),
      payload: { options, ...(cfg || {}) },
      disabled: false,
      session_id: this.sessionId,
    };

    await this.addMessageInternal(message);
  }

  /**
   * Send message
   */
  async sendMessage(
    message: string | { type?: string; payload?: any },
  ): Promise<void> {
    if (this.state.inputDisabled && typeof message === "string") {
      return;
    }

    try {
      // Add user message
      if (typeof message === "string") {
        if (!message.trim()) return;
        await this.pushMessage(message, "user");
      } else {
        await this.addMessageInternal({
          id: generateId(),
          message_id: generateId(),
          type: (message.type || "text") as MessageType,
          content: message.payload?.text || "",
          payload: message.payload,
          role: "user",
          timestamp: new Date(),
          session_id: this.sessionId,
        });
      }

      // Handle response if callback provided
      if (this.config.onMessageSend) {
        this.state.isTyping = true;
        this.ui.setTyping(true);

        const messageWithSession =
          typeof message === "string"
            ? { content: message, sessionId: this.sessionId }
            : { ...message, sessionId: this.sessionId };

        const result = await Promise.resolve(
          this.config.onMessageSend(messageWithSession),
        );

        if (result) {
          await this.handleMessageResult(result);
        }
      }
    } catch (error) {
      console.error("Send message error:", error);
      this.config.onError?.(error as Error);
      await this.addErrorMessage();
    } finally {
      this.state.isTyping = false;
      this.ui.setTyping(false);
    }
  }
  /**
   * Get hooks that users can call directly
   */
  getHooks(): ExposedHooks | null {
    if (!this.hooksService) {
      console.warn("Hooks service not initialized");
      return null;
    }
    return this.hooksService.getHooks();
  }
  /**
   * Complete session - trigger onComplete hook (can be called by user)
   */
  async completeSession(additionalData?: any): Promise<any> {
    if (!this.hooksService) {
      console.warn("No hooks service configured");
      return null;
    }

    try {
      const sessionData = {
        session_id: this.sessionId,
        messages: this.state.messages,
        metadata: {
          ...this.state.messages,
          ...additionalData,
        },
        completedAt: new Date().toISOString(),
      };

      const result = await this.hooksService.executeOnComplete(
        this.sessionId,
        sessionData,
      );

      return result;
    } catch (error) {
      console.error("Session completion failed:", error);
      this.config.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Send email manually (can be called by user)
   */
  async sendEmail(mailConfig?: MailConfig): Promise<boolean> {
    if (!this.hooksService) {
      console.warn("No hooks service configured");
      return false;
    }

    try {
      return await this.hooksService.executeSendEmail(
        this.sessionId,
        mailConfig,
      );
    } catch (error) {
      console.error("Email sending failed:", error);
      this.config.onError?.(error as Error);
      return false;
    }
  }
  /**
   * Set input type dynamically
   * This allows users to change the input field type on the fly
   */
  public setInputType(
    type: "text" | "phone" | "email",
    config?: {
      placeholder?: string;
      phoneConfig?: {
        defaultCountryCode?: string;
        defaultCountry?: string;
        placeholder?: string;
      };
    },
  ): void {
    // Update config
    this.config.inputConfig = {
      type,
      placeholder: config?.placeholder,
      phoneConfig: config?.phoneConfig,
    };

    // Update state
    this.state.currentInputType = type;

    // Update UI
    if (this.ui && typeof this.ui.setInputType === "function") {
      this.ui.setInputType(type, config);
    }

    console.log(`Input type changed to: ${type}`);
  }

  /**
   * Get current input type
   */
  public getInputType(): "text" | "phone" | "email" {
    return (
      this.state.currentInputType || this.config.inputConfig?.type || "text"
    );
  }
  /**
   * Open chat
   */
  async open(): Promise<void> {
    if (this.state.isOpen) return;
    this.state.isOpen = true;
    this.ui.setOpen(true);
    // Execute onOpen hook
    try {
      if (this.hooksService) {
        await this.hooksService.executeOnOpen(this.sessionId, this);
      }
    } catch (error) {
      console.error("onOpen hook execution failed:", error);
      this.config.onError?.(error as Error);
    }
    // Emit events and continue

    this.eventEmitter.emit("open");
    this.config.onOpen?.();
    setTimeout(() => this.ui.focusInput(), 120);
  }

  /**
   * Close chat
   */
  close(): void {
    if (!this.state.isOpen) return;
    this.state.isOpen = false;
    this.ui.setOpen(false);
    this.eventEmitter.emit("close");
    this.config.onClose?.();
  }

  /**
   * Toggle chat
   */
  toggle(): void {
    this.state.isOpen ? this.close() : this.open();
  }

  /**
   * Get open state
   */
  isOpen(): boolean {
    return this.state.isOpen;
  }

  /**
   * Clear messages (alias for resetSession)
   */
  clearMessages(): void {
    this.resetSession();
  }

  /**
   * Sync local persistence state
   */
  async sync(): Promise<void> {
    try {
      this.state.syncStatus = "pending";
      this.ui.updateSyncStatus("pending");

      await this.messageService.sync();

      this.state.syncStatus = "synced";
      this.ui.updateSyncStatus("synced");

      this.eventEmitter.emit("sync");
    } catch (error) {
      console.error("Sync failed:", error);
      this.state.syncStatus = "failed";
      this.ui.updateSyncStatus("failed");
      this.config.onError?.(error as Error);
    }
  }

  /**
   * Retry failed operations
   */
  async retry(): Promise<void> {
    await this.sync();
  }

  /**
   * Get current session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Get all sessions
   */
  getAllSessions(): any[] {
    return this.messageService.getAllSessions();
  }

  /**
   * Update configuration
   */
  updateConfig(cfg: Partial<ChatbotConfig>): void {
    this.config = deepMerge(this.config, cfg);
    this.ui.updateConfig(this.config);
    this.eventEmitter.emit("configUpdate", this.config);
  }

  /**
   * Get current configuration
   */
  getConfig(): ChatbotConfig {
    return { ...this.config };
  }

  /**
   * Get current state
   */
  getState(): ChatbotState {
    return { ...this.state };
  }

  /**
   * Add event listener
   */
  on(event: string, callback: Function): void {
    this.eventEmitter.on(event, callback);
  }

  /**
   * Remove event listener
   */
  off(event: string, callback: Function): void {
    this.eventEmitter.off(event, callback);
  }

  /**
   * Get connection status
   */
  isOnline(): boolean {
    return this.state.isOnline;
  }

  /**
   * Get sync status
   */
  getSyncStatus(): SyncStatusInfo {
    const serviceStatus = this.messageService.getSyncStatus();
    return {
      ...serviceStatus,
      status: this.state.syncStatus,
    };
  }

  /**
   * Destroy chatbot instance
   */
  destroy(): void {
    if (this.root) {
      this.root.remove();
    }

    // Remove event listeners
    window.removeEventListener("online", () => {});
    window.removeEventListener("offline", () => {});

    Chatbot.instance = null;
    this.eventEmitter.emit("destroy");
  }

  /**
   * Get singleton instance
   */
  static getInstance(): Chatbot | null {
    return Chatbot.instance;
  }
}
