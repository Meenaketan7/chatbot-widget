// Core types and interfaces for the chatbot widget

export type MessageType =
  | "text"
  | "card"
  | "quick_replies"
  | "image"
  | "system"
  | "option_selection"
  | "multiselect";

export type StorageStrategy = "localStorage";

export type SyncStatus = "synced" | "pending" | "failed";

export type ChatbotPosition =
  | "bottom-right"
  | "bottom-left"
  | "top-right"
  | "top-left";
// Menu item action type
export type MenuActionType = "redirect" | "call" | "email" | "custom";

// Menu item configuration
export interface MenuItemConfig {
  id: string;
  icon: string; // SVG or emoji
  text: string;
  action: MenuActionType;
  actionValue?: string; // URL, phone number, email, or custom identifier
  customHandler?: () => void | Promise<void>;
}

// Input menu configuration
export interface InputMenuConfig {
  enabled: boolean;
  items: MenuItemConfig[];
  position?: "left" | "right"; // Position of menu items relative to send button
  showWhen?: InputFieldType[]; // Show menu only for specific input types
}
// New: Input field types
export type InputFieldType = "text" | "phone" | "email";

// New: Phone input configuration
export interface PhoneInputConfig {
  defaultCountryCode?: string; // e.g., "+91"
  defaultCountry?: string; // e.g., "India"
  placeholder?: string;
}

// New: Input configuration
export interface InputConfig {
  type: InputFieldType;
  placeholder?: string;
  phoneConfig?: PhoneInputConfig;
  menu?: InputMenuConfig;
}
export interface ChatMessage {
  id: string;
  message_id?: string;
  session_id?: string;
  type?: MessageType;
  content?: string;
  role: "user" | "assistant" | "system";
  timestamp: Date;
  payload?: any;
  disabled?: boolean;
  sequence_number?: number;
  created_at?: string; // Added for API compatibility
  updated_at?: string;
  autoScroll?: boolean;
}

export interface ChatSession {
  session_id: string;
  bot_id?: string | null;
  user_id?: string | null;
  status?: "active" | "inactive" | "completed";
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  expires_at?: string;
}

export interface StorageConfig {
  strategy?: StorageStrategy;
  namespace?: string;
  maxSessions?: number;
  maxMessagesPerSession?: number;
}

export interface CreateSessionRequest {
  session_id?: string;
  bot_id?: string;
  user_id?: string;
  metadata?: Record<string, any>;
}

export interface AddMessageRequest {
  message_id?: string;
  type?: MessageType;
  content?: string;
  role: "user" | "assistant" | "system";
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
  minSelections?: number; // ← ADD THIS (for multiselect)
  maxSelections?: number; // ← ADD THIS (for multiselect)
  confirmButtonText?: string; // ← ADD THIS (for multiselect)
  required?: boolean;
}

/**
 * Extra metadata passed to onMessageSend when a user selects options.
 * - For single select, optionId/optionText are used.
 * - For multi select (allowMultiple=true), optionIds/optionTexts contain all selections.
 */
export interface OptionSelectionMeta {
  allowMultiple?: boolean;
  optionIds?: string[];
  optionTexts?: string[];
  options?: Array<{ id: string; text: string; value?: any }>;
}

export interface ChatbotConfig {
  // Appearance
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  borderRadius?: string;

  // Behavior
  position?: ChatbotPosition;
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
  fontFamily?: string;
  //inputConfig
  inputConfig?: InputConfig;
  bot_id?: string;
  user_id?: string;

  // Callbacks
  onMessageSend?: (
    message: string | any,
  ) => Promise<string | any> | string | any;
  onOpen?: () => void;
  onClose?: () => void;
  onReset?: () => void;
  onError?: (error: Error) => void;

  // Storage
  storageKey?: string;
  storage?: StorageConfig;
  autoOpenDelayMs?: number;
  welcomeCard?: any;

  ChatHooks?: ChatHooks;
}

export interface ChatbotState {
  isOpen: boolean;
  isTyping: boolean;
  typingRole?: "user" | "assistant";
  messages: ChatMessage[];
  currentInput: string;
  inputDisabled: boolean;
  waitingForOptionSelection: boolean;
  isOnline: boolean; // Added missing property
  syncStatus: SyncStatus; // Added missing property
  // input type state
  currentInputType?: InputFieldType;
}

export interface ChatbotAPI {
  open(): void;
  close(): void;
  toggle(): void;
  isOpen(): boolean;
  sendMessage(message: string): void;
  clearMessages(): void;
  resetSession(): void;
  destroy(): void;
  updateConfig(config: Partial<ChatbotConfig>): void;
  getSessionId(): string;
  isOnline(): boolean;
  getSyncStatus(): SyncStatusInfo;
  sync(): Promise<void>;
  // New: Input type control
  setInputType(type: InputFieldType, config?: Partial<InputConfig>): void;
}

export interface SyncStatusInfo {
  canSync: boolean;
  queueSize: number;
  status: SyncStatus; // Changed from string to SyncStatus
}

export type ChatbotEventType =
  | "open"
  | "close"
  | "message"
  | "error"
  | "reset"
  | "sync"
  | "online"
  | "offline";

export interface ChatbotEvent {
  type: ChatbotEventType;
  data?: any;
}

export interface MailConfig {
  recipients: string[];
  sender: {
    name: string;
    email: string;
  };
  subject?: string;
  metadata?: Record<string, any>;
}

export interface ChatHooks {
  onComplete?: {
    enabled: boolean;
    customAction?: (sessionId: string, sessionData: any) => Promise<any>;
    defaultAction?: boolean;
  };
  sendEmail?: {
    enabled: boolean;
    customAction?: (sessionId: string, mailConfig: MailConfig) => Promise<any>;
    defaultAction?: boolean;
    config?: MailConfig;
  };
  onOpen?: {
    enabled: boolean;
    customAction?: (sessionId: string, chatbotInstance: any) => Promise<any>;
    defaultAction?: boolean;
  };
}
