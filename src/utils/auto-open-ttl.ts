export interface AutoOpenChatbotTTLOptions {
  ttlMs?: number;
  storageKey?: string;
  flowKeysToClear?: string[];
  resetOnFirstOpen?: boolean;
}

export interface AutoOpenChatbotTTLBot {
  isOpen?: () => boolean;
  reset?: () => void | Promise<void>;
  resetChat?: () => void | Promise<void>;
  resetSession?: () => void | Promise<void>;
  clearMessages?: () => void | Promise<void>;
}

interface AutoOpenTTLRegistry {
  listeners: Record<string, (event: StorageEvent) => void>;
  timers: Record<string, number | undefined>;
}

declare global {
  interface Window {
    __chatbotAutoOpenTTLRegistry__?: AutoOpenTTLRegistry;
  }
}

function getRegistry(): AutoOpenTTLRegistry {
  if (!window.__chatbotAutoOpenTTLRegistry__) {
    window.__chatbotAutoOpenTTLRegistry__ = {
      listeners: {},
      timers: {},
    };
  }

  return window.__chatbotAutoOpenTTLRegistry__;
}

export function autoOpenChatbotTTL(
  bot: AutoOpenChatbotTTLBot,
  openAndInit: () => void | Promise<void>,
  options: AutoOpenChatbotTTLOptions = {},
): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const ttlMs = options.ttlMs ?? 20 * 60 * 1000;
  const storageKey =
    options.storageKey ?? "chatbot_autoopen_next_at_v1";
  const flowKeysToClear = options.flowKeysToClear ?? [
    "chatFlowStep",
    "chatFlowData",
  ];
  const resetOnFirstOpen = options.resetOnFirstOpen ?? false;
  const registry = getRegistry();

  const readStorageValue = () => {
    try {
      return localStorage.getItem(storageKey);
    } catch {
      return null;
    }
  };

  const writeStorageValue = (value: number) => {
    try {
      localStorage.setItem(storageKey, String(value));
    } catch {
      // Ignore storage write failures.
    }
  };

  const getNextAt = () => {
    const value = Number(readStorageValue() || 0);
    return Number.isFinite(value) ? value : 0;
  };

  const isBotOpen = () =>
    typeof bot?.isOpen === "function" ? !!bot.isOpen() : false;

  const hardReset = async () => {
    try {
      flowKeysToClear.forEach((key) => sessionStorage.removeItem(key));
    } catch {
      // Ignore sessionStorage failures.
    }

    if (typeof bot?.reset === "function") {
      await Promise.resolve(bot.reset());
      return;
    }

    if (typeof bot?.resetChat === "function") {
      await Promise.resolve(bot.resetChat());
      return;
    }

    if (typeof bot?.resetSession === "function") {
      await Promise.resolve(bot.resetSession());
      return;
    }

    if (typeof bot?.clearMessages === "function") {
      await Promise.resolve(bot.clearMessages());
    }
  };

  const clearScheduledTimer = () => {
    const timerId = registry.timers[storageKey];
    if (typeof timerId === "number") {
      window.clearTimeout(timerId);
    }
    delete registry.timers[storageKey];
  };

  const schedule = () => {
    const nextAt = getNextAt();
    if (!nextAt) return;

    const delay = Math.max(0, nextAt - Date.now());
    clearScheduledTimer();
    registry.timers[storageKey] = window.setTimeout(() => {
      void checkAndOpen();
    }, delay);
  };

  const checkAndOpen = async () => {
    if (isBotOpen() && getNextAt()) {
      schedule();
      return;
    }

    const now = Date.now();
    const nextAt = getNextAt();
    const isFirstOpen = !nextAt;

    if (!nextAt || now >= nextAt) {
      writeStorageValue(now + ttlMs);
      if (!isFirstOpen || resetOnFirstOpen) {
        await hardReset();
      }
      await Promise.resolve(openAndInit());
    }

    schedule();
  };

  if (registry.listeners[storageKey]) {
    window.removeEventListener("storage", registry.listeners[storageKey]);
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === storageKey) {
      schedule();
    }
  };

  registry.listeners[storageKey] = onStorage;
  window.addEventListener("storage", onStorage);

  void checkAndOpen();
  schedule();

  return () => {
    clearScheduledTimer();

    const listener = registry.listeners[storageKey];
    if (listener) {
      window.removeEventListener("storage", listener);
      delete registry.listeners[storageKey];
    }
  };
}
