import { ChatbotConfig, ChatbotState, ChatMessage, MessageType } from "./types";
import { createUI } from "./ui";
import { generateId, sanitizeHtml } from "./utils";

export class Chatbot {
  private config!: ChatbotConfig;
  private state!: ChatbotState;
  private root!: HTMLElement;
  private ui!: ReturnType<typeof createUI>;
  private storageKey!: string;
  private sessionId!: string; // NEW: Track current session
  private static instance: Chatbot | null = null;

  constructor(config: Partial<ChatbotConfig> = {}) {
    if (Chatbot.instance) {
      console.warn("Chatbot instance already exists. Use existing instance.");
      return Chatbot.instance;
    }

    this.config = {
      position: "bottom-right",
      autoOpen: false,
      persistMessages: true,
      maxMessages: 200,
      title: "Chat Support",
      placeholder: "Type your message...",
      welcomeMessage: "Hello! How can I help you today?",
      errorMessage: "Sorry something went wrong.",
      typingMessage: "Typing...",
      storageKey: "chatbot_messages",
      autoOpenDelayMs: 0,
      ...config,
    } as ChatbotConfig;

    this.storageKey = this.config.storageKey || "chatbot_messages";
    this.sessionId = this.generateSessionId(); // NEW: Generate unique session ID

    // Check if root already exists
    let existingRoot = document.querySelector(
      ".chatbot-widget-root",
    ) as HTMLElement;
    if (existingRoot) {
      existingRoot.remove(); // Remove existing instance
    }

    // initial state (load persisted if exists)
    const persisted =
      (this.config.persistMessages && this.loadMessages()) || [];

    this.state = {
      isOpen: !!this.config.autoOpen,
      isTyping: false,
      messages: persisted,
      currentInput: "",
      inputDisabled: false,
      waitingForOptionSelection: false,
    };

    // create root and UI
    this.root = document.createElement("div");
    this.root.className = "chatbot-widget-root";
    document.body.appendChild(this.root);

    this.ui = createUI(this.root, this.config, this.state, {
      onToggle: () => this.toggle(),
      onSend: (msg) => this.sendMessage(msg),
      onClose: () => this.close(),
      onReset: () => this.resetSession(), // NEW: Reset session handler
      onOptionSelect: (optionId, optionText, messageId) =>
        this.handleOptionSelection(optionId, optionText, messageId),
    });

    // Set singleton instance
    Chatbot.instance = this;

    // render existing messages
    this.ui.renderMessages(this.state.messages);

    // welcome/proactive
    if (this.config.autoOpen && this.config.autoOpenDelayMs) {
      setTimeout(() => this.open(), this.config.autoOpenDelayMs);
    }

    if (this.state.messages.length === 0 && this.config.welcomeMessage) {
      // push welcome after a short delay
      setTimeout(
        () =>
          this.pushMessage({
            id: generateId(),
            type: "text",
            content: this.config.welcomeMessage,
            role: "assistant",
            timestamp: new Date(),
          }),
        300,
      );
    }

    this.updateInputState();
  }

  // NEW: Generate unique session ID
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // NEW: Reset session method
  resetSession() {
    // Generate new session ID
    this.sessionId = this.generateSessionId();

    // Clear all messages
    this.state.messages = [];

    // Reset input states
    this.state.inputDisabled = false;
    this.state.waitingForOptionSelection = false;
    this.state.isTyping = false;

    // Clear persisted messages
    if (this.config.persistMessages) {
      try {
        localStorage.removeItem(this.storageKey);
      } catch {}
    }

    // Update UI
    this.ui.setInputDisabled(false);
    this.ui.setTyping(false);
    this.ui.renderMessages(this.state.messages);

    // Add welcome message for new session
    if (this.config.welcomeMessage) {
      setTimeout(
        () =>
          this.pushMessage({
            id: generateId(),
            type: "text",
            content: this.config.welcomeMessage,
            role: "assistant",
            timestamp: new Date(),
          }),
        500, // Slight delay to show the reset effect
      );
    }

    // Trigger onReset callback if provided
    this.config.onReset?.();

    console.log(`New session started: ${this.sessionId}`);
  }

  private persist() {
    if (!this.config.persistMessages) return;
    try {
      const storedDataStr = localStorage.getItem(this.storageKey);
      let allSessions = storedDataStr ? JSON.parse(storedDataStr) : [];

      if (!Array.isArray(allSessions)) {
        allSessions = [];
      }

      // Remove current session if exists
      allSessions = allSessions.filter(
        (sess: any) => sess.sessionId !== this.sessionId,
      );

      // Ensure messages are sorted by timestamp
      const orderedMessages = [...this.state.messages].sort(
        (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
      );

      // Push current session
      allSessions.push({
        sessionId: this.sessionId,
        messages: orderedMessages,
        timestamp: Date.now(),
      });

      // Ensure sessions are stored in chronological order
      allSessions.sort((a: any, b: any) => a.timestamp - b.timestamp);

      localStorage.setItem(this.storageKey, JSON.stringify(allSessions));
    } catch {}
  }

  private loadMessages(): ChatMessage[] | null {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return null;

      const allSessions = JSON.parse(raw);
      if (Array.isArray(allSessions) && allSessions.length > 0) {
        // Always load the latest session
        const lastSession = allSessions[allSessions.length - 1];
        this.sessionId = lastSession.sessionId;

        // Sort messages by timestamp to guarantee sequence
        return lastSession.messages
          .map((p: any) => ({
            ...p,
            timestamp: new Date(p.timestamp),
          }))
          .sort(
            (a: any, b: any) => a.timestamp.getTime() - b.timestamp.getTime(),
          );
      }
      return null;
    } catch {
      return null;
    }
  }

  public getAllSessions(): Array<{
    sessionId: string;
    messages: ChatMessage[];
    timestamp: number;
  }> {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return [];

    const sessions = JSON.parse(raw);
    if (Array.isArray(sessions)) {
      // Ensure sessions are ordered and messages inside each session are ordered
      return sessions
        .map((s) => ({
          ...s,
          messages: s.messages
            .map((m: any) => ({
              ...m,
              timestamp: new Date(m.timestamp),
            }))
            .sort(
              (a: any, b: any) => a.timestamp.getTime() - b.timestamp.getTime(),
            ),
        }))
        .sort((a, b) => a.timestamp - b.timestamp);
    }

    return [];
  }
  private updateInputState() {
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

  private handleOptionSelection(
    optionId: string,
    optionText: string,
    messageId: string,
  ) {
    const messageIndex = this.state.messages.findIndex(
      (msg) => msg.id === messageId,
    );
    if (messageIndex === -1) return;

    this.state.messages[messageIndex].disabled = true;

    this.pushMessage({
      id: generateId(),
      type: "text",
      content: optionText,
      role: "user",
      timestamp: new Date(),
    });

    this.updateInputState();

    if (this.config.onMessageSend) {
      this.handleOptionSelectionResponse(optionId, optionText);
    }
  }

  private async handleOptionSelectionResponse(
    optionId: string,
    optionText: string,
  ) {
    try {
      const result = this.config.onMessageSend?.({
        type: "option_selection",
        optionId,
        optionText,
        sessionId: this.sessionId, // NEW: Include session ID in callback
      } as any);

      if (!result) return;

      this.state.isTyping = true;
      this.ui.setTyping(true);

      const resolved = result instanceof Promise ? await result : result;

      const handleResolved = (r: any) => {
        if (!r) return;
        if (typeof r === "string") {
          this.pushMessage(r, "assistant");
        } else if (Array.isArray(r)) {
          r.forEach((item) => this.pushMessage(item, "assistant"));
        } else if (typeof r === "object") {
          if (r.type || r.content || r.payload) {
            this.pushMessage({
              id: generateId(),
              ...r,
              role: "assistant",
              timestamp: new Date(),
            });
          } else {
            this.pushMessage(String(r), "assistant");
          }
        } else {
          this.pushMessage(String(r), "assistant");
        }
      };

      handleResolved(resolved);
    } catch (err: any) {
      this.config.onError?.(err);
      this.pushMessage(
        {
          type: "text",
          content: this.config.errorMessage || "Error",
          role: "assistant",
          id: generateId(),
          timestamp: new Date(),
        },
        "assistant",
      );
    } finally {
      this.state.isTyping = false;
      this.ui.setTyping(false);
      this.persist();
    }
  }

  pushMessage(
    msg: ChatMessage | string,
    role: "assistant" | "user" = "assistant",
  ) {
    let message: ChatMessage;
    if (typeof msg === "string") {
      message = {
        id: generateId(),
        type: "text",
        content: sanitizeHtml(msg),
        role,
        timestamp: new Date(),
      };
    } else {
      message = {
        ...msg,
        id: msg.id || generateId(),
        timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
      };
      message.timestamp = msg.timestamp ? new Date(msg.timestamp) : new Date();
    }

    this.state.messages.push(message);

    if (
      this.config.maxMessages &&
      this.state.messages.length > this.config.maxMessages
    ) {
      this.state.messages = this.state.messages.slice(-this.config.maxMessages);
    }

    this.ui.renderMessages(this.state.messages);
    this.updateInputState();
    this.persist();
  }

  pushOptionSelection(
    question: string,
    options: Array<{ id: string; text: string; value?: any }>,
  ) {
    const message: ChatMessage = {
      id: generateId(),
      type: "option_selection",
      content: question,
      role: "assistant",
      timestamp: new Date(),
      payload: {
        options,
      },
      disabled: false,
    };

    this.pushMessage(message);
  }

  open() {
    if (this.state.isOpen) return;
    this.state.isOpen = true;
    this.ui.setOpen(true);
    this.config.onOpen?.();
    setTimeout(() => this.ui.focusInput(), 120);
  }

  // UPDATED: Close only hides the panel, doesn't affect session
  close() {
    if (!this.state.isOpen) return;
    this.state.isOpen = false;
    this.ui.setOpen(false);
    this.config.onClose?.();
    // Note: Session and messages are preserved when closing
  }

  toggle() {
    this.state.isOpen ? this.close() : this.open();
  }

  async sendMessage(message: string | { type?: string; payload?: any }) {
    if (this.state.inputDisabled && typeof message === "string") {
      return;
    }

    if (typeof message === "string") {
      if (!message.trim()) return;
      this.pushMessage(message, "user");
    } else {
      this.pushMessage(
        {
          id: generateId(),
          type: (message.type || "text") as MessageType,
          content: message.payload?.text || "",
          payload: message.payload,
          role: "user",
          timestamp: new Date(),
        },
        "user",
      );
    }

    try {
      // Include session ID in the message context
      const messageWithSession =
        typeof message === "string"
          ? { content: message, sessionId: this.sessionId }
          : { ...message, sessionId: this.sessionId };

      const result = this.config.onMessageSend?.(messageWithSession);
      if (!result) return;

      this.state.isTyping = true;
      this.ui.setTyping(true);

      const resolved = result instanceof Promise ? await result : result;

      const handleResolved = (r: any) => {
        if (!r) return;
        if (typeof r === "string") {
          this.pushMessage(r, "assistant");
        } else if (Array.isArray(r)) {
          r.forEach((item) => this.pushMessage(item, "assistant"));
        } else if (typeof r === "object") {
          if (r.type || r.content || r.payload) {
            this.pushMessage({
              id: generateId(),
              ...r,
              role: "assistant",
              timestamp: new Date(),
            });
          } else {
            this.pushMessage(String(r), "assistant");
          }
        } else {
          this.pushMessage(String(r), "assistant");
        }
      };

      handleResolved(resolved);
    } catch (err: any) {
      this.config.onError?.(err);
      this.pushMessage(
        {
          type: "text",
          content: this.config.errorMessage || "Error",
          role: "assistant",
          id: generateId(),
          timestamp: new Date(),
        },
        "assistant",
      );
    } finally {
      this.state.isTyping = false;
      this.ui.setTyping(false);
      this.persist();
    }
  }

  // UPDATED: clearMessages now calls resetSession for consistency
  clearMessages() {
    this.resetSession();
  }

  destroy() {
    if (this.root) {
      this.root.remove();
    }
    Chatbot.instance = null;
  }

  updateConfig(cfg: Partial<ChatbotConfig>) {
    this.config = { ...this.config, ...cfg };
    this.ui.updateConfig(this.config);
  }

  // NEW: Get current session ID
  getSessionId(): string {
    return this.sessionId;
  }

  static getInstance(): Chatbot | null {
    return Chatbot.instance;
  }
}
