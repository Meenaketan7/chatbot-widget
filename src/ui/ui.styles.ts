import type { ChatbotConfig, ChatbotState } from "../core/types";
import { buildThemeVariableDeclarations } from "./ui.theme";

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
  const themeVariables = buildThemeVariableDeclarations(config);

  return `
    <style>
      * {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      .bot-google-font div {
        font-family: var(--font-family) !important;
      }

      .chatbot-container {
        ${themeVariables}
        position: fixed;
        ${verticalPosition}
        ${horizontalPosition}
        z-index: 99999;
        font-family: var(--font-family);
        color: var(--text-primary);
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
        width: var(--fab-size) !important;
        height: var(--fab-size) !important;
        border-radius: var(--fab-radius) !important;
        background: var(--fab-bg) !important;
        display: inline-grid;
        place-items: center !important;
        box-shadow: var(--fab-shadow) !important;
        cursor: pointer !important;
        border: var(--fab-border-width) solid var(--fab-border-color) !important;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        color: var(--fab-text) !important;
        position: relative !important;
        z-index: 99999999999;
        overflow: visible !important;
      }

      .cw-fab-icon {
        position: relative;
        z-index: 2;
        width: var(--fab-icon-size);
        height: var(--fab-icon-size);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: var(--fab-icon-color);
        background: var(--fab-icon-bg);
        padding: var(--fab-icon-padding);
        border-radius: var(--fab-icon-radius);
        overflow: hidden;
        line-height: 1;
        font-size: var(--fab-icon-size);
      }

      .cw-fab-icon > * {
        max-width: 100%;
        max-height: 100%;
        flex-shrink: 0;
      }

      .cw-fab-icon img,
      .cw-fab-icon svg {
        width: 100%;
        height: 100%;
        display: block;
        object-fit: contain;
      }

      .cw-fab-icon > img {
        border-radius: 50% !important;
        object-fit: cover !important;
        flex-shrink: 0 !important;
      }

      .cw-fab-status-dot {
        position: absolute;
        top: var(--fab-status-dot-top);
        left: var(--fab-status-dot-left);
        width: var(--fab-status-dot-size);
        height: var(--fab-status-dot-size);
        border-radius: 50%;
        background: var(--fab-status-dot-online);
        box-shadow: var(--fab-status-dot-shadow);
        z-index: 2;
        pointer-events: none;
        border: var(--fab-status-dot-border-width) solid var(--fab-status-dot-border-color);
      }

      .cw-fab-status-dot.offline {
        background: var(--fab-status-dot-offline);
      }

      .cw-fab-wave {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: var(--fab-wave-size);
        height: var(--fab-wave-size);
        border-radius: var(--fab-radius);
        background: var(--fab-wave-color);
        animation: cw-fab-pulse var(--fab-wave-duration) cubic-bezier(0.4, 0, 0.2, 1) infinite;
        z-index: 0;
        pointer-events: none;
      }

      @keyframes cw-fab-pulse {
        0% {
          opacity: var(--fab-wave-opacity);
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
        box-shadow: var(--fab-hover-shadow) !important;
        background: var(--fab-hover-bg) !important;
        color: var(--fab-hover-text) !important;
        border-color: var(--fab-hover-border-color) !important;
      }

      .cw-panel {
        width: var(--panel-width);
        max-width: var(--panel-max-width);
        height: var(--panel-height);
        max-height: var(--panel-max-height);
        display: ${state.isOpen ? "flex" : "none"};
        flex-direction: column;
        background: var(--bg);
        border-radius: var(--panel-radius);
        box-shadow: var(--shadow);
        overflow: hidden;
        transform-origin: bottom right;
        animation: cw-entrance 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        border: 1px solid var(--border-color);
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
        padding: var(--header-padding);
        display: flex;
        gap: var(--header-gap);
        align-items: center;
        background: var(--header-bg) !important;
        color: var(--header-text);
        flex-shrink: 0;
        position: relative;
        box-shadow: var(--header-shadow);
      }

      .cw-header .avatar {
        width: var(--header-avatar-size);
        height: var(--header-avatar-size);
        border-radius: 50%;
        display: grid;
        place-items: center;
        font-size: 20px;
        background: var(--header-avatar-bg);
        -webkit-backdrop-filter: blur(10px);
        backdrop-filter: blur(10px);
        flex-shrink: 0;
      }

      .cw-header .titlewrap {
        flex: 1;
        min-width: 0;
      }

      .cw-header .title {
        font-weight: var(--title-weight);
        font-size: var(--title-size);
        margin-bottom: 3px;
        line-height: var(--line-height);
        font-family: var(--font-family);
      }

      .cw-header .subtitle {
        font-size: var(--subtitle-size);
        opacity: 0.9;
        font-weight: var(--subtitle-weight);
        display: flex;
        align-items: center;
        gap: 5px;
        line-height: var(--line-height);
        font-family: var(--font-family);
        color: var(--header-subtext);
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
        background: var(--success-color);
        animation: pulse 2s infinite;
      }

      .connection-dot.offline {
        background: var(--error-color);
        animation: none;
      }

      .connection-dot.syncing {
        background: var(--warning-color);
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
        background: var(--header-action-bg);
        border: none;
        color: var(--header-text);
        font-size: 14px;
        cursor: pointer;
        width: var(--header-action-size);
        height: var(--header-action-size);
        border-radius: var(--header-action-radius);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        flex-shrink: 0;
        padding: 0 !important;
      }

      .cw-header .actions button:hover {
        transform: scale(1.05);
      }

      .reset-btn {
        background: var(--header-reset-bg) !important;
        color: var(--header-reset-text) !important;
        border: 1px solid var(--header-reset-border) !important;
      }

      .reset-btn:hover {
        background: var(--header-reset-hover-bg) !important;
        color: var(--header-reset-hover-text) !important;
        border-color: var(--header-reset-hover-border) !important;
      }

      .close {
        background: var(--header-close-bg) !important;
        color: var(--header-close-text) !important;
        border: 1px solid var(--header-close-border) !important;
      }

      .close:hover {
        background: var(--header-close-hover-bg) !important;
        color: var(--header-close-hover-text) !important;
        border-color: var(--header-close-hover-border) !important;
      }

      .cw-body {
        padding: var(--body-padding);
        background: var(--body-bg);
        display: flex;
        flex-direction: column;
        gap: var(--body-gap);
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
        background: var(--scrollbar-thumb);
        border-radius: 3px;
      }

      .cw-body::-webkit-scrollbar-thumb:hover {
        background: var(--scrollbar-thumb-hover);
      }

      .cw-message-group {
        margin-bottom: 0;
        display: flex;
        flex-direction: column;
        gap: var(--message-gap);
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
        width: var(--bot-avatar-size);
        height: var(--bot-avatar-size);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        flex-shrink: 0;
        margin-top: 2px;
        margin-right: 0;
        background: var(--accent);
        padding: 1px;
        flex-basis: auto;
      }

      .cw-msg {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-bottom: 0;
        max-width: var(--message-max-width);
        position: relative;
      }

      .cw-msg.assistant {
        align-items: flex-start;
      }

      .cw-msg.user {
        align-items: flex-end;
      }

      .cw-bubble {
        padding: var(--bubble-padding);
        border-radius: var(--bubble-radius);
        max-width: 100%;
        font-size: var(--message-size);
        line-height: var(--line-height);
        word-wrap: break-word;
        position: relative;
        font-weight: var(--message-weight);
        letter-spacing: 0.01em;
        font-family: var(--font-family) !important;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .cw-msg.user .cw-bubble {
        background: var(--user-bubble-bg);
        color: var(--user-bubble-text);
        border-bottom-right-radius: var(--bubble-tail-radius);
        box-shadow: var(--user-bubble-shadow);
      }

      .cw-msg.assistant .cw-bubble {
        background: var(--bubble-bg);
        border: 1px solid var(--border-color);
        color: var(--bubble-text);
        border-bottom-left-radius: var(--bubble-tail-radius);
        box-shadow: var(--assistant-bubble-shadow);
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
        gap: var(--option-gap);
      }

      .cw-option-item {
        background: var(--option-bg) !important;
        opacity: 1;
        border-radius: var(--option-radius);
        padding: var(--option-padding);
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: var(--option-size);
        color: var(--option-text);
        display: flex;
        align-items: center;
        justify-content: space-between;
        max-width: 100%;
        font-weight: var(--message-weight);
        border: 1px solid transparent;
        box-shadow: var(--option-shadow);
        letter-spacing: 0.01em;
        line-height: 1.3;
        font-family: var(--font-family);
        min-width: var(--option-min-width);
      }

      .cw-option-item:hover:not(.disabled) {
        opacity: 0.9;
        transform: translateY(-1px);
        box-shadow: var(--option-hover-shadow);
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
        font-size: var(--caption-size);
        color: var(--text-secondary);
        flex: 1;
        min-width: 0;
        font-family: var(--font-family);
      }

      .cw-multi-hint.error {
        color: var(--error-color);
      }

      .chatbot-container .cw-multi-confirm {
        appearance: none !important;
        -webkit-appearance: none !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        min-height: 40px !important;
        background: var(--multi-confirm-bg) !important;
        color: var(--multi-confirm-text) !important;
        border: 2px solid var(--multi-confirm-border) !important;
        border-radius: var(--button-radius) !important;
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
        background: var(--multi-confirm-disabled-bg) !important;
        color: var(--multi-confirm-disabled-text) !important;
        border-color: var(--multi-confirm-disabled-border) !important;
      }

      .chatbot-container .cw-multi-confirm:hover:not(:disabled) {
        background: var(--multi-confirm-hover-bg) !important;
        color: var(--multi-confirm-hover-text) !important;
        border-color: var(--multi-confirm-hover-border) !important;
      }

      .chatbot-container .cw-multi-confirm:active:not(:disabled) {
        transform: scale(0.98);
      }

      .cw-options-list.locked .cw-option-item {
        pointer-events: none;
        opacity: 0.85;
      }

      .cw-typing {
        font-size: var(--message-size);
        opacity: 0.85;
        padding: var(--bubble-padding);
        border-radius: var(--bubble-radius);
        background: var(--bubble-bg);
        display: inline-flex;
        align-items: center;
        gap: 6px;
        border: 1px solid var(--border-color);
        box-shadow: var(--assistant-bubble-shadow);
        border-bottom-left-radius: var(--bubble-tail-radius);
        color: var(--bubble-text);
        line-height: var(--line-height);
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
        padding: var(--footer-padding) !important;
        display: flex !important;
        gap: 10px !important;
        align-items: center !important;
        border-top: 1px solid var(--border-color) !important;
        background: var(--footer-bg) !important;
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
        border-radius: var(--input-radius);
        padding: 0;
        border: 1px solid var(--border-color);
        box-shadow: var(--input-shadow);
        transition: all 0.2s ease;
        min-width: 0;
      }

      .cw-input.disabled {
        background: var(--body-bg);
        border-color: var(--border-color);
      }

      .cw-input:focus-within:not(.disabled) {
        background: var(--footer-bg);
        border-color: var(--primary);
        box-shadow: var(--input-focus-shadow);
      }

      .cw-country-picker {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: var(--country-picker-padding);
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
        background: var(--body-bg);
      }

      .cw-country-code {
        font-size: var(--message-size);
        color: var(--text-primary);
        font-weight: 600;
        letter-spacing: 0.02em;
      }

      .cw-country-name {
        font-size: var(--caption-size);
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
        background: var(--menu-bg);
        border: 1px solid var(--border-color);
        border-radius: var(--menu-radius);
        box-shadow: var(--dropdown-shadow);
        max-height: 320px;
        overflow-y: auto;
        z-index: 100000 !important;
        display: none;
        min-width: var(--country-dropdown-width);
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
        background: var(--scrollbar-thumb);
        border-radius: 3px;
      }

      .cw-country-dropdown::-webkit-scrollbar-thumb:hover {
        background: var(--scrollbar-thumb-hover);
      }

      .cw-country-item {
        display: grid;
        grid-template-columns: 1fr auto auto;
        gap: 10px;
        align-items: center;
        padding: var(--country-item-padding);
        cursor: pointer;
        transition: all 0.15s ease;
        font-size: var(--message-size);
        border-bottom: 1px solid var(--border-color);
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
        font-size: var(--message-size);
        text-align: left;
        letter-spacing: 0.01em;
      }

      .cw-country-item-dial {
        color: var(--primary);
        font-size: var(--caption-size);
        font-weight: 600;
        background: var(--body-bg);
        padding: 4px 8px;
        border-radius: 4px;
        min-width: 52px;
        text-align: center;
        letter-spacing: 0.02em;
      }

      .cw-country-item-code {
        color: var(--text-secondary);
        font-size: calc(var(--caption-size) - 1px);
        font-weight: 600;
        background: var(--body-bg);
        padding: 4px 7px;
        border-radius: 4px;
        min-width: 38px;
        text-align: center;
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }

      .cw-country-item:hover .cw-country-item-dial {
        background: rgba(255, 255, 255, 0.18);
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
        height: var(--menu-toggle-size);
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
        width: var(--menu-toggle-size);
        height: var(--menu-toggle-size);
        border-radius: var(--button-radius);
        background: var(--menu-toggle-bg);
        border: 1px solid var(--menu-toggle-border);
        padding: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        position: relative;
        cursor: pointer;
        color: var(--menu-toggle-text);
      }

      .menu-toggle-btn:hover {
        opacity: 1;
        background: var(--menu-toggle-hover-bg);
        color: var(--menu-toggle-hover-text);
        border-color: var(--menu-toggle-hover-border);
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
        width: var(--menu-width);
        bottom: 45px;
        left: 0;
        max-height: 300px;
        min-height: auto;
        overflow: hidden;
        overflow-y: auto;
        background: var(--menu-bg);
        z-index: 99999;
        box-shadow: var(--menu-shadow);
        border: 1px solid var(--menu-border-color);
        border-radius: var(--menu-radius);
        padding: var(--menu-padding);
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
        padding: var(--menu-item-padding);
        display: flex;
        align-items: center;
        border: 1px solid var(--menu-border-color);
        border-radius: var(--button-radius);
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

      .menu-option-trigger {
        display: flex;
        align-items: center;
        gap: 8px;
        text-decoration: none;
        color: var(--menu-text);
        font-size: var(--subtitle-size);
        padding: 4px 0;
        transition: color 0.2s ease;
        width: 100%;
        white-space: nowrap;
        background: transparent;
        border: none;
        cursor: pointer;
        text-align: left;
      }

      .menu-option-trigger:hover {
        color: var(--primary);
      }

      .menu-option-trigger span {
        flex: 1;
      }

      .menu-icon-smatest {
        width: 20px;
        height: 20px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        overflow: hidden;
      }

      .cw-input input {
        border: none;
        background: transparent;
        outline: none;
        width: 100%;
        font-size: var(--input-size);
        padding: 10px 50px 10px var(--input-padding-x);
        color: var(--input-text);
        font-family: var(--font-family);
        letter-spacing: 0.01em;
        line-height: var(--line-height);
      }

      .cw-input.phone-input input {
        padding-left: 8px;
      }

      .cw-input input:disabled {
        color: #9ca3af;
        cursor: not-allowed;
      }

      .cw-input input::placeholder {
        color: var(--input-placeholder);
        font-weight: 400;
      }

      .cw-send {
        position: absolute;
        right: 6px;
        top: 50%;
        transform: translateY(-50%);
        width: var(--send-button-size);
        height: var(--send-button-size);
        border-radius: var(--button-radius);
        padding: 0;
        display: inline-grid;
        place-items: center;
        border: 1px solid var(--send-button-border);
        cursor: pointer;
        box-shadow: var(--send-button-shadow);
        background: var(--send-button-bg) !important;
        color: var(--send-button-text);
        transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
        flex-shrink: 0;
      }

      .cw-send:hover:not(:disabled) {
        transform: translateY(-50%) scale(1.05);
        box-shadow: var(--option-hover-shadow);
        background: var(--send-button-hover-bg) !important;
        color: var(--send-button-hover-text) !important;
        border-color: var(--send-button-hover-border) !important;
      }

      .cw-send:active:not(:disabled) {
        transform: translateY(-50%) scale(0.98);
      }

      .cw-send:disabled {
        background: var(--send-button-disabled-bg);
        color: var(--send-button-disabled-text);
        border-color: var(--send-button-disabled-border);
        cursor: not-allowed;
        box-shadow: none;
        opacity: 0.6;
      }

      .cw-input.phone-input .cw-input-menu {
        display: none;
      }

      .cw-control-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        line-height: 1;
        color: currentColor;
        font-size: inherit;
        overflow: hidden;
      }

      .cw-control-icon > * {
        max-width: 100%;
        max-height: 100%;
        flex-shrink: 0;
      }

      .cw-control-icon svg,
      .cw-control-icon img,
      .menu-icon-smatest svg,
      .menu-icon-smatest img,
      .cw-button-icon svg,
      .cw-button-icon img {
        width: 100%;
        height: 100%;
        display: block;
        object-fit: contain;
      }

      .cw-control-icon svg {
        width: 16px;
        height: 16px;
        display: block;
      }

      .cw-send-icon svg {
        width: 14px;
        height: 14px;
      }

      .cw-button-icon {
        width: 14px;
        height: 14px;
        margin-right: 6px;
        flex-shrink: 0;
      }

      .cw-button-label {
        display: inline-flex;
        align-items: center;
      }

      .cw-reset-modal-bg {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border-radius: var(--panel-radius);
        background: var(--overlay-bg);
        -webkit-backdrop-filter: blur(2px);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 999;
        backdrop-filter: blur(2px);
      }

      .cw-reset-modal {
        background: var(--modal-bg);
        border-radius: var(--modal-radius);
        padding: var(--modal-padding);
        max-width: var(--modal-width);
        width: 90%;
        box-shadow: var(--modal-shadow);
        text-align: center;
        font-family: var(--font-family);
      }

      .cw-reset-modal h2 {
        font-size: var(--title-size);
        margin-bottom: 10px;
        font-weight: 600;
        color: var(--modal-title-text);
        letter-spacing: 0.01em;
      }

      .cw-reset-modal p {
        font-size: var(--message-size);
        margin-bottom: 20px;
        color: var(--modal-text);
        line-height: var(--line-height);
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
        border-radius: var(--button-radius) !important;
        cursor: pointer !important;
        font-size: 13px !important;
        font-weight: 600 !important;
        line-height: 1 !important;
        white-space: nowrap !important;
        transition: all 0.2s ease !important;
        font-family: var(--font-family) !important;
      }

      .chatbot-container .cw-reset-modal .cw-btn-cancel {
        background: var(--cancel-button-bg) !important;
        border: 1px solid var(--cancel-button-border) !important;
        color: var(--cancel-button-text) !important;
      }

      .chatbot-container .cw-reset-modal .cw-btn-cancel:hover {
        background: var(--cancel-button-hover-bg) !important;
        color: var(--cancel-button-hover-text) !important;
        border-color: var(--cancel-button-hover-border) !important;
      }

      .chatbot-container .cw-reset-modal .cw-btn-reset {
        background: var(--reset-button-bg) !important;
        color: var(--reset-button-text) !important;
        border: 1px solid var(--reset-button-border) !important;
      }

      .chatbot-container .cw-reset-modal .cw-btn-reset:hover {
        background: var(--reset-button-hover-bg) !important;
        color: var(--reset-button-hover-text) !important;
        border-color: var(--reset-button-hover-border) !important;
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
          width: var(--mobile-fab-size) !important;
          height: var(--mobile-fab-size) !important;
        }

        .cw-panel {
          position: fixed !important;
          width: var(--mobile-panel-width) !important;
          max-width: var(--mobile-panel-max-width) !important;
          height: var(--mobile-panel-height) !important;
          max-height: var(--mobile-panel-max-height) !important;
          border-radius: var(--mobile-panel-radius) !important;
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
          background: var(--overlay-bg);
          z-index: -1;
          -webkit-backdrop-filter: blur(3px);
          backdrop-filter: blur(3px);
        }

        .cw-body {
          padding: var(--mobile-body-padding);
        }

        .cw-msg {
          max-width: var(--mobile-message-max-width);
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
          width: min(96%, var(--mobile-panel-width)) !important;
          max-width: min(96%, var(--mobile-panel-max-width)) !important;
          height: min(94vh, var(--mobile-panel-height)) !important;
          max-height: min(94vh, var(--mobile-panel-max-height)) !important;
        }
      }
    </style>
  `;
}
