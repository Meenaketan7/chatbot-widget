import { ChatbotConfig } from "./types";

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function sanitizeHtml(input: string): string {
  const div = document.createElement("div");
  div.textContent = input;
  return div.innerHTML;
}

export function createDefaultConfig(): ChatbotConfig {
  return {
    // Appearance
    primaryColor: "#007bff",
    secondaryColor: "#6c757d",
    backgroundColor: "#ffffff",
    textColor: "#333333",
    borderRadius: "8px",

    // Behavior
    position: "bottom-right",
    autoOpen: false,
    persistMessages: true,
    maxMessages: 100,

    // Content
    title: "Chat Support",
    placeholder: "Type your message...",
    welcomeMessage: "Hello! How can I help you today?",
    errorMessage: "Sorry, something went wrong. Please try again.",
    typingMessage: "Typing...",

    // Icons (using Unicode for universal compatibility)
    chatIcon: "💬",
    botIcon: "🤖",
    userIcon: "👤",
  };
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function isValidColor(color: string): boolean {
  const s = new Option().style;
  s.color = color;
  return s.color !== "";
}

export function createStyleSheet(styles: string): HTMLStyleElement {
  const style = document.createElement("style");
  style.textContent = styles;
  return style;
}
