import { ChatbotConfig, ChatbotState, ChatbotAPI, ChatMessage } from "./types";
import { createUI } from "./ui";
import { generateId } from "./utils";

export class Chatbot implements ChatbotAPI {
  private config: ChatbotConfig;
  private state: ChatbotState;
  private root: HTMLElement;
  private ui: ReturnType<typeof createUI>;

  constructor(config: Partial<ChatbotConfig> = {}) {
    this.config = {
      position: "bottom-right",
      autoOpen: false,
      persistMessages: false,
      maxMessages: 100,
      title: "Chat with us",
      placeholder: "Type a message...",
      welcomeMessage: "Hello 👋 How can I help?",
      errorMessage: "Something went wrong. Please try again.",
      typingMessage: "Bot is typing...",
      ...config,
    };

    this.state = {
      isOpen: !!this.config.autoOpen,
      isTyping: false,
      messages: [],
      currentInput: "",
    };

    // create root container
    this.root = document.createElement("div");
    this.root.className = "chatbot-widget-root";
    document.body.appendChild(this.root);

    // render UI
    this.ui = createUI(this.root, this.config, this.state, {
      onToggle: () => this.toggle(),
      onSend: (msg) => this.sendMessage(msg),
      onClose: () => this.close(),
    });

    if (this.config.welcomeMessage) {
      this.pushMessage(this.config.welcomeMessage, "assistant");
    }
  }

  private pushMessage(content: string, role: "user" | "assistant") {
    const message: ChatMessage = {
      id: generateId(),
      content,
      role,
      timestamp: new Date(),
    };

    this.state.messages.push(message);
    if (
      this.config.maxMessages &&
      this.state.messages.length > this.config.maxMessages
    ) {
      this.state.messages.shift();
    }

    this.ui.renderMessages(this.state.messages);
  }

  open() {
    this.state.isOpen = true;
    this.ui.setOpen(true);
    this.config.onOpen?.();
  }

  close() {
    this.state.isOpen = false;
    this.ui.setOpen(false);
    this.config.onClose?.();
  }

  toggle() {
    this.state.isOpen ? this.close() : this.open();
  }

  sendMessage(message: string) {
    if (!message.trim()) return;

    this.pushMessage(message, "user");

    try {
      const reply = this.config.onMessageSend?.(message);
      if (reply instanceof Promise) {
        this.state.isTyping = true;
        this.ui.setTyping(true);

        reply
          .then((res) => {
            this.state.isTyping = false;
            this.ui.setTyping(false);
            this.pushMessage(res, "assistant");
          })
          .catch((err) => {
            this.config.onError?.(err);
            this.pushMessage(this.config.errorMessage || "Error", "assistant");
          });
      } else if (reply) {
        this.pushMessage(reply, "assistant");
      }
    } catch (err: any) {
      this.config.onError?.(err);
      this.pushMessage(this.config.errorMessage || "Error", "assistant");
    }
  }

  clearMessages() {
    this.state.messages = [];
    this.ui.renderMessages(this.state.messages);
  }

  destroy() {
    this.root.remove();
  }

  updateConfig(config: Partial<ChatbotConfig>) {
    this.config = { ...this.config, ...config };
    this.ui.updateConfig(this.config);
  }
}
