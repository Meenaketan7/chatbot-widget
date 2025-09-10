// Core types and interfaces for the chatbot widget
export interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

export interface ChatbotConfig {
  // Appearance
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  borderRadius?: string;

  // Behavior
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  autoOpen?: boolean;
  persistMessages?: boolean;
  maxMessages?: number;

  // Content
  title?: string;
  placeholder?: string;
  welcomeMessage?: string;
  errorMessage?: string;
  typingMessage?: string;

  // Icons
  chatIcon?: string | HTMLElement;
  botIcon?: string | HTMLElement;
  userIcon?: string | HTMLElement;

  // Callbacks (prepare for future API integration)
  onMessageSend?: (message: string) => Promise<string> | string;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Error) => void;
}

export interface ChatbotState {
  isOpen: boolean;
  isTyping: boolean;
  messages: ChatMessage[];
  currentInput: string;
}

export interface ChatbotAPI {
  open(): void;
  close(): void;
  toggle(): void;
  sendMessage(message: string): void;
  clearMessages(): void;
  destroy(): void;
  updateConfig(config: Partial<ChatbotConfig>): void;
}

export type ChatbotEventType = "open" | "close" | "message" | "error";

export interface ChatbotEvent {
  type: ChatbotEventType;
  data?: any;
}
