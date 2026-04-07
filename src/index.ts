import { Chatbot } from "./core/chatbot";
import type { ChatbotConfig } from "./core/types";

// Web Component
class ChatbotElement extends HTMLElement {
  chatbot: Chatbot | null = null;

  connectedCallback() {
    if (!this.chatbot) {
      const config: Partial<ChatbotConfig> = {
        title: this.getAttribute("title") || undefined,
        position: (this.getAttribute("position") as any) || "bottom-right",
        primaryColor: this.getAttribute("primary-color") || undefined,
        secondaryColor: this.getAttribute("secondary-color") || undefined,
        welcomeMessage: this.getAttribute("welcome-message") || undefined,
        autoOpen: this.hasAttribute("auto-open"),
        storageKey: this.getAttribute("storage-key") || undefined,
        fontFamily: this.getAttribute("font-family") || undefined,
      };

      this.chatbot = new Chatbot(config);
    }
  }

  disconnectedCallback() {
    this.chatbot?.destroy();
    this.chatbot = null;
  }

  // Public methods for external access
  open() {
    this.chatbot?.open();
  }

  close() {
    this.chatbot?.close();
  }

  isOpen() {
    return this.chatbot?.isOpen() || false;
  }

  sendMessage(message: string) {
    this.chatbot?.sendMessage(message);
  }

  clearMessages() {
    this.chatbot?.clearMessages();
  }

  resetSession() {
    this.chatbot?.resetSession();
  }

  updateConfig(config: Partial<ChatbotConfig>) {
    this.chatbot?.updateConfig(config);
  }
}

// Register web component if not already registered
if (!customElements.get("chatbot-widget")) {
  customElements.define("chatbot-widget", ChatbotElement);
}

// Main exports
export { Chatbot, ChatbotElement };
export type {
  ChatbotConfig,
  ChatbotState,
  ChatMessage,
  MessageType,
  StorageStrategy,
  SyncStatus,
  SyncStatusInfo,
} from "./core/types";

// Utility exports
export {
  generateId,
  generateSessionId,
  generateMessageId,
  sanitizeHtml,
  formatTimestamp,
  deepMerge,
} from "./core/utils";
export {
  autoOpenChatbotTTL,
  type AutoOpenChatbotTTLBot,
  type AutoOpenChatbotTTLOptions,
} from "./utils/auto-open-ttl";

// Service exports for advanced usage
export { MessageService } from "./services/message.service";
export { StorageService } from "./services/storage.service";

// Default export for convenience
export default Chatbot;

// Global namespace for UMD builds
if (typeof window !== "undefined") {
  (window as any).UniversalChatbot = {
    Chatbot,
    ChatbotElement,
    autoOpenChatbotTTL: () =>
      import("./utils/auto-open-ttl").then((m) => m.autoOpenChatbotTTL),
    MessageService: () =>
      import("./services/message.service").then((m) => m.MessageService),
    StorageService: () =>
      import("./services/storage.service").then((m) => m.StorageService),
  };
}
