import type { ChatbotConfig } from "../core/types";

export const DEFAULT_CONFIG: Partial<ChatbotConfig> = {
  // Appearance
  primaryColor: "#8b5cf6",
  secondaryColor: "#6366f1",
  backgroundColor: "#ffffff",
  textColor: "#333333",
  borderRadius: "16px",

  // Behavior
  position: "bottom-right",
  autoOpen: false,
  persistMessages: true,
  maxMessages: 200,

  // Content
  title: "Chat Support",
  placeholder: "Type your message...",
  welcomeMessage: "Hello! How can I help you today?",
  errorMessage: "Sorry, something went wrong. Please try again.",
  typingMessage: "Typing...",

  // Icons
  chatIcon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>`,
  botIcon: "🤖",
  userIcon: "👤",
  fontFamily:
    'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',

  // Storage
  storageKey: "chatbot-widget",
  storage: {
    strategy: "localStorage",
    namespace: "chatbot-widget",
  },
  autoOpenDelayMs: 0,
};

export const STORAGE_KEY_PARTS = {
  MESSAGES: "messages",
  SESSION: "sessions",
  CONFIG: "config",
} as const;

export const EVENTS = {
  OPEN: "chatbot:open",
  CLOSE: "chatbot:close",
  MESSAGE: "chatbot:message",
  ERROR: "chatbot:error",
  RESET: "chatbot:reset",
  SYNC: "chatbot:sync",
  ONLINE: "chatbot:online",
  OFFLINE: "chatbot:offline",
} as const;
