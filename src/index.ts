import { Chatbot } from "./chatbot";
import { ChatbotConfig } from "./types";

class ChatbotElement extends HTMLElement {
  chatbot: Chatbot | null = null;

  connectedCallback() {
    if (!this.chatbot) {
      const config: Partial<ChatbotConfig> = {
        title: this.getAttribute("title") || undefined,
        position: (this.getAttribute("position") as any) || "bottom-right",
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

export { Chatbot };
