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

export type RenderableIconResult = string | Node | null | undefined;
export type RenderableIcon =
  | string
  | Node
  | (() => RenderableIconResult);
// Menu item action type
export type MenuActionType = "redirect" | "call" | "email" | "custom";

export interface MenuActionContext {
  id: string;
  text: string;
  action: MenuActionType;
  actionValue?: string;
  event?: Event;
}

// Menu item configuration
export interface MenuItemConfig {
  id: string;
  icon: RenderableIcon; // SVG/HTML string, DOM node, or render function
  text: string;
  action: MenuActionType;
  actionValue?: string; // URL, phone number, email, or custom identifier
  customHandler?: (context?: MenuActionContext) => void | Promise<void>;
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

export type ThemeValue = string | number;
export type ThemeScalar = string | number;

export interface ChatbotThemeColors {
  primary?: ThemeValue;
  secondary?: ThemeValue;
  panelBackground?: ThemeValue;
  bodyBackground?: ThemeValue;
  footerBackground?: ThemeValue;
  headerBackground?: ThemeValue;
  headerText?: ThemeValue;
  headerSubtext?: ThemeValue;
  headerAvatarBackground?: ThemeValue;
  headerActionBackground?: ThemeValue;
  headerActionHoverBackground?: ThemeValue;
  textPrimary?: ThemeValue;
  textSecondary?: ThemeValue;
  assistantBubbleBackground?: ThemeValue;
  assistantBubbleText?: ThemeValue;
  userBubbleBackground?: ThemeValue;
  userBubbleText?: ThemeValue;
  inputBackground?: ThemeValue;
  inputText?: ThemeValue;
  inputPlaceholder?: ThemeValue;
  borderColor?: ThemeValue;
  fabBackground?: ThemeValue;
  fabText?: ThemeValue;
  optionBackground?: ThemeValue;
  optionText?: ThemeValue;
  menuBackground?: ThemeValue;
  menuText?: ThemeValue;
  menuBorderColor?: ThemeValue;
  sendButtonBackground?: ThemeValue;
  sendButtonText?: ThemeValue;
  sendButtonDisabledBackground?: ThemeValue;
  modalBackground?: ThemeValue;
  modalTitleText?: ThemeValue;
  modalText?: ThemeValue;
  overlayBackground?: ThemeValue;
  resetButtonBackground?: ThemeValue;
  resetButtonText?: ThemeValue;
  resetButtonBorder?: ThemeValue;
  cancelButtonBackground?: ThemeValue;
  cancelButtonText?: ThemeValue;
  cancelButtonBorder?: ThemeValue;
  success?: ThemeValue;
  error?: ThemeValue;
  warning?: ThemeValue;
  scrollbarThumb?: ThemeValue;
  scrollbarThumbHover?: ThemeValue;
}

export interface ChatbotThemeTypography {
  fontFamily?: ThemeValue;
  titleSize?: ThemeValue;
  subtitleSize?: ThemeValue;
  messageSize?: ThemeValue;
  inputSize?: ThemeValue;
  optionSize?: ThemeValue;
  captionSize?: ThemeValue;
  titleWeight?: ThemeValue;
  subtitleWeight?: ThemeValue;
  messageWeight?: ThemeValue;
  lineHeight?: ThemeValue;
}

export interface ChatbotThemeLayout {
  panelWidth?: ThemeValue;
  panelHeight?: ThemeValue;
  panelMaxWidth?: ThemeValue;
  panelMaxHeight?: ThemeValue;
  mobilePanelWidth?: ThemeValue;
  mobilePanelHeight?: ThemeValue;
  mobilePanelMaxWidth?: ThemeValue;
  mobilePanelMaxHeight?: ThemeValue;
  fabSize?: ThemeValue;
  mobileFabSize?: ThemeValue;
  fabWaveSize?: ThemeValue;
  fabBorderWidth?: ThemeValue;
  headerAvatarSize?: ThemeValue;
  headerActionSize?: ThemeValue;
  botAvatarSize?: ThemeValue;
  sendButtonSize?: ThemeValue;
  menuToggleSize?: ThemeValue;
  menuWidth?: ThemeValue;
  countryDropdownWidth?: ThemeValue;
  modalWidth?: ThemeValue;
  messageMaxWidth?: ThemeValue;
  mobileMessageMaxWidth?: ThemeValue;
  optionMinWidth?: ThemeValue;
}

export interface ChatbotThemeSpacing {
  headerPadding?: ThemeValue;
  bodyPadding?: ThemeValue;
  mobileBodyPadding?: ThemeValue;
  footerPadding?: ThemeValue;
  bubblePadding?: ThemeValue;
  optionPadding?: ThemeValue;
  inputPaddingX?: ThemeValue;
  menuPadding?: ThemeValue;
  menuItemPadding?: ThemeValue;
  modalPadding?: ThemeValue;
  countryPickerPadding?: ThemeValue;
  countryItemPadding?: ThemeValue;
  headerGap?: ThemeValue;
  bodyGap?: ThemeValue;
  messageGap?: ThemeValue;
  optionGap?: ThemeValue;
}

export interface ChatbotThemeRadius {
  panel?: ThemeValue;
  fab?: ThemeValue;
  bubble?: ThemeValue;
  bubbleTail?: ThemeValue;
  input?: ThemeValue;
  button?: ThemeValue;
  option?: ThemeValue;
  menu?: ThemeValue;
  modal?: ThemeValue;
  headerAction?: ThemeValue;
}

export interface ChatbotThemeShadows {
  panel?: ThemeValue;
  header?: ThemeValue;
  fab?: ThemeValue;
  fabHover?: ThemeValue;
  assistantBubble?: ThemeValue;
  userBubble?: ThemeValue;
  option?: ThemeValue;
  optionHover?: ThemeValue;
  input?: ThemeValue;
  inputFocus?: ThemeValue;
  sendButton?: ThemeValue;
  menu?: ThemeValue;
  dropdown?: ThemeValue;
  modal?: ThemeValue;
}

export interface ChatbotThemeButtonStyle {
  background?: ThemeValue;
  text?: ThemeValue;
  borderColor?: ThemeValue;
  hoverBackground?: ThemeValue;
  hoverText?: ThemeValue;
  hoverBorderColor?: ThemeValue;
  disabledBackground?: ThemeValue;
  disabledText?: ThemeValue;
  disabledBorderColor?: ThemeValue;
}

export interface ChatbotThemeButtons {
  fab?: ChatbotThemeButtonStyle;
  send?: ChatbotThemeButtonStyle;
  menuToggle?: ChatbotThemeButtonStyle;
  close?: ChatbotThemeButtonStyle;
  headerReset?: ChatbotThemeButtonStyle;
  multiConfirm?: ChatbotThemeButtonStyle;
  modalReset?: ChatbotThemeButtonStyle;
  modalCancel?: ChatbotThemeButtonStyle;
}

export interface ChatbotThemeFabWave {
  enabled?: boolean;
  color?: ThemeValue;
  size?: ThemeValue;
  opacity?: ThemeScalar;
  duration?: ThemeScalar;
}

export interface ChatbotThemeFabStatusDot {
  enabled?: boolean;
  onlineColor?: ThemeValue;
  offlineColor?: ThemeValue;
  size?: ThemeValue;
  top?: ThemeValue;
  left?: ThemeValue;
  borderColor?: ThemeValue;
  borderWidth?: ThemeValue;
  shadow?: ThemeValue;
}

export interface ChatbotThemeFab {
  icon?: RenderableIcon;
  iconSize?: ThemeValue;
  iconColor?: ThemeValue;
  iconBackground?: ThemeValue;
  iconPadding?: ThemeValue;
  iconRadius?: ThemeValue;
  background?: ThemeValue;
  text?: ThemeValue;
  borderColor?: ThemeValue;
  hoverBackground?: ThemeValue;
  hoverText?: ThemeValue;
  hoverBorderColor?: ThemeValue;
  size?: ThemeValue;
  mobileSize?: ThemeValue;
  borderWidth?: ThemeValue;
  radius?: ThemeValue;
  shadow?: ThemeValue;
  hoverShadow?: ThemeValue;
  wave?: ChatbotThemeFabWave;
  statusDot?: ChatbotThemeFabStatusDot;
}

export interface ChatbotThemeIcons {
  send?: RenderableIcon;
  close?: RenderableIcon;
  headerReset?: RenderableIcon;
  menu?: RenderableIcon;
  menuClose?: RenderableIcon;
  multiConfirm?: RenderableIcon;
  modalReset?: RenderableIcon;
  modalCancel?: RenderableIcon;
}

export interface ChatbotTheme {
  colors?: ChatbotThemeColors;
  typography?: ChatbotThemeTypography;
  layout?: ChatbotThemeLayout;
  spacing?: ChatbotThemeSpacing;
  radius?: ChatbotThemeRadius;
  shadows?: ChatbotThemeShadows;
  buttons?: ChatbotThemeButtons;
  fab?: ChatbotThemeFab;
  icons?: ChatbotThemeIcons;
  variables?: Record<string, ThemeValue>;
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
  theme?: ChatbotTheme;

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
  chatIcon?: RenderableIcon;
  botIcon?: RenderableIcon;
  userIcon?: RenderableIcon;
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
  resetTheme(): void;
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
