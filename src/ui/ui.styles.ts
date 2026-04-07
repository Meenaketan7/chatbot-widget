import type { ChatbotConfig, ChatbotState } from "../core/types";

export function buildUIStyles(
  config: ChatbotConfig,
  state: ChatbotState,
): string {
  const verticalPosition = config.position?.includes("bottom")
    ? "bottom: 20px;"
    : "top: 20px;";
  const horizontalPosition = config.position?.includes("right")
    ? "right: 20px;"
    : "left: 20px;";

  return `
    <style>
      :root {
        --primary: ${config.primaryColor || "rgb(104, 59, 212)"};
        --bg: ${config.backgroundColor || "#fff"};
        --accent: ${config.secondaryColor || "#6366f1"};
        --radius: ${config.borderRadius || "12px"};
        --font-family: ${config.fontFamily || 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'};
        --text-primary: #455a64;
        --text-secondary: #576E93;
        --body-bg: #f8f9fb;
        --bubble-bg: #ffffff;
        --input-bg: #f8f9fb;
        --shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        --header-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        --border-color: #e5e7eb;
      }

      * {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      .bot-google-font div {
        font-family: var(--font-family) !important;
      }

      .chatbot-container {
        position: fixed;
        ${verticalPosition}
        ${horizontalPosition}
        z-index: 99999;
        font-family: var(--font-family);
      }

      .chatbot-container,
      .chatbot-container * {
        box-sizing: border-box !important;
        font-family: var(--font-family) !important;
      }

      .chatbot-container button {
        padding: 0 !important;
        margin: 0 !important;
        line-height: normal !important;
        border: none !important;
        background: none;
      }

      .chatbot-container img {
        display: block !important;
        max-width: none !important;
        height: auto !important;
      }

      .cw-fab {
        padding: 0 !important;
        width: 56px !important;
        height: 56px !important;
        border-radius: 50% !important;
        background: var(--primary) !important;
        display: inline-grid;
        place-items: center !important;
        box-shadow: 0 4px 16px rgba(139, 92, 246, 0.4) !important;
        cursor: pointer !important;
        border: 3px solid var(--primary) !important;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        color: white !important;
        position: relative !important;
        z-index: 99999999999;
      }

      .cw-fab > img {
        border-radius: 50% !important;
        object-fit: cover !important;
        flex-shrink: 0 !important;
      }

      .cw-fab-status-dot {
        position: absolute;
        top: 0;
        left: 0;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: #22c55e;
        box-shadow: 0 1px 3px rgba(44, 44, 44, 0.13);
        z-index: 2;
        pointer-events: none;
      }

      .cw-fab-status-dot.offline {
        background: #ef4444;
      }

      .cw-fab-wave {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background: var(--primary);
        animation: cw-fab-pulse 1.3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        z-index: 0;
        pointer-events: none;
      }

      @keyframes cw-fab-pulse {
        0% {
          opacity: 0.7;
          transform: translate(-50%, -50%) scale(1);
        }

        70% {
          opacity: 0;
          transform: translate(-50%, -50%) scale(1.8);
        }

        100% {
          opacity: 0;
          transform: translate(-50%, -50%) scale(2);
        }
      }

      .cw-fab:hover {
        transform: scale(1.05) !important;
        box-shadow: 0 6px 20px rgba(139, 92, 246, 0.5) !important;
      }

      .cw-fab.offline::after {
        content: "";
        position: absolute !important;
        top: 6px !important;
        right: 6px !important;
        width: 10px !important;
        height: 10px !important;
        background: #ef4444 !important;
        border-radius: 50% !important;
        border: 2px solid white !important;
      }

      .cw-panel {
        width: 380px;
        max-width: calc(100vw - 40px);
        height: 650px;
        max-height: 85vh;
        display: ${state.isOpen ? "flex" : "none"};
        flex-direction: column;
        background: var(--bg);
        border-radius: var(--radius);
        box-shadow: var(--shadow);
        overflow: hidden;
        transform-origin: bottom right;
        animation: cw-entrance 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        border: 1px solid rgba(0, 0, 0, 0.06);
      }

      @keyframes cw-entrance {
        from {
          transform: translateY(10px) scale(0.96);
          opacity: 0;
        }

        to {
          transform: translateY(0) scale(1);
          opacity: 1;
        }
      }

      .cw-header {
        padding: 12px 16px;
        display: flex;
        gap: 12px;
        align-items: center;
        background: var(--primary) !important;
        color: white;
        flex-shrink: 0;
        position: relative;
        box-shadow: var(--header-shadow);
      }

      .cw-header .avatar {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        font-size: 20px;
        background: rgba(255, 255, 255, 0.15);
        -webkit-backdrop-filter: blur(10px);
        backdrop-filter: blur(10px);
        flex-shrink: 0;
      }

      .cw-header .titlewrap {
        flex: 1;
        min-width: 0;
      }

      .cw-header .title {
        font-weight: 600;
        font-size: 14px;
        margin-bottom: 3px;
        line-height: 1.36;
        font-family: var(--font-family);
      }

      .cw-header .subtitle {
        font-size: 14px;
        opacity: 0.9;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 5px;
        line-height: 1.36;
        font-family: var(--font-family);
      }

      .connection-status {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 10px;
        opacity: 0.85;
      }

      .connection-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #22c55e;
        animation: pulse 2s infinite;
      }

      .connection-dot.offline {
        background: #ef4444;
        animation: none;
      }

      .connection-dot.syncing {
        background: #f59e0b;
        animation: spin 1s linear infinite;
      }

      @keyframes pulse {
        0%,
        100% {
          opacity: 1;
        }

        50% {
          opacity: 0.5;
        }
      }

      @keyframes spin {
        from {
          transform: rotate(0deg);
        }

        to {
          transform: rotate(360deg);
        }
      }

      .cw-header .actions {
        display: flex;
        gap: 6px;
        flex-shrink: 0;
      }

      .cw-header .actions button {
        background: rgba(255, 255, 255, 0.15);
        border: none;
        color: rgba(255, 255, 255, 0.95);
        font-size: 14px;
        cursor: pointer;
        width: 32px;
        height: 32px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        flex-shrink: 0;
        padding: 0 !important;
      }

      .cw-header .actions button:hover {
        background: rgba(255, 255, 255, 0.25);
        transform: scale(1.05);
      }

      .cw-body {
        padding: 16px;
        background: var(--body-bg);
        display: flex;
        flex-direction: column;
        gap: 8px;
        overflow-y: auto;
        flex: 1 1 0;
        min-height: 0;
        scroll-behavior: smooth;
        font-family: var(--font-family);
      }

      .cw-body::-webkit-scrollbar {
        width: 6px;
      }

      .cw-body::-webkit-scrollbar-track {
        background: transparent;
      }

      .cw-body::-webkit-scrollbar-thumb {
        background: rgba(139, 92, 246, 0.2);
        border-radius: 3px;
      }

      .cw-body::-webkit-scrollbar-thumb:hover {
        background: rgba(139, 92, 246, 0.3);
      }

      .cw-message-group {
        margin-bottom: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .cw-message-group.assistant {
        display: flex;
        align-items: flex-start;
        gap: 6px;
      }

      .cw-message-group.user {
        align-items: flex-end;
      }

      .cw-bot-avatar {
        width: 22px;
        height: 22px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        flex-shrink: 0;
        margin-top: 2px;
        margin-right: 0;
        background: gray;
        padding: 1px;
        flex-basis: auto;
      }

      .cw-msg {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-bottom: 0;
        max-width: 80%;
        position: relative;
      }

      .cw-msg.assistant {
        align-items: flex-start;
      }

      .cw-msg.user {
        align-items: flex-end;
      }

      .cw-bubble {
        padding: 12px 16px;
        border-radius: 12px;
        max-width: 100%;
        font-size: 13px;
        line-height: 1.46;
        word-wrap: break-word;
        position: relative;
        font-weight: 600;
        letter-spacing: 0.01em;
        font-family: var(--font-family) !important;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .cw-msg.user .cw-bubble {
        background: var(--primary);
        color: #fff;
        border-bottom-right-radius: 4px;
        box-shadow: 0 2px 8px rgba(139, 92, 246, 0.25);
      }

      .cw-msg.assistant .cw-bubble {
        background: var(--bubble-bg);
        border: 1px solid var(--border-color);
        color: var(--text-primary);
        border-bottom-left-radius: 4px;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
      }

      .cw-bubble-text {
        word-wrap: break-word;
      }

      .cw-bubble-time {
        font-size: 11px;
        opacity: 0;
        margin-top: 2px;
        font-weight: 500;
        transition: opacity 0.2s ease;
      }

      .cw-bubble:hover .cw-bubble-time {
        opacity: 0.7;
      }

      .cw-msg.user .cw-bubble:hover .cw-bubble-time {
        opacity: 0.9;
        color: rgba(255, 255, 255, 0.8);
      }

      .cw-option-selection {
        margin-top: 8px;
        width: 100%;
      }

      .cw-options-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .cw-option-item {
        background: var(--primary) !important;
        opacity: 1;
        border-radius: 6px;
        padding: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 13px;
        color: white;
        display: flex;
        align-items: center;
        justify-content: space-between;
        max-width: 100%;
        font-weight: 500;
        border: 1px solid transparent;
        box-shadow: 0 2px 6px rgba(139, 92, 246, 0.2);
        letter-spacing: 0.01em;
        line-height: 1.3;
        font-family: var(--font-family);
        min-width: 30ch;
      }

      .cw-option-item:hover:not(.disabled) {
        opacity: 0.9;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
        border-color: rgba(255, 255, 255, 0.2);
      }

      .cw-option-item.disabled {
        display: none;
      }

      .cw-option-item .option-text {
        flex: 1;
        line-height: 1.3;
      }

      .cw-option-item .option-check {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        border: 2px solid currentColor;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        opacity: 0;
        transition: opacity 0.2s ease;
        margin-left: 10px;
        background: rgba(255, 255, 255, 0.25);
        flex-shrink: 0;
      }

      .cw-option-item.selected .option-check {
        opacity: 1;
      }

      .cw-option-item.multi {
        justify-content: flex-start;
        gap: 10px;
      }

      .cw-option-item.multi .option-check {
        margin-left: auto;
      }

      .option-bullet {
        width: 16px;
        height: 16px;
        border-radius: 999px;
        border: 2px solid rgba(255, 255, 255, 0.9);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .option-bullet-dot {
        width: 8px;
        height: 8px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.95);
        opacity: 0;
      }

      .cw-option-item.selected .option-bullet-dot {
        opacity: 1;
      }

      .cw-multi-actions {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 10px;
      }

      .cw-multi-hint {
        font-size: 12px;
        color: var(--text-secondary);
        flex: 1;
        min-width: 0;
        font-family: var(--font-family);
      }

      .cw-multi-hint.error {
        color: #ef4444;
      }

      .chatbot-container .cw-multi-confirm {
        appearance: none !important;
        -webkit-appearance: none !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        min-height: 40px !important;
        background: transparent !important;
        color: var(--primary) !important;
        border: 2px solid var(--primary) !important;
        border-radius: 10px !important;
        padding: 8px 14px !important;
        cursor: pointer !important;
        font-weight: 600 !important;
        line-height: 1 !important;
        white-space: nowrap !important;
        flex-shrink: 0 !important;
        font-family: var(--font-family) !important;
      }

      .chatbot-container .cw-multi-confirm:disabled {
        opacity: 0.55;
        cursor: not-allowed !important;
        background: transparent !important;
        border-color: var(--primary) !important;
      }

      .chatbot-container .cw-multi-confirm:hover:not(:disabled) {
        background: var(--primary) !important;
        color: #fff !important;
      }

      .chatbot-container .cw-multi-confirm:active:not(:disabled) {
        transform: scale(0.98);
      }

      .cw-options-list.locked .cw-option-item {
        pointer-events: none;
        opacity: 0.85;
      }

      .cw-typing {
        font-size: 13px;
        opacity: 0.85;
        padding: 12px 16px;
        border-radius: 12px;
        background: var(--bubble-bg);
        display: inline-flex;
        align-items: center;
        gap: 6px;
        border: 1px solid var(--border-color);
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
        border-bottom-left-radius: 4px;
        color: var(--text-primary);
        line-height: 1.46;
        font-family: var(--font-family);
      }

      .cw-typing::after {
        content: "●";
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: var(--primary);
        animation: typing 1.4s infinite;
      }

      @keyframes typing {
        0%,
        60%,
        100% {
          transform: translateY(0);
        }

        30% {
          transform: translateY(-6px);
        }
      }

      .cw-footer {
        padding: 12px 14px !important;
        display: flex !important;
        gap: 10px !important;
        align-items: center !important;
        border-top: 1px solid var(--border-color) !important;
        background: #fff !important;
        position: relative;
        flex-shrink: 0;
        font-family: var(--font-family);
      }

      .cw-input {
        flex: 1 !important;
        position: relative;
        display: flex;
        align-items: center;
        background: var(--input-bg);
        border-radius: 8px;
        padding: 0;
        border: 1px solid var(--border-color);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        transition: all 0.2s ease;
        min-width: 0;
      }

      .cw-input.disabled {
        background: #f3f4f6;
        border-color: var(--border-color);
      }

      .cw-input:focus-within:not(.disabled) {
        background: #fff;
        border-color: var(--primary);
        box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.08);
      }

      .cw-country-picker {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 8px 10px;
        border-right: 1px solid var(--border-color);
        cursor: pointer;
        user-select: none;
        transition: all 0.2s ease;
        position: relative;
        background: transparent;
        flex-shrink: 0;
        font-family: var(--font-family);
      }

      .cw-country-picker:hover {
        background: rgba(139, 92, 246, 0.05);
      }

      .cw-country-code {
        font-size: 13px;
        color: var(--text-primary);
        font-weight: 600;
        letter-spacing: 0.02em;
      }

      .cw-country-name {
        font-size: 11px;
        color: var(--text-secondary);
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }

      .cw-country-arrow {
        font-size: 8px;
        color: var(--text-secondary);
        transition: transform 0.3s ease;
        margin-left: 2px;
      }

      .cw-country-picker.open .cw-country-arrow {
        transform: rotate(180deg);
      }

      .cw-country-dropdown {
        position: fixed !important;
        background: white;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.06);
        max-height: 320px;
        overflow-y: auto;
        z-index: 100000 !important;
        display: none;
        min-width: 360px;
      }

      .cw-country-dropdown.open {
        display: block;
        animation: dropdownFadeIn 0.2s ease-out;
      }

      @keyframes dropdownFadeIn {
        from {
          opacity: 0;
          transform: translateY(-4px) scale(0.98);
        }

        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      .cw-country-dropdown::-webkit-scrollbar {
        width: 6px;
      }

      .cw-country-dropdown::-webkit-scrollbar-track {
        background: var(--body-bg);
        border-radius: 3px;
        margin: 4px 0;
      }

      .cw-country-dropdown::-webkit-scrollbar-thumb {
        background: rgba(139, 92, 246, 0.25);
        border-radius: 3px;
      }

      .cw-country-dropdown::-webkit-scrollbar-thumb:hover {
        background: rgba(139, 92, 246, 0.4);
      }

      .cw-country-item {
        display: grid;
        grid-template-columns: 1fr auto auto;
        gap: 10px;
        align-items: center;
        padding: 10px 14px;
        cursor: pointer;
        transition: all 0.15s ease;
        font-size: 13px;
        border-bottom: 1px solid #f3f4f6;
        position: relative;
        font-family: var(--font-family);
      }

      .cw-country-item:last-child {
        border-bottom: none;
      }

      .cw-country-item:hover {
        background: var(--body-bg);
        padding-left: 18px;
      }

      .cw-country-item.selected {
        background: rgba(139, 92, 246, 0.08);
        color: var(--primary);
        font-weight: 600;
      }

      .cw-country-item.selected::before {
        content: "✓";
        position: absolute;
        left: 6px;
        color: var(--primary);
        font-weight: bold;
        font-size: 12px;
      }

      .cw-country-item-name {
        color: var(--text-primary);
        font-weight: 500;
        font-size: 13px;
        text-align: left;
        letter-spacing: 0.01em;
      }

      .cw-country-item-dial {
        color: var(--primary);
        font-size: 12px;
        font-weight: 600;
        background: rgba(139, 92, 246, 0.08);
        padding: 4px 8px;
        border-radius: 4px;
        min-width: 52px;
        text-align: center;
        letter-spacing: 0.02em;
      }

      .cw-country-item-code {
        color: var(--text-secondary);
        font-size: 11px;
        font-weight: 600;
        background: #f3f4f6;
        padding: 4px 7px;
        border-radius: 4px;
        min-width: 38px;
        text-align: center;
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }

      .cw-country-item:hover .cw-country-item-dial {
        background: rgba(139, 92, 246, 0.12);
      }

      .cw-country-item.selected .cw-country-item-dial {
        background: var(--primary);
        color: white;
      }

      .cw-menu-container {
        position: relative;
        display: inline-flex;
        align-items: center;
        margin-right: 4px;
        flex-shrink: 0;
        height: 32px;
      }

      .pull-left {
        float: left !important;
      }

      .full-width {
        width: 100% !important;
      }

      .pointer {
        cursor: pointer !important;
      }

      .menu-toggle-btn {
        width: 32px;
        height: 32px;
        border-radius: 6px;
        background: transparent;
        border: none;
        padding: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        position: relative;
        cursor: pointer;
      }

      .menu-toggle-btn:hover {
        opacity: 0.8;
      }

      .menu-toggle-btn:active {
        transform: scale(0.95);
      }

      .menu-icon-sb {
        width: 18px;
        height: 18px;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%) scale(1);
        transition: opacity 150ms cubic-bezier(0.16, 1, 0.3, 1), transform 150ms cubic-bezier(0.16, 1, 0.3, 1);
        pointer-events: none;
        opacity: 1;
      }

      .icon-hidden {
        opacity: 0 !important;
        transform: translate(-50%, -50%) scale(0.9) !important;
        pointer-events: none !important;
      }

      .opacity-0 {
        opacity: 0 !important;
        pointer-events: none !important;
      }

      .menu-options-div {
        position: absolute;
        width: 280px;
        bottom: 45px;
        left: 0;
        max-height: 300px;
        min-height: auto;
        overflow: hidden;
        overflow-y: auto;
        background: white;
        z-index: 99999;
        box-shadow: 0 3px 20px rgba(21, 38, 194, 0.3);
        border: 1px solid rgba(119, 124, 124, 0.15);
        border-radius: 6px;
        padding: 15px;
        box-sizing: border-box;
        transition: opacity 150ms cubic-bezier(0.16, 1, 0.3, 1), transform 150ms cubic-bezier(0.16, 1, 0.3, 1);
        transform-origin: bottom left;
        will-change: opacity;
        display: none;
        opacity: 0;
      }

      .menu-options-div[style*="display: block"] {
        animation: slideUpMenu 150ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }

      @keyframes slideUpMenu {
        from {
          opacity: 0;
          transform: translateY(10px) scale(0.95);
        }

        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      .menu-option-div {
        padding: 10px;
        display: flex;
        align-items: center;
        border: 1px solid #e5e7eb;
        border-radius: 4px;
        width: 100%;
        box-sizing: border-box;
      }

      .menu-option-div.border-bottom {
        margin-bottom: 10px;
      }

      .menu-option-label {
        width: 100%;
        margin: 0;
        cursor: pointer;
        display: flex;
        align-items: center;
      }

      .menu-option-link {
        display: flex;
        align-items: center;
        gap: 8px;
        text-decoration: none;
        color: #455a64;
        font-size: 14px;
        padding: 4px 0;
        transition: color 0.2s ease;
        width: 100%;
        white-space: nowrap;
      }

      .menu-option-link:hover {
        color: var(--primary);
      }

      .menu-option-link span {
        flex: 1;
      }

      .menu-icon-smatest {
        flex-shrink: 0;
      }

      .cw-input input {
        border: none;
        background: transparent;
        outline: none;
        width: 100%;
        font-size: 16px;
        padding: 10px 50px 10px 12px;
        color: var(--text-primary);
        font-family: var(--font-family);
        letter-spacing: 0.01em;
        line-height: 1.46;
      }

      .cw-input.phone-input input {
        padding-left: 8px;
      }

      .cw-input input:disabled {
        color: #9ca3af;
        cursor: not-allowed;
      }

      .cw-input input::placeholder {
        color: #9ca3af;
        font-weight: 400;
      }

      .cw-send {
        position: absolute;
        right: 6px;
        top: 50%;
        transform: translateY(-50%);
        width: 32px;
        height: 32px;
        border-radius: 6px;
        padding: 0;
        display: inline-grid;
        place-items: center;
        border: none;
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(139, 92, 246, 0.25);
        background: var(--primary) !important;
        color: #fff;
        transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
        flex-shrink: 0;
      }

      .cw-send:hover:not(:disabled) {
        transform: translateY(-50%) scale(1.05);
        box-shadow: 0 4px 12px rgba(139, 92, 246, 0.35);
      }

      .cw-send:active:not(:disabled) {
        transform: translateY(-50%) scale(0.98);
      }

      .cw-send:disabled {
        background: #d1d5db;
        cursor: not-allowed;
        box-shadow: none;
        opacity: 0.6;
      }

      .cw-send svg {
        width: 14px;
        height: 14px;
        stroke: white;
        display: block;
      }

      .cw-input.phone-input .cw-input-menu {
        display: none;
      }

      .cw-reset-modal-bg {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border-radius: var(--radius);
        background: rgba(0, 0, 0, 0.6);
        -webkit-backdrop-filter: blur(2px);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 999;
        backdrop-filter: blur(2px);
      }

      .cw-reset-modal {
        background: #fff;
        border-radius: 12px;
        padding: 24px;
        max-width: 300px;
        width: 90%;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        text-align: center;
        font-family: var(--font-family);
      }

      .cw-reset-modal h2 {
        font-size: 16px;
        margin-bottom: 10px;
        font-weight: 600;
        color: var(--text-primary);
        letter-spacing: 0.01em;
      }

      .cw-reset-modal p {
        font-size: 13px;
        margin-bottom: 20px;
        color: var(--text-secondary);
        line-height: 1.46;
      }

      .cw-reset-actions {
        display: flex;
        justify-content: center;
        gap: 10px;
      }

      .chatbot-container .cw-reset-modal .cw-btn-cancel,
      .chatbot-container .cw-reset-modal .cw-btn-reset {
        appearance: none !important;
        -webkit-appearance: none !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        min-height: 40px !important;
        padding: 9px 18px !important;
        border-radius: 10px !important;
        cursor: pointer !important;
        font-size: 13px !important;
        font-weight: 600 !important;
        line-height: 1 !important;
        white-space: nowrap !important;
        transition: all 0.2s ease !important;
        font-family: var(--font-family) !important;
      }

      .chatbot-container .cw-reset-modal .cw-btn-cancel {
        background: #fff !important;
        border: 1px solid #d1d5db !important;
        color: var(--text-primary) !important;
      }

      .chatbot-container .cw-reset-modal .cw-btn-cancel:hover {
        background: #f9fafb !important;
        border-color: #9ca3af !important;
      }

      .chatbot-container .cw-reset-modal .cw-btn-reset {
        background: #000 !important;
        color: #fff !important;
        border: 1px solid #000 !important;
      }

      .chatbot-container .cw-reset-modal .cw-btn-reset:hover {
        background: #1f2937 !important;
        border-color: #1f2937 !important;
      }

      @media (max-width: 480px) {
        .cw-multi-actions {
          flex-direction: column;
          align-items: stretch;
        }

        .chatbot-container .cw-multi-confirm {
          width: 100% !important;
        }

        .cw-reset-actions {
          flex-direction: column;
        }

        .chatbot-container .cw-reset-modal .cw-btn-cancel,
        .chatbot-container .cw-reset-modal .cw-btn-reset {
          width: 100% !important;
        }
      }

      @media (max-width: 768px) {
        .chatbot-container {
          position: fixed;
          inset: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          bottom: auto !important;
          right: auto !important;
          left: auto !important;
          top: auto !important;
        }

        .cw-fab {
          position: fixed !important;
          bottom: 20px !important;
          right: 20px !important;
          pointer-events: auto !important;
          z-index: 99999;
          width: 54px !important;
          height: 54px !important;
        }

        .cw-panel {
          position: fixed !important;
          width: 92% !important;
          max-width: 92% !important;
          height: 92vh !important;
          max-height: 92vh !important;
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%) !important;
          pointer-events: auto !important;
          margin: 0 !important;
        }

        .cw-panel {
          animation: cw-entrance-mobile 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        @keyframes cw-entrance-mobile {
          from {
            transform: translate(-50%, -50%) scale(0.94);
            opacity: 0;
          }

          to {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
        }

        .cw-panel::before {
          content: "";
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          z-index: -1;
          -webkit-backdrop-filter: blur(3px);
          backdrop-filter: blur(3px);
        }

        .cw-body {
          padding: 14px;
        }

        .cw-msg {
          max-width: 85%;
        }

        .cw-country-dropdown {
          max-height: 50vh;
          min-width: auto;
          width: calc(100vw - 60px);
          left: 50% !important;
          transform: translateX(-50%);
        }
      }

      @media (max-width: 480px) {
        .cw-panel {
          width: 96% !important;
          max-width: 96% !important;
          height: 94vh !important;
          max-height: 94vh !important;
        }
      }
    </style>
  `;
}
