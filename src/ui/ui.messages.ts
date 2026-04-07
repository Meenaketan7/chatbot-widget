import type { ChatMessage } from "../core/types";
import { sanitizeHtml } from "../core/utils";
import type { MessageRendererOptions } from "./ui.types";

export function createMessageRenderer(options: MessageRendererOptions) {
  const { body, config, state, handlers, scrollToBottom } = options;
  const multiSelectState = new Map<
    string,
    { ids: Set<string>; textById: Map<string, string> }
  >();

  const groupMessages = (messages: ChatMessage[]): ChatMessage[][] => {
    const groups: ChatMessage[][] = [];
    let currentGroup: ChatMessage[] = [];
    let lastRole: string | null = null;

    messages.forEach((message) => {
      if (message.role !== lastRole) {
        if (currentGroup.length > 0) {
          groups.push(currentGroup);
        }
        currentGroup = [message];
        lastRole = message.role;
      } else {
        currentGroup.push(message);
      }
    });

    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    return groups;
  };

  const handleOptionClick = (
    optionId: string,
    optionText: string,
    messageId: string,
    optionElement: HTMLElement,
  ) => {
    const messageElement = optionElement.closest(".cw-msg");
    const allOptions = messageElement?.querySelectorAll(".cw-option-item");
    allOptions?.forEach((option) => {
      option.classList.add("disabled");
      option.classList.remove("selected");
    });
    optionElement.classList.add("selected");
    optionElement.classList.remove("disabled");
    handlers.onOptionSelect(optionId, optionText, messageId);
  };

  const renderTextBubble = (message: ChatMessage, bubble: HTMLElement) => {
    const textDiv = document.createElement("div");
    textDiv.className = "cw-bubble-text";
    textDiv.innerHTML = message.content ? sanitizeHtml(message.content) : "";
    bubble.appendChild(textDiv);
  };

  const renderOptionSelection = (
    message: ChatMessage,
    wrapper: HTMLElement,
    bubble: HTMLElement,
  ) => {
    renderTextBubble(message, bubble);
    wrapper.appendChild(bubble);

    const optionContainer = document.createElement("div");
    optionContainer.className = "cw-option-selection";
    const allowMultiple = !!message.payload?.allowMultiple;
    const minSelections =
      typeof message.payload?.minSelections === "number"
        ? message.payload.minSelections
        : allowMultiple
          ? 1
          : 0;
    const maxSelections =
      typeof message.payload?.maxSelections === "number"
        ? message.payload.maxSelections
        : Infinity;
    const confirmButtonText = message.payload?.confirmButtonText || "Confirm";

    if (allowMultiple && !multiSelectState.has(message.id)) {
      multiSelectState.set(message.id, {
        ids: new Set(),
        textById: new Map(),
      });
    }

    if (message.payload?.options?.length) {
      const optionsList = document.createElement("div");
      optionsList.className = "cw-options-list";

      const actionsRow = document.createElement("div");
      actionsRow.className = "cw-multi-actions";

      const hint = document.createElement("div");
      hint.className = "cw-multi-hint";

      const confirmBtn = document.createElement("button");
      confirmBtn.type = "button";
      confirmBtn.className = "cw-multi-confirm";
      confirmBtn.textContent = confirmButtonText;

      const syncConfirmState = () => {
        if (!allowMultiple) return;

        const selectionState = multiSelectState.get(message.id);
        const count = selectionState ? selectionState.ids.size : 0;

        if (count < minSelections) {
          confirmBtn.disabled = true;
          hint.classList.remove("error");
          hint.textContent =
            minSelections > 0
              ? `Select at least ${minSelections} option${minSelections > 1 ? "s" : ""}`
              : "";
          return;
        }

        confirmBtn.disabled = false;
        hint.classList.remove("error");
        hint.textContent = `${count} selected`;
      };

      message.payload.options.forEach((option: any) => {
        const optionItem = document.createElement("div");
        optionItem.className = `cw-option-item ${message.disabled ? "disabled" : ""} ${allowMultiple ? "multi" : ""}`;

        if (allowMultiple) {
          const bullet = document.createElement("div");
          bullet.className = "option-bullet";

          const dot = document.createElement("div");
          dot.className = "option-bullet-dot";
          bullet.appendChild(dot);
          optionItem.appendChild(bullet);
        }

        const optionText = document.createElement("span");
        optionText.className = "option-text";
        optionText.textContent = option.text;

        const optionCheck = document.createElement("div");
        optionItem.appendChild(optionText);
        optionItem.appendChild(optionCheck);

        if (allowMultiple) {
          const selectionState = multiSelectState.get(message.id);
          if (selectionState?.ids.has(option.id)) {
            optionItem.classList.add("selected");
          }
        }

        if (!message.disabled) {
          optionItem.addEventListener("click", () => {
            if (!allowMultiple) {
              handleOptionClick(option.id, option.text, message.id, optionItem);
              return;
            }

            const selectionState = multiSelectState.get(message.id)!;
            const isSelected = selectionState.ids.has(option.id);

            if (isSelected) {
              selectionState.ids.delete(option.id);
              selectionState.textById.delete(option.id);
              optionItem.classList.remove("selected");
            } else {
              if (selectionState.ids.size >= maxSelections) {
                hint.classList.add("error");
                hint.textContent = `You can select up to ${maxSelections} option${maxSelections > 1 ? "s" : ""}.`;
                return;
              }
              selectionState.ids.add(option.id);
              selectionState.textById.set(option.id, option.text);
              optionItem.classList.add("selected");
            }

            syncConfirmState();
          });
        }

        optionsList.appendChild(optionItem);
      });

      optionContainer.appendChild(optionsList);

      if (allowMultiple && !message.disabled) {
        actionsRow.appendChild(hint);
        actionsRow.appendChild(confirmBtn);
        optionContainer.appendChild(actionsRow);
        syncConfirmState();

        confirmBtn.addEventListener("click", () => {
          const selectionState = multiSelectState.get(message.id)!;
          const ids = Array.from(selectionState.ids);
          const texts = ids
            .map((id) => selectionState.textById.get(id) || "")
            .filter(Boolean);

          if (texts.length < minSelections) {
            hint.classList.add("error");
            hint.textContent =
              minSelections > 0
                ? `Select at least ${minSelections} option${minSelections > 1 ? "s" : ""}.`
                : "Please select an option.";
            return;
          }

          optionsList.classList.add("locked");
          confirmBtn.disabled = true;

          handlers.onOptionSelect(ids[0], texts.join(", "), message.id, {
            allowMultiple: true,
            optionIds: ids,
            optionTexts: texts,
            options: message.payload?.options,
          });
        });
      }
    }

    wrapper.appendChild(optionContainer);
  };

  const renderMessageElement = (
    message: ChatMessage,
    position: "first" | "middle" | "last" | "single",
  ) => {
    const wrapper = document.createElement("div");
    wrapper.className = `cw-msg ${message.role}`;
    wrapper.setAttribute("data-id", message.id);

    if (position === "first") wrapper.classList.add("first-in-group");
    if (position === "middle") wrapper.classList.add("middle-in-group");
    if (position === "last") wrapper.classList.add("last-in-group");
    if (position === "single") wrapper.classList.add("single-in-group");

    const bubble = document.createElement("div");
    bubble.className = "cw-bubble";

    if (!message.type || message.type === "text") {
      renderTextBubble(message, bubble);
      wrapper.appendChild(bubble);
      return wrapper;
    }

    if (message.type === "option_selection") {
      renderOptionSelection(message, wrapper, bubble);
      return wrapper;
    }

    renderTextBubble(message, bubble);
    wrapper.appendChild(bubble);
    return wrapper;
  };

  const renderTypingIndicator = () => {
    const typingGroup = document.createElement("div");
    typingGroup.className = "cw-message-group assistant";

    const avatar = document.createElement("div");
    avatar.className = "cw-bot-avatar";
    avatar.innerHTML =
      typeof config.botIcon === "string" ? config.botIcon : "🤖";
    typingGroup.appendChild(avatar);

    const typingMessage = document.createElement("div");
    typingMessage.className = "cw-msg assistant";
    typingMessage.innerHTML = `<div class="cw-bubble cw-typing">${
      config.typingMessage || "● ●"
    }</div>`;
    typingGroup.appendChild(typingMessage);

    return typingGroup;
  };

  const renderAll = (messages: ChatMessage[]) => {
    body.innerHTML = "";
    const groups = groupMessages(messages);

    groups.forEach((group) => {
      const groupContainer = document.createElement("div");
      groupContainer.className = `cw-message-group ${group[0].role}`;

      if (group[0].role === "assistant") {
        const avatar = document.createElement("div");
        avatar.className = "cw-bot-avatar";
        avatar.innerHTML =
          typeof config.botIcon === "string" ? config.botIcon : "🤖";
        groupContainer.appendChild(avatar);
      }

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

        groupContainer.appendChild(renderMessageElement(message, position));
      });

      body.appendChild(groupContainer);
    });

    if (state.isTyping) {
      body.appendChild(renderTypingIndicator());
    }

    scrollToBottom();
  };

  return {
    renderAll,
  };
}
