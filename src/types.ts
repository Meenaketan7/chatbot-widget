// Core types and interfaces for the chatbot widget

export type MessageType =
  | "text"
  | "card"
  | "quick_replies"
  | "image"
  | "system"
  | "option_selection";

export interface ChatMessage {
  id: string;
  type?: MessageType;
  content?: string;
  role: "user" | "assistant" | "system";
  timestamp: Date;
  payload?: any;
  disabled?: boolean;
}

export interface OptionSelectionPayload {
  question: string;
  options: Array<{
    id: string;
    text: string;
    value?: any;
  }>;
  allowMultiple?: boolean;
  required?: boolean;
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

  // Callbacks
  onMessageSend?: (message: string | any) => Promise<string> | string;
  onOpen?: () => void;
  onClose?: () => void;
  onReset?: () => void; // NEW: Reset callback
  onError?: (error: Error) => void;
  storageKey?: string;
  autoOpenDelayMs?: number;
  welcomeCard?: any;
}

export interface ChatbotState {
  isOpen: boolean;
  isTyping: boolean;
  messages: ChatMessage[];
  currentInput: string;
  inputDisabled: boolean;
  waitingForOptionSelection: boolean;
}

export interface ChatbotAPI {
  open(): void;
  close(): void;
  toggle(): void;
  sendMessage(message: string): void;
  clearMessages(): void;
  resetSession(): void; // NEW: Reset session method
  destroy(): void;
  updateConfig(config: Partial<ChatbotConfig>): void;
  getSessionId(): string; // NEW: Get session ID
}

export type ChatbotEventType = "open" | "close" | "message" | "error" | "reset"; // NEW: Added reset event

export interface ChatbotEvent {
  type: ChatbotEventType;
  data?: any;
}
