/**
 * Deep merge objects with proper typing
 */
function isPlainObject(value: unknown): value is Record<string, any> {
  if (!value || typeof value !== "object") return false;

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

export function deepMerge<T extends Record<string, any>>(
  target: T,
  source: Partial<T>,
): T {
  const result = { ...target };

  for (const key in source) {
    if (
      isPlainObject(source[key]) &&
      isPlainObject(result[key])
    ) {
      result[key] = deepMerge(
        result[key],
        source[key] as Partial<T[Extract<keyof T, string>]>,
      );
    } else if (isPlainObject(source[key])) {
      result[key] = deepMerge(
        {} as T[Extract<keyof T, string>],
        source[key] as Partial<T[Extract<keyof T, string>]>,
      );
    } else if (source[key] !== undefined) {
      result[key] = source[key] as T[Extract<keyof T, string>];
    }
  }

  return result;
}

/**
 * Throttle function with proper this context
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function executedFunction(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function sanitizeHtml(input: string): string {
  const div = document.createElement("div");
  div.textContent = input;
  return div.innerHTML;
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

/**
 * Format timestamp for display
 */
export function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString();
}

/**
 * Validate URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate message ID with timestamp
 */
export function generateMessageId(prefix = "msg"): string {
  return `${prefix}_${Date.now()}_${generateId()}`;
}

/**
 * Generate session ID with timestamp
 */
export function generateSessionId(
  prefix = "session",
  userId = "",
  botId = "",
): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  const userSuffix = userId ? `_${userId.slice(-4)}` : "";
  const botSuffix = botId ? `_${botId.slice(-4)}` : "";
  return `${prefix}_${timestamp}_${random}${userSuffix}${botSuffix}`;
}

/**
 * Check if device is mobile
 */
export function isMobile(): boolean {
  return (
    window.innerWidth <= 768 ||
    /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    )
  );
}

/**
 * Get browser info
 */
export function getBrowserInfo(): { name: string; version: string } {
  const ua = navigator.userAgent;
  let name = "Unknown";
  let version = "Unknown";

  if (ua.includes("Chrome")) {
    name = "Chrome";
    version = ua.match(/Chrome\/([0-9.]+)/)?.[1] || version;
  } else if (ua.includes("Firefox")) {
    name = "Firefox";
    version = ua.match(/Firefox\/([0-9.]+)/)?.[1] || version;
  } else if (ua.includes("Safari")) {
    name = "Safari";
    version = ua.match(/Version\/([0-9.]+)/)?.[1] || version;
  } else if (ua.includes("Edge")) {
    name = "Edge";
    version = ua.match(/Edge\/([0-9.]+)/)?.[1] || version;
  }

  return { name, version };
}

/**
 * Escape HTML for security
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };

  return text.replace(/[&<>"']/g, (match) => map[match]);
}

/**
 * Convert string to kebab-case
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

/**
 * Create event emitter
 */
export function createEventEmitter() {
  const events: Record<string, Function[]> = {};

  return {
    on(event: string, callback: Function) {
      if (!events[event]) events[event] = [];
      events[event].push(callback);
    },

    off(event: string, callback: Function) {
      if (!events[event]) return;
      events[event] = events[event].filter((cb) => cb !== callback);
    },

    emit(event: string, ...args: any[]) {
      if (!events[event]) return;
      events[event].forEach((callback) => callback(...args));
    },

    once(event: string, callback: Function) {
      const wrapper = (...args: any[]) => {
        callback(...args);
        this.off(event, wrapper);
      };
      this.on(event, wrapper);
    },
  };
}

/**
 * Storage utilities
 */
export const storage = {
  set(key: string, value: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Failed to set localStorage:", error);
    }
  },

  get<T>(key: string, defaultValue?: T): T | undefined {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error("Failed to get localStorage:", error);
      return defaultValue;
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Failed to remove localStorage:", error);
    }
  },

  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error("Failed to clear localStorage:", error);
    }
  },
};

/**
 * Promise-based timeout
 */
export function timeout(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    attempts?: number;
    delay?: number;
    backoff?: number;
  } = {},
): Promise<T> {
  const { attempts = 3, delay = 1000, backoff = 2 } = options;

  let lastError: any;

  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (i === attempts - 1) break;

      const waitTime = delay * Math.pow(backoff, i);
      await timeout(waitTime);
    }
  }

  throw lastError;
}
