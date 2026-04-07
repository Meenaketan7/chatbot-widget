import type {
  ChatbotConfig,
  ChatbotState,
  InputFieldType,
} from "../core/types";
import { attachMenuListeners } from "./menu.ui";
import { createMessageRenderer } from "./ui.messages";
import {
  renderControlIcon,
  renderOptionalControlIcon,
} from "./ui.icons";
import { attachPhonePicker } from "./ui.phone";
import { applyThemeVariables } from "./ui.theme";
import {
  renderInputHTML,
  renderFabHTML,
  renderUIHTML,
  resolveDefaultPhoneSelection,
} from "./ui.templates";
import type { PhoneSelection, UIController, UIHandlers } from "./ui.types";

export function createUI(
  root: HTMLElement,
  config: ChatbotConfig,
  state: ChatbotState,
  handlers: UIHandlers,
): UIController {
  const currentInputType = config.inputConfig?.type || "text";
  state.currentInputType = currentInputType;

  const defaultPhoneSelection = resolveDefaultPhoneSelection(config);
  let selectedPhoneSelection: PhoneSelection = { ...defaultPhoneSelection };
  let phonePickerCleanup: (() => void) | undefined;

  root.innerHTML = renderUIHTML(
    config,
    state,
    currentInputType,
    selectedPhoneSelection,
  );

  const container = root.querySelector(".chatbot-container") as HTMLElement;
  const fab = container.querySelector(".cw-fab") as HTMLButtonElement;
  const panel = container.querySelector(".cw-panel") as HTMLElement;
  const body = container.querySelector(".cw-body") as HTMLElement;
  const closeBtn = container.querySelector(".close") as HTMLButtonElement;
  const resetBtn = container.querySelector(".reset-btn") as HTMLButtonElement;
  const syncBtn = container.querySelector(".sync-btn") as HTMLButtonElement;
  const connectionDot = container.querySelector(
    ".connection-dot",
  ) as HTMLElement;
  const connectionText = container.querySelector(
    ".connection-text",
  ) as HTMLElement;

  let inputWrapper = container.querySelector(".cw-input") as HTMLElement;
  let input = inputWrapper.querySelector("input") as HTMLInputElement;
  let sendBtn = inputWrapper.querySelector(".cw-send") as HTMLButtonElement;

  const syncControlMarkup = () => {
    resetBtn.innerHTML = renderControlIcon(
      config,
      "headerReset",
      "cw-control-icon cw-reset-icon",
    );
    closeBtn.innerHTML = renderControlIcon(
      config,
      "close",
      "cw-control-icon cw-close-icon",
    );
    sendBtn.innerHTML = renderControlIcon(
      config,
      "send",
      "cw-control-icon cw-send-icon",
    );

    const menuToggleBtn = inputWrapper.querySelector(
      ".menu-toggle-btn",
    ) as HTMLButtonElement | null;
    if (menuToggleBtn) {
      menuToggleBtn.innerHTML = `
        ${renderControlIcon(config, "menu", "cw-control-icon menu-icon-sb menu-toggle-icon")}
        ${renderControlIcon(config, "menuClose", "cw-control-icon menu-icon-sb menu-close-icon icon-hidden")}
      `;
    }

    fab.innerHTML = renderFabHTML(config, state.isOnline);
  };

  const scrollToBottom = (instant = false) => {
    if (panel.style.display === "none") return;

    try {
      if (instant) {
        body.scrollTop = body.scrollHeight;
      } else {
        body.scrollTo({ top: body.scrollHeight, behavior: "smooth" });
      }
    } catch {
      body.scrollTop = body.scrollHeight;
    }
  };

  const { renderAll } = createMessageRenderer({
    body,
    config,
    state,
    handlers,
    scrollToBottom,
  });

  const syncPhoneSelection = (selection: PhoneSelection) => {
    selectedPhoneSelection = selection;
  };

  const initializePhonePicker = (scope: HTMLElement = container) => {
    phonePickerCleanup?.();
    const controller = attachPhonePicker({
      container: scope,
      defaultSelection: defaultPhoneSelection,
      onChange: syncPhoneSelection,
    });
    phonePickerCleanup = controller?.cleanup;
  };

  const syncInputRefs = (scope: HTMLElement = container) => {
    inputWrapper = scope.querySelector(".cw-input") as HTMLElement;
    input = inputWrapper.querySelector("input") as HTMLInputElement;
    sendBtn = inputWrapper.querySelector(".cw-send") as HTMLButtonElement;
  };

  const getDefaultPlaceholder = () =>
    config.inputConfig?.placeholder ||
    config.placeholder ||
    "Type your message...";

  const setInputDisabledState = (disabled: boolean) => {
    input.disabled = disabled;
    sendBtn.disabled = disabled;

    if (disabled) {
      inputWrapper.classList.add("disabled");
      input.placeholder = "Please select an option above...";
      return;
    }

    inputWrapper.classList.remove("disabled");
    input.placeholder = getDefaultPlaceholder();
  };

  const handleSend = () => {
    if (state.inputDisabled) return;

    let value = input.value.trim();
    if (!value) return;

    if (state.currentInputType === "phone") {
      value = `${selectedPhoneSelection.dialCode} ${value}`;
    }

    handlers.onSend(value);
    input.value = "";
    input.focus();
  };

  const bindInputEvents = () => {
    sendBtn.addEventListener("click", handleSend);

    input.addEventListener("keydown", (event) => {
      if (state.inputDisabled) return;

      if (event.key === "Enter") {
        event.preventDefault();
        handleSend();
      }

      if (event.key === "Escape" && state.isOpen) {
        handlers.onClose();
      }
    });
  };

  const renderInput = (
    type: InputFieldType,
    inputConfig?: Partial<ChatbotConfig["inputConfig"]>,
  ) => {
    state.currentInputType = type;

    if (inputConfig) {
      config.inputConfig = { ...config.inputConfig, ...inputConfig, type };
    }

    const footer = container.querySelector(".cw-footer") as HTMLElement;
    const previousInputWrapper = footer.querySelector(".cw-input");
    const nextInputMarkup = renderInputHTML(
      config,
      type,
      selectedPhoneSelection,
    );
    const temp = document.createElement("div");
    temp.innerHTML = nextInputMarkup;
    const nextInputWrapper = temp.firstElementChild as HTMLElement;

    previousInputWrapper?.replaceWith(nextInputWrapper);
    syncInputRefs(footer);
    syncControlMarkup();
    bindInputEvents();
    attachMenuListeners(
      container,
      config.inputConfig?.menu,
      handlers,
      inputWrapper,
    );

    if (type === "phone") {
      initializePhonePicker(inputWrapper);
    } else {
      phonePickerCleanup?.();
      phonePickerCleanup = undefined;
    }

    setInputDisabledState(state.inputDisabled);

    if (!state.inputDisabled) {
      setTimeout(() => input.focus(), 100);
    }

    handlers.onInputTypeChange?.(type);
  };

  const showResetModal = () => {
    const existing = panel.querySelector(".cw-reset-modal-bg");
    if (existing) existing.remove();

    const modalBg = document.createElement("div");
    modalBg.className = "cw-reset-modal-bg";

    const modal = document.createElement("div");
    modal.className = "cw-reset-modal";
    modal.innerHTML = `
      <h2>Reset Chat</h2>
      <p>Confirm reset?<br>This will create a new session</p>
      <div class="cw-reset-actions">
        <button class="cw-btn-cancel">${renderOptionalControlIcon(config, "modalCancel", "cw-control-icon cw-button-icon")}<span class="cw-button-label">Cancel</span></button>
        <button class="cw-btn-reset">${renderOptionalControlIcon(config, "modalReset", "cw-control-icon cw-button-icon")}<span class="cw-button-label">Reset</span></button>
      </div>
    `;

    modalBg.appendChild(modal);
    panel.appendChild(modalBg);

    modal
      .querySelector(".cw-btn-cancel")
      ?.addEventListener("click", () => modalBg.remove());
    modal.querySelector(".cw-btn-reset")?.addEventListener("click", () => {
      modalBg.remove();
      handlers.onReset();
    });
  };

  if (currentInputType === "phone") {
    initializePhonePicker();
  }

  bindInputEvents();
  setInputDisabledState(state.inputDisabled);
  attachMenuListeners(container, config.inputConfig?.menu, handlers);
  syncControlMarkup();

  fab.addEventListener("click", () => {
    handlers.onToggle();
    if (!state.inputDisabled) {
      setTimeout(() => input.focus(), 120);
    }
  });

  closeBtn.addEventListener("click", handlers.onClose);
  resetBtn.addEventListener("click", showResetModal);

  if (syncBtn && handlers.onSync) {
    syncBtn.addEventListener("click", handlers.onSync);
  }

  return {
    setOpen(open: boolean) {
      state.isOpen = open;
      panel.style.display = open ? "flex" : "none";
      fab.style.display = open ? "none" : "inline-grid";
      if (open) {
        panel.offsetHeight;
      }
    },

    setTyping(isTyping: boolean, role: "user" | "assistant" = "assistant") {
      state.isTyping = isTyping;
      state.typingRole = role;
      renderAll(state.messages);
    },

    renderMessages(messages) {
      state.messages = messages;
      renderAll(messages);
    },

    updateConfig(newConfig) {
      Object.assign(config, newConfig);
      const element = root.querySelector(".chatbot-container") as HTMLElement;
      applyThemeVariables(element, config);
      syncControlMarkup();
    },

    focusInput() {
      if (!state.inputDisabled) input.focus();
    },

    setInputDisabled(disabled: boolean) {
      setInputDisabledState(disabled);
    },

    updateConnectionStatus(isOnline: boolean) {
      if (connectionDot && connectionText) {
        connectionDot.className = `connection-dot ${isOnline ? "" : "offline"}`;
        connectionText.textContent = isOnline ? "Online" : "Offline";
        fab.className = `cw-fab ${isOnline ? "" : "offline"}`;
      }
    },

    updateSyncStatus(status: "synced" | "pending" | "failed") {
      if (syncBtn) {
        syncBtn.className = `sync-btn ${status === "pending" ? "syncing" : ""}`;
        syncBtn.title =
          status === "pending"
            ? "Syncing..."
            : status === "failed"
              ? "Sync failed - click to retry"
              : "Sync messages";
      }

      if (connectionDot) {
        connectionDot.className = `connection-dot ${
          status === "pending"
            ? "syncing"
            : status === "failed"
              ? "offline"
              : ""
        }`;
      }
    },

    setInputType(type, inputConfig) {
      renderInput(type, inputConfig);
    },
  };
}
