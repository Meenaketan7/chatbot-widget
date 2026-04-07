import { COUNTRY_CODES } from "../constants/country_codes";
import type {
  ChatbotConfig,
  ChatbotState,
  InputFieldType,
} from "../core/types";
import { buildUIStyles } from "./ui.styles";
import type { PhoneSelection } from "./ui.types";
import { renderMenuHTML } from "./menu.ui";

export function resolveDefaultPhoneSelection(
  config: ChatbotConfig,
): PhoneSelection {
  const defaultPhoneCountry =
    COUNTRY_CODES.find(
      (country) =>
        country.dial_code ===
        config.inputConfig?.phoneConfig?.defaultCountryCode,
    ) ||
    COUNTRY_CODES.find(
      (country) =>
        country.code === config.inputConfig?.phoneConfig?.defaultCountry ||
        country.name === config.inputConfig?.phoneConfig?.defaultCountry,
    ) ||
    COUNTRY_CODES[0];

  return {
    dialCode: defaultPhoneCountry?.dial_code || "",
    countryCode: defaultPhoneCountry?.code || "",
  };
}

export function renderCountryPickerHTML(selection: PhoneSelection): string {
  return `
    <div class="cw-country-picker">
      <span class="cw-country-code">${selection.dialCode}</span>
      <span class="cw-country-name">${selection.countryCode}</span>
      <span class="cw-country-arrow">▼</span>
      <div class="cw-country-dropdown">
        ${COUNTRY_CODES.map(
          (country) => `
            <div class="cw-country-item ${country.dial_code === selection.dialCode ? "selected" : ""}" 
              data-code="${country.dial_code}" 
              data-country-code="${country.code}"
              tabindex="0">
              <span class="cw-country-item-name">${country.name}</span>
              <span class="cw-country-item-dial">${country.dial_code}</span>
              <span class="cw-country-item-code">${country.code}</span>
            </div>
          `,
        ).join("")}
      </div>
    </div>
  `;
}

export function renderInputHTML(
  config: ChatbotConfig,
  inputType: InputFieldType,
  phoneSelection: PhoneSelection,
): string {
  return `
    <div class="cw-input ${inputType === "phone" ? "phone-input" : ""}">
      ${inputType === "phone" ? renderCountryPickerHTML(phoneSelection) : ""}
      ${renderMenuHTML(config.inputConfig?.menu, inputType)}
      <input 
        type="${inputType === "email" ? "email" : inputType === "phone" ? "tel" : "text"}" 
        placeholder="${config.inputConfig?.placeholder || config.placeholder || "Type your message..."}"
        aria-label="Type a message"
      />
      <button class="cw-send" aria-label="Send message" title="Send message">
        <svg width="20px" height="20px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none">
          <path fill="#fff" fill-rule="evenodd" d="M2.345 2.245a1 1 0 0 1 1.102-.14l18 9a1 1 0 0 1 0 1.79l-18 9a1 1 0 0 1-1.396-1.211L4.613 13H10a1 1 0 1 0 0-2H4.613L2.05 3.316a1 1 0 0 1 .294-1.071z" clip-rule="evenodd"/>
        </svg>
      </button>
    </div>
  `;
}

export function renderUIHTML(
  config: ChatbotConfig,
  state: ChatbotState,
  inputType: InputFieldType,
  phoneSelection: PhoneSelection,
): string {
  return `
    ${buildUIStyles(config, state)}
    <div class="chatbot-container" role="region" aria-label="Chat support widget">
      <button class="cw-fab" aria-label="Open chat">
        ${config.chatIcon || `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`}
        <span class="cw-fab-status-dot online"></span>
        <div class="cw-fab-wave"></div>
      </button>
      <div class="cw-panel" role="dialog" aria-modal="false">
        <div class="cw-header">
          <div class="avatar">${config.botIcon || "🤖"}</div>
          <div class="titlewrap">
            <div class="title">${config.title || "Chatbot"}</div>
            <div class="subtitle">
              <span class="connection-status">
                <span class="connection-dot"></span>
                <span class="connection-text">Online</span>
              </span>
            </div>
          </div>
          <div class="actions">
            <button class="reset-btn" title="Reset Session"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg></button>
            <button class="close" title="Close">✕</button>
          </div>
        </div>
        <div class="cw-body" tabindex="0" aria-live="polite"></div>
        <div class="cw-footer">
          ${renderInputHTML(config, inputType, phoneSelection)}
        </div>
      </div>
    </div>
  `;
}
