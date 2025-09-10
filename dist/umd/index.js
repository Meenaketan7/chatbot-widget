(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.UniversalChatbot = {}));
})(this, (function (exports) { 'use strict';

  function createUI(root, config, state, handlers) {
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
      const container = root.querySelector(".chatbot-container");
      const chatWindow = container.querySelector(".chat-window");
      const messagesEl = container.querySelector(".chat-messages");
      const input = container.querySelector(".chat-input input");
      const sendBtn = container.querySelector(".chat-input button");
      const toggleBtn = container.querySelector(".chat-toggle");
      const closeBtn = container.querySelector(".close-btn");
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
          setOpen(open) {
              chatWindow.style.display = open ? "flex" : "none";
          },
          setTyping(isTyping) {
              if (isTyping) {
                  const typingEl = document.createElement("div");
                  typingEl.className = "msg assistant typing";
                  typingEl.innerHTML = `<div class="bubble">${config.typingMessage}</div>`;
                  messagesEl.appendChild(typingEl);
              }
              else {
                  const typing = messagesEl.querySelector(".typing");
                  if (typing)
                      typing.remove();
              }
          },
          renderMessages(messages) {
              messagesEl.innerHTML = "";
              messages.forEach((m) => {
                  const div = document.createElement("div");
                  div.className = `msg ${m.role}`;
                  div.innerHTML = `<div class="bubble">${m.content}</div>`;
                  messagesEl.appendChild(div);
              });
              messagesEl.scrollTop = messagesEl.scrollHeight;
          },
          updateConfig(newConfig) {
              // future: update colors, labels etc dynamically
          },
      };
  }

  function generateId() {
      return Math.random().toString(36).substr(2, 9);
  }

  class Chatbot {
      constructor(config = {}) {
          this.config = {
              position: "bottom-right",
              autoOpen: false,
              persistMessages: false,
              maxMessages: 100,
              title: "Chat with us",
              placeholder: "Type a message...",
              welcomeMessage: "Hello 👋 How can I help?",
              errorMessage: "Something went wrong. Please try again.",
              typingMessage: "Bot is typing...",
              ...config,
          };
          this.state = {
              isOpen: !!this.config.autoOpen,
              isTyping: false,
              messages: [],
              currentInput: "",
          };
          // create root container
          this.root = document.createElement("div");
          this.root.className = "chatbot-widget-root";
          document.body.appendChild(this.root);
          // render UI
          this.ui = createUI(this.root, this.config, this.state, {
              onToggle: () => this.toggle(),
              onSend: (msg) => this.sendMessage(msg),
              onClose: () => this.close(),
          });
          if (this.config.welcomeMessage) {
              this.pushMessage(this.config.welcomeMessage, "assistant");
          }
      }
      pushMessage(content, role) {
          const message = {
              id: generateId(),
              content,
              role,
              timestamp: new Date(),
          };
          this.state.messages.push(message);
          if (this.config.maxMessages &&
              this.state.messages.length > this.config.maxMessages) {
              this.state.messages.shift();
          }
          this.ui.renderMessages(this.state.messages);
      }
      open() {
          this.state.isOpen = true;
          this.ui.setOpen(true);
          this.config.onOpen?.();
      }
      close() {
          this.state.isOpen = false;
          this.ui.setOpen(false);
          this.config.onClose?.();
      }
      toggle() {
          this.state.isOpen ? this.close() : this.open();
      }
      sendMessage(message) {
          if (!message.trim())
              return;
          this.pushMessage(message, "user");
          try {
              const reply = this.config.onMessageSend?.(message);
              if (reply instanceof Promise) {
                  this.state.isTyping = true;
                  this.ui.setTyping(true);
                  reply
                      .then((res) => {
                      this.state.isTyping = false;
                      this.ui.setTyping(false);
                      this.pushMessage(res, "assistant");
                  })
                      .catch((err) => {
                      this.config.onError?.(err);
                      this.pushMessage(this.config.errorMessage || "Error", "assistant");
                  });
              }
              else if (reply) {
                  this.pushMessage(reply, "assistant");
              }
          }
          catch (err) {
              this.config.onError?.(err);
              this.pushMessage(this.config.errorMessage || "Error", "assistant");
          }
      }
      clearMessages() {
          this.state.messages = [];
          this.ui.renderMessages(this.state.messages);
      }
      destroy() {
          this.root.remove();
      }
      updateConfig(config) {
          this.config = { ...this.config, ...config };
          this.ui.updateConfig(this.config);
      }
  }

  class ChatbotElement extends HTMLElement {
      constructor() {
          super(...arguments);
          this.chatbot = null;
      }
      connectedCallback() {
          if (!this.chatbot) {
              const config = {
                  title: this.getAttribute("title") || undefined,
                  position: this.getAttribute("position") || "bottom-right",
              };
              this.chatbot = new Chatbot(config);
          }
      }
      disconnectedCallback() {
          this.chatbot?.destroy();
          this.chatbot = null;
      }
  }
  if (!customElements.get("chatbot-widget")) {
      customElements.define("chatbot-widget", ChatbotElement);
  }

  exports.Chatbot = Chatbot;

}));
//# sourceMappingURL=index.js.map
