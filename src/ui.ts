import { ChatbotConfig, ChatbotState, ChatMessage } from "./types";

export function createUI(
  root: HTMLElement,
  config: ChatbotConfig,
  state: ChatbotState,
  handlers: {
    onToggle: () => void;
    onSend: (msg: string) => void;
    onClose: () => void;
  },
) {
  root.innerHTML = `
    <style>
      .chatbot-container {
        position: fixed;
        ${config.position?.includes("bottom") ? "bottom: 20px;" : "top: 20px;"}
        ${config.position?.includes("right") ? "right: 20px;" : "left: 20px;"}
        z-index: 9999;
        font-family: sans-serif;
      }
      .chat-window {
        width: 320px;
        max-height: 420px;
        background: ${config.backgroundColor || "#fff"};
        border: 1px solid #ccc;
        border-radius: ${config.borderRadius || "12px"};
        display: ${state.isOpen ? "flex" : "none"};
        flex-direction: column;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        overflow: hidden;
      }
      .chat-header {
        background: ${config.primaryColor || "#0066ff"};
        color: #fff;
        padding: 8px 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .chat-messages {
        flex: 1;
        padding: 10px;
        overflow-y: auto;
        font-size: 14px;
      }
      .msg {
        margin-bottom: 8px;
        display: flex;
      }
      .msg.user { justify-content: flex-end; }
      .msg.assistant { justify-content: flex-start; }
      .bubble {
        padding: 6px 10px;
        border-radius: 8px;
        max-width: 75%;
      }
      .msg.user .bubble {
        background: ${config.primaryColor || "#0066ff"};
        color: #fff;
      }
      .msg.assistant .bubble {
        background: #f1f1f1;
        color: #111;
      }
      .chat-input {
        display: flex;
        border-top: 1px solid #ddd;
      }
      .chat-input input {
        flex: 1;
        border: none;
        padding: 8px;
        font-size: 14px;
      }
      .chat-input button {
        background: ${config.primaryColor || "#0066ff"};
        border: none;
        color: white;
        padding: 0 16px;
        cursor: pointer;
      }
      .chat-toggle {
        background: ${config.primaryColor || "#0066ff"};
        color: white;
        border-radius: 50%;
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        margin-top: 8px;
      }
    </style>
    <div class="chatbot-container">
      <div class="chat-window">
        <div class="chat-header">
          <span>${config.title}</span>
          <button class="close-btn">✕</button>
        </div>
        <div class="chat-messages"></div>
        <div class="chat-input">
          <input type="text" placeholder="${config.placeholder}" />
          <button>Send</button>
        </div>
      </div>
      <div class="chat-toggle">💬</div>
    </div>
  `;

  const container = root.querySelector(".chatbot-container") as HTMLElement;
  const chatWindow = container.querySelector(".chat-window") as HTMLElement;
  const messagesEl = container.querySelector(".chat-messages") as HTMLElement;
  const input = container.querySelector(
    ".chat-input input",
  ) as HTMLInputElement;
  const sendBtn = container.querySelector(
    ".chat-input button",
  ) as HTMLButtonElement;
  const toggleBtn = container.querySelector(".chat-toggle") as HTMLDivElement;
  const closeBtn = container.querySelector(".close-btn") as HTMLButtonElement;

  sendBtn.addEventListener("click", () => {
    handlers.onSend(input.value);
    input.value = "";
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      handlers.onSend(input.value);
      input.value = "";
    }
  });
  toggleBtn.addEventListener("click", handlers.onToggle);
  closeBtn.addEventListener("click", handlers.onClose);

  return {
    setOpen(open: boolean) {
      chatWindow.style.display = open ? "flex" : "none";
    },
    setTyping(isTyping: boolean) {
      if (isTyping) {
        const typingEl = document.createElement("div");
        typingEl.className = "msg assistant typing";
        typingEl.innerHTML = `<div class="bubble">${config.typingMessage}</div>`;
        messagesEl.appendChild(typingEl);
      } else {
        const typing = messagesEl.querySelector(".typing");
        if (typing) typing.remove();
      }
    },
    renderMessages(messages: ChatMessage[]) {
      messagesEl.innerHTML = "";
      messages.forEach((m) => {
        const div = document.createElement("div");
        div.className = `msg ${m.role}`;
        div.innerHTML = `<div class="bubble">${m.content}</div>`;
        messagesEl.appendChild(div);
      });
      messagesEl.scrollTop = messagesEl.scrollHeight;
    },
    updateConfig(newConfig: ChatbotConfig) {
      // future: update colors, labels etc dynamically
    },
  };
}
