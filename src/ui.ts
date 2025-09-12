import { ChatbotConfig, ChatbotState, ChatMessage } from "./types";
import { sanitizeHtml } from "./utils";

export function createUI(
  root: HTMLElement,
  config: ChatbotConfig,
  state: ChatbotState,
  handlers: {
    onToggle: () => void;
    onSend: (msg: string) => void;
    onClose: () => void;
    onReset: () => void;
    onOptionSelect: (
      optionId: string,
      optionText: string,
      messageId: string,
    ) => void;
  },
) {
  root.innerHTML = `
    <style>
      :root {
        --primary: ${config.primaryColor || "#007bff"};
        --bg: ${config.backgroundColor || "#fff"};
        --accent: ${config.secondaryColor || "#6c757d"};
        --radius: ${config.borderRadius || "10px"};
        --text-primary: #1f2937;
        --text-secondary: #6b7280;
        --shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      }
      
      .chatbot-container {
        position: fixed;
        ${config.position?.includes("bottom") ? "bottom: 20px;" : "top: 20px;"}
        ${config.position?.includes("right") ? "right: 20px;" : "left: 20px;"}
        z-index: 99999;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;     
      }
      
      /* Toggle FAB */
      .cw-fab {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
        display: inline-grid;
        place-items: center;
        box-shadow: var(--shadow);
        cursor: pointer;
        border: none;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        color: white;
      }
      
      .cw-fab:hover {
        transform: translateY(-2px);
        box-shadow: 0 25px 30px -5px rgba(0, 0, 0, 0.15), 0 15px 15px -5px rgba(0, 0, 0, 0.1);
      }
      
      /* Panel */
      .cw-panel {
        width: 380px;
        max-width: calc(100vw - 32px);
        height: 600px;
        max-height: 80vh;
        display: ${state.isOpen ? "flex" : "none"};
        flex-direction: column;
        background: var(--bg);
        border-radius: var(--radius);
        box-shadow: var(--shadow);
        overflow: hidden;
        transform-origin: bottom right;
        animation: cw-entrance 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border: 1px solid rgba(139, 92, 246, 0.1);
      }
      
      @keyframes cw-entrance {
        from { 
          transform: translateY(20px) scale(0.95); 
          opacity: 0; 
        } 
        to { 
          transform: translateY(0) scale(1); 
          opacity: 1; 
        }
      }
      
      .cw-header {
        padding: 20px;
        display: flex;
        gap: 12px;
        align-items: center;
        background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
        color: white;
        flex-shrink: 0;
        flex-grow: 0;
      }
      
      .cw-header, .cw-footer {
        flex-shrink: 0;
        flex-grow: 0;
      }
      
      .cw-header .avatar {
        width: 44px; 
        height: 44px; 
        border-radius: 12px; 
        background: rgba(255,255,255,0.15);
        display: grid; 
        place-items: center; 
        font-size: 20px;
        backdrop-filter: blur(10px);
      }     
      
      .cw-header .titlewrap { flex: 1; }
      
      .cw-header .title { 
        font-weight: 600; 
        font-size: 18px; 
        margin-bottom: 2px;
      }      
      
      .cw-header .subtitle { 
        font-size: 14px; 
        opacity: 0.9; 
        font-weight: 400;
      }
      
      .cw-header .actions {
        display: flex;
        gap: 8px;
      }
      
      .cw-header .actions button { 
        background: rgba(255,255,255,0.1); 
        border: none; 
        color: rgba(255,255,255,0.9); 
        font-size: 16px; 
        cursor: pointer;
        width: 36px;
        height: 36px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
      }
      
      .cw-header .actions button:hover {
        background: rgba(255,255,255,0.2);
        transform: scale(1.05);
      }
      
      .cw-header .actions .reset-btn {
        background: rgba(255, 165, 0, 0.2);
      }
      
      .cw-header .actions .reset-btn:hover {
        background: rgba(255, 165, 0, 0.3);
        transform: scale(1.05);
      }
      
      .cw-body {
        padding: 16px 20px;
        background: #f8fafc;
        display: flex;
        flex-direction: column;
        gap: 2px; /* NEW: Reduced gap for message grouping */
        overflow-y: auto;
        flex: 1 1 0%;
        min-height: 0;
      }
      
      .cw-body::-webkit-scrollbar {
        width: 4px;
      }
      
      .cw-body::-webkit-scrollbar-track {
        background: transparent;
      }
      
      .cw-body::-webkit-scrollbar-thumb {
        background: rgba(139, 92, 246, 0.2);
        border-radius: 2px;
      }
      
      .cw-body::-webkit-scrollbar-thumb:hover {
        background: rgba(139, 92, 246, 0.3);
      }

      /* NEW: Message group container */
      .cw-message-group {
        margin-bottom: 16px;
        display: flex;
        flex-direction: column;
        gap: 3px; /* Small gap between messages in same group */
      }
      
      .cw-message-group.assistant {
        align-items: flex-start;
      }
      
      .cw-message-group.user {
        align-items: flex-end;
      }
      
      /* NEW: Individual message within group */
      .cw-msg {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-bottom: 0; /* Remove margin since group handles spacing */
        max-width: 85%;
      }
      
      .cw-msg.assistant {
        align-items: flex-start;
      }
      
      .cw-msg.user {
        align-items: flex-end;
      }

      /* NEW: First message in group has normal bubble radius */
      .cw-msg.first-in-group .cw-bubble {
        /* Keep normal radius */
      }
      
      /* NEW: Middle messages in group have reduced radius on connecting sides */
      .cw-msg.middle-in-group.assistant .cw-bubble {
        border-bottom-left-radius: 6px;
      }
      
      .cw-msg.middle-in-group.user .cw-bubble {
        border-bottom-right-radius: 6px;
      }
      
      /* NEW: Last message in group has reduced radius on connecting side */
      .cw-msg.last-in-group.assistant .cw-bubble {
        border-bottom-left-radius: 6px;
      }
      
      .cw-msg.last-in-group.user .cw-bubble {
        border-bottom-right-radius: 6px;
      }
      
      .cw-bubble {
        padding: 12px 16px;
        border-radius: 18px;
        max-width: 100%;
        font-size: 14px;
        line-height: 1.4;
        word-wrap: break-word;
        position: relative;
      }
      
      .cw-msg.user .cw-bubble { 
        background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
        color: #fff; 
        border-bottom-right-radius: 6px;
        box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
      }     
      
      .cw-msg.assistant .cw-bubble { 
        background: #fff; 
        border: 1px solid #e5e7eb; 
        color: var(--text-primary);
        border-bottom-left-radius: 6px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      }    
      
      /* card */
      .cw-card {
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 6px 18px rgba(11,22,40,0.06);
        max-width: 280px;
      }
      
      .cw-card img { 
        width:100%; 
        height:140px; 
        object-fit:cover; 
        display:block; 
      }
      
      .cw-card .cw-card-body { 
        padding:12px; 
        background: #fff; 
      }
      
      .cw-card .cw-card-title { 
        font-weight:600; 
        margin-bottom:6px; 
        font-size: 15px;
      }
      
      .cw-card .cw-card-desc { 
        font-size:13px; 
        color:#666; 
        margin-bottom:10px;
        line-height: 1.4;
      }
      
      .cw-card .cw-card-actions { 
        display:flex; 
        gap:8px; 
        flex-wrap:wrap; 
      }
      
      .cw-quick {
        display:flex; 
        gap:6px; 
        flex-wrap:wrap; 
        margin-top:8px;
        max-width: 100%;
      }
      
      .cw-quick button {
        background: rgba(139, 92, 246, 0.1); 
        border: 1px solid rgba(139, 92, 246, 0.2); 
        padding: 8px 12px; 
        border-radius: 16px; 
        cursor: pointer; 
        font-size: 13px;
        color: var(--primary);
        transition: all 0.2s ease;
      }
      
      .cw-quick button:hover {
        background: rgba(139, 92, 246, 0.2);
        transform: translateY(-1px);
      }
      
      /* Option Selection Styles */
      .cw-option-selection {
        margin-top: 8px;
        width: 100%;
      }
      
      .cw-options-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      
      .cw-option-item {
        background: var(--primary);
        opacity: 0.9;
        border-radius: 12px;
        padding: 12px 16px;
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 13px;
        color: var(--bg);
        display: flex;
        align-items: center;
        justify-content: space-between;
        max-width: 300px;

      }
      
      .cw-option-item:hover:not(.disabled) {
        opacity: 1;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
      }
      
      .cw-option-item.selected {
        background: var(--primary);
        color: white;
        opacity: 1;
      }
      
      .cw-option-item.disabled {
        display: none; 
      }
      
      .cw-option-item .option-text {
        flex: 1;
        line-height: 1.3;
      }
      
      .cw-option-item .option-check {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 2px solid currentColor;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        opacity: 0;
        transition: opacity 0.2s ease;
        margin-left: 8px;
      }
      
      .cw-option-item.selected .option-check {
        opacity: 1;
      }
      
      .cw-typing { 
        font-size: 14px; 
        opacity: 0.8; 
        padding: 12px 16px; 
        border-radius: 16px; 
        background: #f1f5f9; 
        display: inline-block;
        border: 1px solid #e2e8f0;
      }     
      
      .cw-footer {
        padding: 20px;
        display: flex; 
        gap: 12px; 
        align-items: center; 
        border-top: 1px solid #e5e7eb; 
        background: #fff;
        flex-shrink: 0;
        flex-grow: 0;
      }    
      
      .cw-input {
        flex: 1; 
        display: flex; 
        gap: 12px; 
        align-items: center;
        border-radius: 25px; 
        padding: 12px 18px; 
        background: #f1f5f9;
        border: 1px solid #e2e8f0;
        transition: all 0.2s ease;
      }
      
      .cw-input.disabled {
        background: #f9fafb;
        border-color: #d1d5db;
        opacity: 0.7;
      }
      
      .cw-input:focus-within:not(.disabled) {
        background: #fff;
        border-color: var(--primary);
        box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
      }
      
      .cw-input input { 
        border: none; 
        background: transparent; 
        outline: none; 
        width: 100%; 
        font-size: 15px;
        color: var(--text-primary);
        font-family: inherit;
      }
      
      .cw-input input:disabled {
        color: #9ca3af;
        cursor: not-allowed;
      }
      
      .cw-send { 
        background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
        color: #fff; 
        border: none; 
        padding: 12px 20px; 
        border-radius: 20px; 
        cursor: pointer;
        font-weight: 600;
        font-size: 14px;
        transition: all 0.2s ease;
        box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
      }
      
      .cw-send:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(139, 92, 246, 0.4);
      }
      
      .cw-send:active:not(:disabled) {
        transform: translateY(0);
      }
      
      .cw-send:disabled {
        background: #d1d5db;
        cursor: not-allowed;
        box-shadow: none;
        transform: none;
      }
      
      /* small screens */
      @media (max-width: 420px) {
        .cw-panel { 
          width: calc(100vw - 20px); 
          right: 10px; 
          left: 10px; 
          bottom: 10px; 
          max-height: 85vh; 
        }
        
        .cw-header {
          padding: 16px;
        }
        
        .cw-body {
          padding: 16px;
        }
        
        .cw-footer {
          padding: 16px;
        }
        
        .cw-msg {
          max-width: 90%;
        }
        
        .cw-bubble {
          font-size: 13px;
        }
      }    
    </style>
    <div class="chatbot-container" role="region" aria-label="Chat support widget">
      <button class="cw-fab" aria-label="Open chat">${
        config.chatIcon ||
        `<svg class="chat-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" color="#fff">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>`
      }</button>
      <div class="cw-panel" role="dialog" aria-modal="false">
        <div class="cw-header">
          <div class="avatar">${config.botIcon || "🤖"}</div>
          <div class="titlewrap">
            <div class="title">${config.title}</div>
            <div class="subtitle">We're here to help</div>
          </div>
          <div class="actions">
            <button class="reset-btn" title="Reset Session">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                <path d="M3 3v5h5"/>
              </svg>
            </button>
            <button class="close" title="Close">✕</button>
          </div>
        </div>
        <div class="cw-body" tabindex="0" aria-live="polite"></div>
        <div class="cw-footer">
          <div class="cw-input">
            <input type="text" placeholder="${config.placeholder}" aria-label="Type a message"/>
          </div>
          <button class="cw-send" aria-label="Send message">Send</button>
        </div>
      </div>
    </div>
  `;

  const container = root.querySelector(".chatbot-container") as HTMLElement;
  const fab = container.querySelector(".cw-fab") as HTMLButtonElement;
  const panel = container.querySelector(".cw-panel") as HTMLElement;
  const body = container.querySelector(".cw-body") as HTMLElement;
  const input = container.querySelector(".cw-input input") as HTMLInputElement;
  const inputWrapper = container.querySelector(".cw-input") as HTMLElement;
  const sendBtn = container.querySelector(".cw-send") as HTMLButtonElement;
  const closeBtn = container.querySelector(".close") as HTMLButtonElement;
  const resetBtn = container.querySelector(".reset-btn") as HTMLButtonElement;

  const scrollToBottom = () => {
    if (panel.style.display !== "none") {
      body.scrollTop = body.scrollHeight;
    }
  };

  function handleOptionClick(
    optionId: string,
    optionText: string,
    messageId: string,
    optionElement: HTMLElement,
  ) {
    const messageElement = optionElement.closest(".cw-msg");
    const allOptions = messageElement?.querySelectorAll(".cw-option-item");

    allOptions?.forEach((option) => {
      option.classList.add("disabled");
      option.classList.remove("selected");
    });

    optionElement.classList.add("selected");
    optionElement.classList.remove("disabled");

    handlers.onOptionSelect(optionId, optionText, messageId);
  }

  // NEW: Group messages by consecutive sender
  function groupMessages(messages: ChatMessage[]): ChatMessage[][] {
    const groups: ChatMessage[][] = [];
    let currentGroup: ChatMessage[] = [];
    let lastRole: string | null = null;

    messages.forEach((message) => {
      if (message.role !== lastRole) {
        // Start new group
        if (currentGroup.length > 0) {
          groups.push(currentGroup);
        }
        currentGroup = [message];
        lastRole = message.role;
      } else {
        // Add to current group
        currentGroup.push(message);
      }
    });

    // Add final group
    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    return groups;
  }

  // render single message (supports types)
  function renderMessageEl(
    m: ChatMessage,
    position: "first" | "middle" | "last" | "single",
  ) {
    const wrapper = document.createElement("div");
    wrapper.className = `cw-msg ${m.role}`;

    // NEW: Add position classes for grouping styles
    if (position === "first") wrapper.classList.add("first-in-group");
    if (position === "middle") wrapper.classList.add("middle-in-group");
    if (position === "last") wrapper.classList.add("last-in-group");
    if (position === "single") wrapper.classList.add("single-in-group");

    wrapper.setAttribute("data-id", m.id);

    const bubble = document.createElement("div");
    bubble.className = "cw-bubble";

    const safeText = (s?: string) => (s ? sanitizeHtml(s) : "");

    if (!m.type || m.type === "text") {
      bubble.innerHTML = safeText(m.content || "");
      wrapper.appendChild(bubble);
    } else if (m.type === "image") {
      const img = document.createElement("img");
      img.src = m.payload?.src;
      img.alt = m.payload?.alt || "image";
      img.style.maxWidth = "220px";
      bubble.appendChild(img);
      if (m.content) {
        const t = document.createElement("div");
        t.innerHTML = safeText(m.content);
        bubble.appendChild(t);
      }
      wrapper.appendChild(bubble);
    } else if (m.type === "card") {
      const card = document.createElement("div");
      card.className = "cw-card";
      if (m.payload?.image) {
        const img = document.createElement("img");
        img.src = m.payload.image;
        card.appendChild(img);
      }
      const cbody = document.createElement("div");
      cbody.className = "cw-card-body";
      cbody.innerHTML = `<div class="cw-card-title">${sanitizeHtml(m.payload?.title || "")}</div>
                         <div class="cw-card-desc">${sanitizeHtml(m.payload?.description || "")}</div>`;
      if (m.payload?.buttons?.length) {
        const actions = document.createElement("div");
        actions.className = "cw-card-actions";
        m.payload.buttons.forEach((b: any) => {
          const btn = document.createElement("button");
          btn.textContent = b.text;
          btn.addEventListener("click", () => {
            handlers.onSend(b.value ?? b.text);
          });
          actions.appendChild(btn);
        });
        cbody.appendChild(actions);
      }
      card.appendChild(cbody);
      bubble.appendChild(card);
      wrapper.appendChild(bubble);
    } else if (m.type === "quick_replies") {
      bubble.innerHTML = m.content || "";
      wrapper.appendChild(bubble);
      const quick = document.createElement("div");
      quick.className = "cw-quick";
      (m.payload || []).forEach((qr: any) => {
        const b = document.createElement("button");
        b.textContent = qr.title || qr;
        b.addEventListener("click", () =>
          handlers.onSend(qr.value ?? qr.title ?? qr),
        );
        quick.appendChild(b);
      });
      wrapper.appendChild(quick);
    } else if (m.type === "option_selection") {
      bubble.innerHTML = safeText(m.content || "");
      wrapper.appendChild(bubble);

      const optionContainer = document.createElement("div");
      optionContainer.className = "cw-option-selection";

      if (m.payload?.options?.length) {
        const optionsList = document.createElement("div");
        optionsList.className = "cw-options-list";

        m.payload.options.forEach((option: any) => {
          const optionItem = document.createElement("div");
          optionItem.className = `cw-option-item ${m.disabled ? "disabled" : ""}`;

          const optionText = document.createElement("span");
          optionText.className = "option-text";
          optionText.textContent = option.text;

          const optionCheck = document.createElement("div");
          optionCheck.className = "option-check";
          optionCheck.innerHTML = "✓";

          optionItem.appendChild(optionText);
          optionItem.appendChild(optionCheck);

          if (!m.disabled) {
            optionItem.addEventListener("click", () => {
              handleOptionClick(option.id, option.text, m.id, optionItem);
            });
          }

          optionsList.appendChild(optionItem);
        });

        optionContainer.appendChild(optionsList);
      }

      wrapper.appendChild(optionContainer);
    } else if (m.type === "system") {
      bubble.innerHTML = sanitizeHtml(m.content || "");
      bubble.style.opacity = "0.85";
      wrapper.appendChild(bubble);
    }

    return wrapper;
  }

  // NEW: Render messages with grouping
  function renderAll(messages: ChatMessage[]) {
    body.innerHTML = "";

    const groups = groupMessages(messages);

    groups.forEach((group) => {
      const groupContainer = document.createElement("div");
      groupContainer.className = `cw-message-group ${group[0].role}`;

      group.forEach((message, index) => {
        let position: "first" | "middle" | "last" | "single";

        if (group.length === 1) {
          position = "single";
        } else if (index === 0) {
          position = "first";
        } else if (index === group.length - 1) {
          position = "last";
        } else {
          position = "middle";
        }

        const messageEl = renderMessageEl(message, position);
        groupContainer.appendChild(messageEl);
      });

      body.appendChild(groupContainer);
    });

    // render typing if state.isTyping true
    if (state.isTyping) {
      const typingGroup = document.createElement("div");
      typingGroup.className = "cw-message-group assistant";

      const t = document.createElement("div");
      t.className = "cw-msg assistant cw-typing";
      t.innerHTML = `<div class="cw-bubble cw-typing">${config.typingMessage}</div>`;

      typingGroup.appendChild(t);
      body.appendChild(typingGroup);
    }

    scrollToBottom();
  }

  function setInputDisabledState(disabled: boolean) {
    input.disabled = disabled;
    sendBtn.disabled = disabled;

    if (disabled) {
      inputWrapper.classList.add("disabled");
      input.placeholder = "Please select an option above...";
    } else {
      inputWrapper.classList.remove("disabled");
      input.placeholder = config.placeholder || "Type your message...";
    }
  }

  // wire events
  fab.addEventListener("click", () => {
    handlers.onToggle();
    if (!state.inputDisabled) {
      input.focus();
    }
  });

  closeBtn.addEventListener("click", () => handlers.onClose());

  resetBtn.addEventListener("click", () => {
    if (
      confirm(
        "Are you sure you want to start a new session? This will clear all messages.",
      )
    ) {
      handlers.onReset();
    }
  });

  sendBtn.addEventListener("click", () => {
    if (state.inputDisabled) return;

    const v = input.value.trim();
    if (!v) return;
    handlers.onSend(v);
    input.value = "";
    input.focus();
  });

  input.addEventListener("keydown", (e) => {
    if (state.inputDisabled) return;

    if (e.key === "Enter") {
      e.preventDefault();
      sendBtn.click();
    }
    if (e.key === "Escape" && state.isOpen) {
      handlers.onClose();
    }
  });

  return {
    setOpen(open: boolean) {
      state.isOpen = open;
      panel.style.display = open ? "flex" : "none";
      fab.style.display = open ? "none" : "inline-grid";
      if (open) {
        panel.offsetHeight;
      }
    },
    setTyping(isTyping: boolean) {
      state.isTyping = isTyping;
      renderAll(state.messages);
    },
    renderMessages(messages: ChatMessage[]) {
      renderAll(messages);
    },
    updateConfig(newConfig: ChatbotConfig) {
      Object.assign(config, newConfig);
      const el = root.querySelector(".chatbot-container") as HTMLElement;
      if (newConfig.primaryColor)
        el.style.setProperty("--primary", newConfig.primaryColor);
      if (newConfig.backgroundColor)
        el.style.setProperty("--bg", newConfig.backgroundColor);
      if (newConfig.secondaryColor)
        el.style.setProperty("--accent", newConfig.secondaryColor);
      if (newConfig.borderRadius)
        el.style.setProperty("--radius", newConfig.borderRadius);
    },
    focusInput() {
      if (!state.inputDisabled) {
        input.focus();
      }
    },
    setInputDisabled(disabled: boolean) {
      setInputDisabledState(disabled);
    },
  };
}
