import type {
  ChatbotConfig,
  ChatMessage,
  ChatbotState,
  InputFieldType,
  OptionSelectionMeta,
} from "../core/types";

export interface UIHandlers {
  onToggle: () => void;
  onSend: (msg: string) => void;
  onClose: () => void;
  onReset: () => void;
  onSync?: () => void;
  onRetry?: () => void;
  onOptionSelect: (
    optionId: string,
    optionText: string,
    messageId: string,
    meta?: OptionSelectionMeta,
  ) => void;
  onInputTypeChange?: (type: InputFieldType) => void;
}

export interface UIController {
  setOpen(open: boolean): void;
  setTyping(isTyping: boolean, role?: "user" | "assistant"): void;
  renderMessages(messages: ChatMessage[]): void;
  updateConfig(newConfig: ChatbotConfig): void;
  focusInput(): void;
  setInputDisabled(disabled: boolean): void;
  updateConnectionStatus(isOnline: boolean): void;
  updateSyncStatus(status: "synced" | "pending" | "failed"): void;
  setInputType(
    type: InputFieldType,
    inputConfig?: Partial<ChatbotConfig["inputConfig"]>,
  ): void;
}

export interface PhoneSelection {
  dialCode: string;
  countryCode: string;
}

export interface MessageRendererOptions {
  body: HTMLElement;
  config: ChatbotConfig;
  state: ChatbotState;
  handlers: UIHandlers;
  scrollToBottom: (instant?: boolean) => void;
}
