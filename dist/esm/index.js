const DEFAULT_CONTROL_ICONS = {
    send: `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none"><path fill="currentColor" fill-rule="evenodd" d="M2.345 2.245a1 1 0 0 1 1.102-.14l18 9a1 1 0 0 1 0 1.79l-18 9a1 1 0 0 1-1.396-1.211L4.613 13H10a1 1 0 1 0 0-2H4.613L2.05 3.316a1 1 0 0 1 .294-1.071z" clip-rule="evenodd"/></svg>`,
    close: `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
    headerReset: `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 3v5h5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    menu: `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none"><rect x="3" y="5" width="18" height="3" rx="1.5" fill="currentColor"/><rect x="3" y="10.5" width="18" height="3" rx="1.5" fill="currentColor"/><rect x="3" y="16" width="18" height="3" rx="1.5" fill="currentColor"/></svg>`,
    menuClose: `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
    multiConfirm: "",
    modalReset: "",
    modalCancel: "",
};
const isRenderableNode = (value) => typeof Node !== "undefined" && value instanceof Node;
function renderIconMarkup(icon, fallback = "") {
    const resolvedIcon = typeof icon === "function" ? icon() : icon;
    if (resolvedIcon === undefined || resolvedIcon === null) {
        return fallback;
    }
    if (typeof resolvedIcon === "string") {
        return resolvedIcon;
    }
    if (isRenderableNode(resolvedIcon)) {
        const container = document.createElement("div");
        container.appendChild(resolvedIcon.cloneNode(true));
        return container.innerHTML;
    }
    return fallback;
}
function resolveControlIcon(config, key) {
    return config.theme?.icons?.[key] ?? DEFAULT_CONTROL_ICONS[key];
}
function renderControlIcon(config, key, className) {
    return `<span class="${className}" aria-hidden="true">${renderIconMarkup(resolveControlIcon(config, key))}</span>`;
}
function renderOptionalControlIcon(config, key, className) {
    const icon = resolveControlIcon(config, key);
    const markup = renderIconMarkup(icon);
    if (!markup)
        return "";
    return `<span class="${className}" aria-hidden="true">${markup}</span>`;
}

/**
 * Render menu HTML based on configuration (SmartBot Style)
 */
function renderMenuHTML(config, menuConfig, currentInputType) {
    if (!menuConfig?.enabled ||
        !menuConfig.items ||
        currentInputType === "phone") {
        return "";
    }
    if (menuConfig.showWhen && !menuConfig.showWhen.includes(currentInputType)) {
        return "";
    }
    let menuHTML = `
    <div class="cw-menu-container">
      <button class="menu-toggle-btn" type="button" aria-label="Menu" aria-expanded="false">
        ${renderControlIcon(config, "menu", "cw-control-icon menu-icon-sb menu-toggle-icon")}
        ${renderControlIcon(config, "menuClose", "cw-control-icon menu-icon-sb menu-close-icon icon-hidden")}
      </button>

      <div class="menu-options-div">
  `;
    menuConfig.items.forEach((item, index) => {
        const isLast = index === menuConfig.items.length - 1;
        const itemIcon = item.icon
            ? `<div class="menu-icon-smatest">${renderIconMarkup(item.icon)}</div>`
            : "";
        const itemContent = `
      ${itemIcon}
      <span>${item.text}</span>
    `;
        menuHTML += `
      <div class="pull-left full-width menu-option-div ${!isLast ? "border-bottom" : ""}">
        <label class="pull-left full-width pointer menu-option-label">
          ${item.action === "custom"
            ? `<button
                  type="button"
                  title="${item.text}"
                  class="text-black bot-google-font menu-option-trigger menu-option-button"
                  data-menu-id="${item.id}"
                  data-menu-action="${item.action}"
                  ${item.actionValue ? `data-menu-value="${item.actionValue}"` : ""}
                >
                  ${itemContent}
                </button>`
            : `<a
                  title="${item.text}"
                  class="text-black bot-google-font menu-option-trigger menu-option-link"
                  href="${item.action === "call" ? `tel:${item.actionValue}` : item.action === "email" ? `mailto:${item.actionValue}` : item.actionValue || "#"}"
                  ${item.action === "redirect" ? 'target="_blank" rel="noopener noreferrer"' : ""}
                  data-menu-id="${item.id}"
                  data-menu-action="${item.action}"
                  ${item.actionValue ? `data-menu-value="${item.actionValue}"` : ""}
                >
                  ${itemContent}
                </a>`}
        </label>
      </div>
    `;
    });
    menuHTML += `
      </div>
    </div>
  `;
    return menuHTML;
}
/**
 * Attach event listeners to menu items
 */
function attachMenuListeners(container, menuConfig, handlers, inputWrapper) {
    if (!menuConfig?.enabled || !menuConfig.items)
        return;
    const targetWrapper = inputWrapper || container.querySelector(".cw-input");
    const menuContainer = targetWrapper?.querySelector(".cw-menu-container");
    if (!menuContainer)
        return;
    const menuToggleBtn = menuContainer.querySelector(".menu-toggle-btn");
    const menuOptionsDiv = menuContainer.querySelector(".menu-options-div");
    const menuTriggers = Array.from(menuContainer.querySelectorAll(".menu-option-trigger"));
    if (!menuToggleBtn || !menuOptionsDiv)
        return;
    if (menuContainer.__menu_listeners_attached)
        return;
    menuContainer.__menu_listeners_attached = true;
    const toggleIcon = (showClose) => {
        const toggleIconEl = menuToggleBtn.querySelector(".menu-toggle-icon");
        const closeIconEl = menuToggleBtn.querySelector(".menu-close-icon");
        if (showClose) {
            toggleIconEl?.classList.add("icon-hidden");
            closeIconEl?.classList.remove("icon-hidden");
        }
        else {
            toggleIconEl?.classList.remove("icon-hidden");
            closeIconEl?.classList.add("icon-hidden");
        }
    };
    const openMenu = () => {
        menuContainer.classList.add("open");
        menuToggleBtn.setAttribute("aria-expanded", "true");
        menuOptionsDiv.style.display = "block";
        setTimeout(() => (menuOptionsDiv.style.opacity = "1"), 10);
        toggleIcon(true);
    };
    const closeMenu = () => {
        menuContainer.classList.remove("open");
        menuToggleBtn.setAttribute("aria-expanded", "false");
        menuOptionsDiv.style.opacity = "0";
        setTimeout(() => {
            if (!menuContainer.classList.contains("open")) {
                menuOptionsDiv.style.display = "none";
            }
        }, 150);
        toggleIcon(false);
    };
    const toggleMenu = (event) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        if (menuContainer.classList.contains("open")) {
            closeMenu();
        }
        else {
            openMenu();
        }
    };
    menuToggleBtn.addEventListener("click", toggleMenu);
    const closeMenuOutside = (event) => {
        const path = (event.composedPath && event.composedPath()) || [];
        if (!path.includes(menuContainer) &&
            menuContainer.classList.contains("open")) {
            closeMenu();
        }
    };
    document.addEventListener("click", closeMenuOutside);
    const onKeyDown = (event) => {
        if (event.key === "Escape" && menuContainer.classList.contains("open")) {
            closeMenu();
        }
    };
    document.addEventListener("keydown", onKeyDown);
    menuTriggers.forEach((trigger) => {
        const onClick = async (event) => {
            const action = trigger.getAttribute("data-menu-action");
            const menuId = trigger.getAttribute("data-menu-id");
            const value = trigger.getAttribute("data-menu-value");
            if (action === "custom") {
                event.preventDefault();
                await executeCustomMenuAction(menuConfig, menuId, {
                    event,
                    action,
                    actionValue: value || undefined,
                });
                closeMenu();
                return;
            }
            setTimeout(closeMenu, 120);
        };
        const onKey = (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                trigger.click();
            }
        };
        trigger.addEventListener("click", onClick);
        trigger.addEventListener("keydown", onKey);
    });
    menuContainer.__menu_cleanup = () => {
        menuToggleBtn.removeEventListener("click", toggleMenu);
        document.removeEventListener("click", closeMenuOutside);
        document.removeEventListener("keydown", onKeyDown);
        menuTriggers.forEach((trigger) => trigger.replaceWith(trigger.cloneNode(true)));
        delete menuContainer.__menu_listeners_attached;
    };
}
async function executeCustomMenuAction(menuConfig, menuId, partialContext = {}) {
    const menuItem = menuConfig.items.find((item) => item.id === menuId);
    if (!menuItem?.customHandler)
        return;
    try {
        await Promise.resolve(menuItem.customHandler({
            id: menuItem.id,
            text: menuItem.text,
            action: menuItem.action,
            actionValue: menuItem.actionValue,
            ...partialContext,
        }));
    }
    catch (error) {
        console.error("Custom menu action failed:", error);
    }
}

/**
 * Deep merge objects with proper typing
 */
function isPlainObject(value) {
    if (!value || typeof value !== "object")
        return false;
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
}
function deepMerge(target, source) {
    const result = { ...target };
    for (const key in source) {
        if (isPlainObject(source[key]) &&
            isPlainObject(result[key])) {
            result[key] = deepMerge(result[key], source[key]);
        }
        else if (isPlainObject(source[key])) {
            result[key] = deepMerge({}, source[key]);
        }
        else if (source[key] !== undefined) {
            result[key] = source[key];
        }
    }
    return result;
}
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}
function sanitizeHtml(input) {
    const div = document.createElement("div");
    div.textContent = input;
    return div.innerHTML;
}
/**
 * Format timestamp for display
 */
function formatTimestamp(date) {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1)
        return "Just now";
    if (minutes < 60)
        return `${minutes}m ago`;
    if (hours < 24)
        return `${hours}h ago`;
    if (days < 7)
        return `${days}d ago`;
    return date.toLocaleDateString();
}
/**
 * Generate message ID with timestamp
 */
function generateMessageId(prefix = "msg") {
    return `${prefix}_${Date.now()}_${generateId()}`;
}
/**
 * Generate session ID with timestamp
 */
function generateSessionId(prefix = "session", userId = "", botId = "") {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    const userSuffix = userId ? `_${userId.slice(-4)}` : "";
    const botSuffix = botId ? `_${botId.slice(-4)}` : "";
    return `${prefix}_${timestamp}_${random}${userSuffix}${botSuffix}`;
}
/**
 * Create event emitter
 */
function createEventEmitter() {
    const events = {};
    return {
        on(event, callback) {
            if (!events[event])
                events[event] = [];
            events[event].push(callback);
        },
        off(event, callback) {
            if (!events[event])
                return;
            events[event] = events[event].filter((cb) => cb !== callback);
        },
        emit(event, ...args) {
            if (!events[event])
                return;
            events[event].forEach((callback) => callback(...args));
        },
        once(event, callback) {
            const wrapper = (...args) => {
                callback(...args);
                this.off(event, wrapper);
            };
            this.on(event, wrapper);
        },
    };
}

function createMessageRenderer(options) {
    const { body, config, state, handlers, scrollToBottom } = options;
    const multiSelectState = new Map();
    const groupMessages = (messages) => {
        const groups = [];
        let currentGroup = [];
        let lastRole = null;
        messages.forEach((message) => {
            if (message.role !== lastRole) {
                if (currentGroup.length > 0) {
                    groups.push(currentGroup);
                }
                currentGroup = [message];
                lastRole = message.role;
            }
            else {
                currentGroup.push(message);
            }
        });
        if (currentGroup.length > 0) {
            groups.push(currentGroup);
        }
        return groups;
    };
    const handleOptionClick = (optionId, optionText, messageId, optionElement) => {
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
    const renderTextBubble = (message, bubble) => {
        const textDiv = document.createElement("div");
        textDiv.className = "cw-bubble-text";
        textDiv.innerHTML = message.content ? sanitizeHtml(message.content) : "";
        bubble.appendChild(textDiv);
    };
    const renderOptionSelection = (message, wrapper, bubble) => {
        renderTextBubble(message, bubble);
        wrapper.appendChild(bubble);
        const optionContainer = document.createElement("div");
        optionContainer.className = "cw-option-selection";
        const allowMultiple = !!message.payload?.allowMultiple;
        const minSelections = typeof message.payload?.minSelections === "number"
            ? message.payload.minSelections
            : allowMultiple
                ? 1
                : 0;
        const maxSelections = typeof message.payload?.maxSelections === "number"
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
            confirmBtn.innerHTML = `${renderOptionalControlIcon(config, "multiConfirm", "cw-control-icon cw-button-icon")}<span class="cw-button-label">${sanitizeHtml(confirmButtonText)}</span>`;
            const syncConfirmState = () => {
                if (!allowMultiple)
                    return;
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
            message.payload.options.forEach((option) => {
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
                        const selectionState = multiSelectState.get(message.id);
                        const isSelected = selectionState.ids.has(option.id);
                        if (isSelected) {
                            selectionState.ids.delete(option.id);
                            selectionState.textById.delete(option.id);
                            optionItem.classList.remove("selected");
                        }
                        else {
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
                    const selectionState = multiSelectState.get(message.id);
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
    const renderMessageElement = (message, position) => {
        const wrapper = document.createElement("div");
        wrapper.className = `cw-msg ${message.role}`;
        wrapper.setAttribute("data-id", message.id);
        if (position === "first")
            wrapper.classList.add("first-in-group");
        if (position === "middle")
            wrapper.classList.add("middle-in-group");
        if (position === "last")
            wrapper.classList.add("last-in-group");
        if (position === "single")
            wrapper.classList.add("single-in-group");
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
        avatar.innerHTML = renderIconMarkup(config.botIcon, "🤖");
        typingGroup.appendChild(avatar);
        const typingMessage = document.createElement("div");
        typingMessage.className = "cw-msg assistant";
        typingMessage.innerHTML = `<div class="cw-bubble cw-typing">${config.typingMessage || "● ●"}</div>`;
        typingGroup.appendChild(typingMessage);
        return typingGroup;
    };
    const renderAll = (messages) => {
        body.innerHTML = "";
        const groups = groupMessages(messages);
        groups.forEach((group) => {
            const groupContainer = document.createElement("div");
            groupContainer.className = `cw-message-group ${group[0].role}`;
            if (group[0].role === "assistant") {
                const avatar = document.createElement("div");
                avatar.className = "cw-bot-avatar";
                avatar.innerHTML = renderIconMarkup(config.botIcon, "🤖");
                groupContainer.appendChild(avatar);
            }
            group.forEach((message, index) => {
                let position;
                if (group.length === 1) {
                    position = "single";
                }
                else if (index === 0) {
                    position = "first";
                }
                else if (index === group.length - 1) {
                    position = "last";
                }
                else {
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

function attachPhonePicker(options) {
    const countryPicker = options.container.querySelector(".cw-country-picker");
    const countryDropdown = options.container.querySelector(".cw-country-dropdown");
    if (!countryPicker || !countryDropdown) {
        return null;
    }
    const positionDropdown = () => {
        const pickerRect = countryPicker.getBoundingClientRect();
        const dropdownHeight = 320;
        const spaceAbove = pickerRect.top;
        const spaceBelow = window.innerHeight - pickerRect.bottom;
        const openAbove = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;
        if (openAbove) {
            countryDropdown.style.bottom = `${window.innerHeight - pickerRect.top + 8}px`;
            countryDropdown.style.top = "auto";
        }
        else {
            countryDropdown.style.top = `${pickerRect.bottom + 8}px`;
            countryDropdown.style.bottom = "auto";
        }
        countryDropdown.style.left = `${pickerRect.left}px`;
        countryDropdown.style.minWidth = `${Math.max(360, pickerRect.width)}px`;
    };
    const closeDropdown = () => {
        countryDropdown.classList.remove("open");
        countryPicker.classList.remove("open");
    };
    const handlePickerClick = (event) => {
        event.stopPropagation();
        const isOpen = countryDropdown.classList.contains("open");
        if (!isOpen) {
            positionDropdown();
        }
        countryDropdown.classList.toggle("open");
        countryPicker.classList.toggle("open");
    };
    const countryItems = Array.from(countryDropdown.querySelectorAll(".cw-country-item"));
    const handleItemClick = (item) => (event) => {
        event.stopPropagation();
        const dialCode = item.getAttribute("data-code") || options.defaultSelection.dialCode;
        const countryCode = item.getAttribute("data-country-code") ||
            options.defaultSelection.countryCode;
        const codeSpan = countryPicker.querySelector(".cw-country-code");
        const nameSpan = countryPicker.querySelector(".cw-country-name");
        if (codeSpan)
            codeSpan.textContent = dialCode;
        if (nameSpan)
            nameSpan.textContent = countryCode;
        countryItems.forEach((countryItem) => countryItem.classList.remove("selected"));
        item.classList.add("selected");
        options.onChange({
            dialCode,
            countryCode,
        });
        closeDropdown();
    };
    const itemListeners = countryItems.map((item) => {
        const listener = handleItemClick(item);
        item.addEventListener("click", listener);
        return { item, listener };
    });
    const handleDocumentClick = () => closeDropdown();
    const handleResize = () => {
        if (countryDropdown.classList.contains("open")) {
            positionDropdown();
        }
    };
    const handleScroll = () => {
        if (countryDropdown.classList.contains("open")) {
            positionDropdown();
        }
    };
    countryPicker.addEventListener("click", handlePickerClick);
    document.addEventListener("click", handleDocumentClick);
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, true);
    return {
        cleanup() {
            closeDropdown();
            countryPicker.removeEventListener("click", handlePickerClick);
            document.removeEventListener("click", handleDocumentClick);
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("scroll", handleScroll, true);
            itemListeners.forEach(({ item, listener }) => item.removeEventListener("click", listener));
        },
    };
}

const toCssValue = (value, fallback) => {
    if (value === undefined || value === null || value === "") {
        return fallback;
    }
    return typeof value === "number" ? `${value}px` : String(value);
};
const toScalarValue = (value, fallback) => {
    if (value === undefined || value === null || value === "") {
        return fallback;
    }
    return String(value);
};
const toDurationValue = (value, fallback) => {
    if (value === undefined || value === null || value === "") {
        return fallback;
    }
    return typeof value === "number" ? `${value}ms` : String(value);
};
function resolveThemeVariables(config) {
    const theme = config.theme || {};
    const colors = theme.colors || {};
    const typography = theme.typography || {};
    const layout = theme.layout || {};
    const spacing = theme.spacing || {};
    const radius = theme.radius || {};
    const shadows = theme.shadows || {};
    const buttons = theme.buttons || {};
    const fab = theme.fab || {};
    const fabWave = fab.wave || {};
    const fabStatusDot = fab.statusDot || {};
    const resolveButtonVar = (value, fallback) => toCssValue(value, fallback);
    const variables = {
        "--primary": toCssValue(colors.primary, config.primaryColor || "#8b5cf6"),
        "--accent": toCssValue(colors.secondary, config.secondaryColor || "#6366f1"),
        "--bg": toCssValue(colors.panelBackground, config.backgroundColor || "#ffffff"),
        "--radius": toCssValue(radius.panel, config.borderRadius || "16px"),
        "--font-family": toCssValue(typography.fontFamily, config.fontFamily ||
            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'),
        "--text-primary": toCssValue(colors.textPrimary, config.textColor || "#455a64"),
        "--text-secondary": toCssValue(colors.textSecondary, "#576e93"),
        "--body-bg": toCssValue(colors.bodyBackground, "#f8f9fb"),
        "--bubble-bg": toCssValue(colors.assistantBubbleBackground, "#ffffff"),
        "--bubble-text": toCssValue(colors.assistantBubbleText, config.textColor || "#455a64"),
        "--user-bubble-bg": toCssValue(colors.userBubbleBackground, colors.primary ? toCssValue(colors.primary, "#8b5cf6") : "#8b5cf6"),
        "--user-bubble-text": toCssValue(colors.userBubbleText, "#ffffff"),
        "--input-bg": toCssValue(colors.inputBackground, "#f8f9fb"),
        "--input-text": toCssValue(colors.inputText, config.textColor || "#455a64"),
        "--input-placeholder": toCssValue(colors.inputPlaceholder, "#9ca3af"),
        "--footer-bg": toCssValue(colors.footerBackground, "#ffffff"),
        "--border-color": toCssValue(colors.borderColor, "#e5e7eb"),
        "--header-bg": toCssValue(colors.headerBackground, colors.primary ? toCssValue(colors.primary, "#8b5cf6") : "#8b5cf6"),
        "--header-text": toCssValue(colors.headerText, "#ffffff"),
        "--header-subtext": toCssValue(colors.headerSubtext, "rgba(255,255,255,0.9)"),
        "--header-avatar-bg": toCssValue(colors.headerAvatarBackground, "rgba(255,255,255,0.15)"),
        "--header-action-bg": toCssValue(colors.headerActionBackground, "rgba(255,255,255,0.15)"),
        "--header-action-hover-bg": toCssValue(colors.headerActionHoverBackground, "rgba(255,255,255,0.25)"),
        "--fab-bg": toCssValue(fab.background ?? buttons.fab?.background ?? colors.fabBackground, colors.primary ? toCssValue(colors.primary, "#8b5cf6") : "#8b5cf6"),
        "--fab-text": toCssValue(fab.text ?? buttons.fab?.text ?? colors.fabText, "#ffffff"),
        "--fab-border-color": toCssValue(fab.borderColor ?? buttons.fab?.borderColor, fab.background
            ? toCssValue(fab.background, "#8b5cf6")
            : buttons.fab?.background
                ? toCssValue(buttons.fab.background, "#8b5cf6")
                : colors.fabBackground
                    ? toCssValue(colors.fabBackground, "#8b5cf6")
                    : colors.primary
                        ? toCssValue(colors.primary, "#8b5cf6")
                        : "#8b5cf6"),
        "--fab-hover-bg": resolveButtonVar(fab.hoverBackground ?? buttons.fab?.hoverBackground, toCssValue(fab.background ?? buttons.fab?.background ?? colors.fabBackground, colors.primary ? toCssValue(colors.primary, "#8b5cf6") : "#8b5cf6")),
        "--fab-hover-text": resolveButtonVar(fab.hoverText ?? buttons.fab?.hoverText, toCssValue(fab.text ?? buttons.fab?.text ?? colors.fabText, "#ffffff")),
        "--fab-hover-border-color": resolveButtonVar(fab.hoverBorderColor ?? buttons.fab?.hoverBorderColor, toCssValue(fab.borderColor ?? buttons.fab?.borderColor, fab.background
            ? toCssValue(fab.background, "#8b5cf6")
            : buttons.fab?.background
                ? toCssValue(buttons.fab.background, "#8b5cf6")
                : colors.fabBackground
                    ? toCssValue(colors.fabBackground, "#8b5cf6")
                    : colors.primary
                        ? toCssValue(colors.primary, "#8b5cf6")
                        : "#8b5cf6")),
        "--fab-icon-size": toCssValue(fab.iconSize, "24px"),
        "--fab-icon-color": toCssValue(fab.iconColor, toCssValue(fab.text ?? buttons.fab?.text ?? colors.fabText, "#ffffff")),
        "--fab-icon-bg": toCssValue(fab.iconBackground, "transparent"),
        "--fab-icon-padding": toCssValue(fab.iconPadding, "0px"),
        "--fab-icon-radius": toCssValue(fab.iconRadius, "0px"),
        "--fab-wave-color": toCssValue(fabWave.color ??
            fab.background ??
            buttons.fab?.background ??
            colors.fabBackground, colors.primary ? toCssValue(colors.primary, "#8b5cf6") : "#8b5cf6"),
        "--fab-wave-opacity": toScalarValue(fabWave.opacity, "0.7"),
        "--fab-wave-duration": toDurationValue(fabWave.duration, "1.3s"),
        "--fab-status-dot-size": toCssValue(fabStatusDot.size, "16px"),
        "--fab-status-dot-top": toCssValue(fabStatusDot.top, "0px"),
        "--fab-status-dot-left": toCssValue(fabStatusDot.left, "0px"),
        "--fab-status-dot-online": toCssValue(fabStatusDot.onlineColor, "#22c55e"),
        "--fab-status-dot-offline": toCssValue(fabStatusDot.offlineColor, "#ef4444"),
        "--fab-status-dot-border-color": toCssValue(fabStatusDot.borderColor, "transparent"),
        "--fab-status-dot-border-width": toCssValue(fabStatusDot.borderWidth, "0px"),
        "--fab-status-dot-shadow": toCssValue(fabStatusDot.shadow, "0 1px 3px rgba(44, 44, 44, 0.13)"),
        "--option-bg": toCssValue(colors.optionBackground, colors.primary ? toCssValue(colors.primary, "#8b5cf6") : "#8b5cf6"),
        "--option-text": toCssValue(colors.optionText, "#ffffff"),
        "--menu-bg": toCssValue(colors.menuBackground, "#ffffff"),
        "--menu-text": toCssValue(colors.menuText, "#455a64"),
        "--menu-border-color": toCssValue(colors.menuBorderColor, "#e5e7eb"),
        "--send-button-bg": toCssValue(buttons.send?.background ?? colors.sendButtonBackground, colors.primary ? toCssValue(colors.primary, "#8b5cf6") : "#8b5cf6"),
        "--send-button-text": toCssValue(buttons.send?.text ?? colors.sendButtonText, "#ffffff"),
        "--send-button-border": toCssValue(buttons.send?.borderColor, "transparent"),
        "--send-button-hover-bg": resolveButtonVar(buttons.send?.hoverBackground, toCssValue(buttons.send?.background ?? colors.sendButtonBackground, colors.primary ? toCssValue(colors.primary, "#8b5cf6") : "#8b5cf6")),
        "--send-button-hover-text": resolveButtonVar(buttons.send?.hoverText, toCssValue(buttons.send?.text ?? colors.sendButtonText, "#ffffff")),
        "--send-button-hover-border": resolveButtonVar(buttons.send?.hoverBorderColor, toCssValue(buttons.send?.borderColor, "transparent")),
        "--send-button-disabled-bg": toCssValue(buttons.send?.disabledBackground ?? colors.sendButtonDisabledBackground, "#d1d5db"),
        "--send-button-disabled-text": toCssValue(buttons.send?.disabledText, "#ffffff"),
        "--send-button-disabled-border": toCssValue(buttons.send?.disabledBorderColor, "transparent"),
        "--modal-bg": toCssValue(colors.modalBackground, "#ffffff"),
        "--modal-title-text": toCssValue(colors.modalTitleText, config.textColor || "#455a64"),
        "--modal-text": toCssValue(colors.modalText, "#576e93"),
        "--overlay-bg": toCssValue(colors.overlayBackground, "rgba(0,0,0,0.6)"),
        "--reset-button-bg": toCssValue(buttons.modalReset?.background ?? colors.resetButtonBackground, "#000000"),
        "--reset-button-text": toCssValue(buttons.modalReset?.text ?? colors.resetButtonText, "#ffffff"),
        "--reset-button-border": toCssValue(buttons.modalReset?.borderColor ?? colors.resetButtonBorder, "#000000"),
        "--reset-button-hover-bg": resolveButtonVar(buttons.modalReset?.hoverBackground, toCssValue(buttons.modalReset?.background ?? colors.resetButtonBackground, "#000000")),
        "--reset-button-hover-text": resolveButtonVar(buttons.modalReset?.hoverText, toCssValue(buttons.modalReset?.text ?? colors.resetButtonText, "#ffffff")),
        "--reset-button-hover-border": resolveButtonVar(buttons.modalReset?.hoverBorderColor, toCssValue(buttons.modalReset?.borderColor ?? colors.resetButtonBorder, "#000000")),
        "--cancel-button-bg": toCssValue(buttons.modalCancel?.background ?? colors.cancelButtonBackground, "#ffffff"),
        "--cancel-button-text": toCssValue(buttons.modalCancel?.text ?? colors.cancelButtonText, config.textColor || "#455a64"),
        "--cancel-button-border": toCssValue(buttons.modalCancel?.borderColor ?? colors.cancelButtonBorder, "#d1d5db"),
        "--cancel-button-hover-bg": resolveButtonVar(buttons.modalCancel?.hoverBackground, toCssValue(buttons.modalCancel?.background ?? colors.cancelButtonBackground, "#ffffff")),
        "--cancel-button-hover-text": resolveButtonVar(buttons.modalCancel?.hoverText, toCssValue(buttons.modalCancel?.text ?? colors.cancelButtonText, config.textColor || "#455a64")),
        "--cancel-button-hover-border": resolveButtonVar(buttons.modalCancel?.hoverBorderColor, toCssValue(buttons.modalCancel?.borderColor ?? colors.cancelButtonBorder, "#d1d5db")),
        "--header-close-bg": toCssValue(buttons.close?.background ?? colors.headerActionBackground, "rgba(255,255,255,0.15)"),
        "--header-close-text": toCssValue(buttons.close?.text ?? colors.headerText, "#ffffff"),
        "--header-close-border": toCssValue(buttons.close?.borderColor, "transparent"),
        "--header-close-hover-bg": resolveButtonVar(buttons.close?.hoverBackground, toCssValue(buttons.close?.background ?? colors.headerActionHoverBackground, "rgba(255,255,255,0.25)")),
        "--header-close-hover-text": resolveButtonVar(buttons.close?.hoverText, toCssValue(buttons.close?.text ?? colors.headerText, "#ffffff")),
        "--header-close-hover-border": resolveButtonVar(buttons.close?.hoverBorderColor, toCssValue(buttons.close?.borderColor, "transparent")),
        "--header-reset-bg": toCssValue(buttons.headerReset?.background ?? colors.headerActionBackground, "rgba(255,255,255,0.15)"),
        "--header-reset-text": toCssValue(buttons.headerReset?.text ?? colors.headerText, "#ffffff"),
        "--header-reset-border": toCssValue(buttons.headerReset?.borderColor, "transparent"),
        "--header-reset-hover-bg": resolveButtonVar(buttons.headerReset?.hoverBackground, toCssValue(buttons.headerReset?.background ?? colors.headerActionHoverBackground, "rgba(255,255,255,0.25)")),
        "--header-reset-hover-text": resolveButtonVar(buttons.headerReset?.hoverText, toCssValue(buttons.headerReset?.text ?? colors.headerText, "#ffffff")),
        "--header-reset-hover-border": resolveButtonVar(buttons.headerReset?.hoverBorderColor, toCssValue(buttons.headerReset?.borderColor, "transparent")),
        "--menu-toggle-bg": toCssValue(buttons.menuToggle?.background, "transparent"),
        "--menu-toggle-text": toCssValue(buttons.menuToggle?.text ?? colors.menuText, "#455a64"),
        "--menu-toggle-border": toCssValue(buttons.menuToggle?.borderColor, "transparent"),
        "--menu-toggle-hover-bg": resolveButtonVar(buttons.menuToggle?.hoverBackground, "rgba(0,0,0,0.06)"),
        "--menu-toggle-hover-text": resolveButtonVar(buttons.menuToggle?.hoverText, toCssValue(buttons.menuToggle?.text ?? colors.menuText, "#455a64")),
        "--menu-toggle-hover-border": resolveButtonVar(buttons.menuToggle?.hoverBorderColor, toCssValue(buttons.menuToggle?.borderColor, "transparent")),
        "--multi-confirm-bg": toCssValue(buttons.multiConfirm?.background, "transparent"),
        "--multi-confirm-text": toCssValue(buttons.multiConfirm?.text, toCssValue(colors.primary, "#8b5cf6")),
        "--multi-confirm-border": toCssValue(buttons.multiConfirm?.borderColor, toCssValue(colors.primary, "#8b5cf6")),
        "--multi-confirm-hover-bg": resolveButtonVar(buttons.multiConfirm?.hoverBackground, toCssValue(colors.primary, "#8b5cf6")),
        "--multi-confirm-hover-text": resolveButtonVar(buttons.multiConfirm?.hoverText, "#ffffff"),
        "--multi-confirm-hover-border": resolveButtonVar(buttons.multiConfirm?.hoverBorderColor, toCssValue(colors.primary, "#8b5cf6")),
        "--multi-confirm-disabled-bg": toCssValue(buttons.multiConfirm?.disabledBackground, "transparent"),
        "--multi-confirm-disabled-text": toCssValue(buttons.multiConfirm?.disabledText, toCssValue(colors.primary, "#8b5cf6")),
        "--multi-confirm-disabled-border": toCssValue(buttons.multiConfirm?.disabledBorderColor, toCssValue(colors.primary, "#8b5cf6")),
        "--success-color": toCssValue(colors.success, "#22c55e"),
        "--error-color": toCssValue(colors.error, "#ef4444"),
        "--warning-color": toCssValue(colors.warning, "#f59e0b"),
        "--scrollbar-thumb": toCssValue(colors.scrollbarThumb, "rgba(139,92,246,0.2)"),
        "--scrollbar-thumb-hover": toCssValue(colors.scrollbarThumbHover, "rgba(139,92,246,0.3)"),
        "--panel-width": toCssValue(layout.panelWidth, "380px"),
        "--panel-height": toCssValue(layout.panelHeight, "650px"),
        "--panel-max-width": toCssValue(layout.panelMaxWidth, "calc(100vw - 40px)"),
        "--panel-max-height": toCssValue(layout.panelMaxHeight, "85vh"),
        "--mobile-panel-width": toCssValue(layout.mobilePanelWidth, "92%"),
        "--mobile-panel-height": toCssValue(layout.mobilePanelHeight, "92vh"),
        "--mobile-panel-max-width": toCssValue(layout.mobilePanelMaxWidth, "92%"),
        "--mobile-panel-max-height": toCssValue(layout.mobilePanelMaxHeight, "92vh"),
        "--mobile-panel-radius": toCssValue(radius.panel, config.borderRadius || "16px"),
        "--fab-size": toCssValue(fab.size ?? layout.fabSize, "56px"),
        "--mobile-fab-size": toCssValue(fab.mobileSize ?? layout.mobileFabSize, "54px"),
        "--fab-wave-size": toCssValue(fabWave.size ?? layout.fabWaveSize, "64px"),
        "--fab-border-width": toCssValue(fab.borderWidth ?? layout.fabBorderWidth, "3px"),
        "--header-avatar-size": toCssValue(layout.headerAvatarSize, "38px"),
        "--header-action-size": toCssValue(layout.headerActionSize, "32px"),
        "--bot-avatar-size": toCssValue(layout.botAvatarSize, "22px"),
        "--send-button-size": toCssValue(layout.sendButtonSize, "32px"),
        "--menu-toggle-size": toCssValue(layout.menuToggleSize, "32px"),
        "--menu-width": toCssValue(layout.menuWidth, "280px"),
        "--country-dropdown-width": toCssValue(layout.countryDropdownWidth, "360px"),
        "--modal-width": toCssValue(layout.modalWidth, "300px"),
        "--message-max-width": toCssValue(layout.messageMaxWidth, "80%"),
        "--mobile-message-max-width": toCssValue(layout.mobileMessageMaxWidth, "85%"),
        "--option-min-width": toCssValue(layout.optionMinWidth, "30ch"),
        "--header-padding": toCssValue(spacing.headerPadding, "12px 16px"),
        "--body-padding": toCssValue(spacing.bodyPadding, "16px"),
        "--mobile-body-padding": toCssValue(spacing.mobileBodyPadding, "14px"),
        "--footer-padding": toCssValue(spacing.footerPadding, "12px 14px"),
        "--bubble-padding": toCssValue(spacing.bubblePadding, "12px 16px"),
        "--option-padding": toCssValue(spacing.optionPadding, "8px"),
        "--input-padding-x": toCssValue(spacing.inputPaddingX, "12px"),
        "--menu-padding": toCssValue(spacing.menuPadding, "15px"),
        "--menu-item-padding": toCssValue(spacing.menuItemPadding, "10px"),
        "--modal-padding": toCssValue(spacing.modalPadding, "24px"),
        "--country-picker-padding": toCssValue(spacing.countryPickerPadding, "8px 10px"),
        "--country-item-padding": toCssValue(spacing.countryItemPadding, "10px 14px"),
        "--header-gap": toCssValue(spacing.headerGap, "12px"),
        "--body-gap": toCssValue(spacing.bodyGap, "8px"),
        "--message-gap": toCssValue(spacing.messageGap, "4px"),
        "--option-gap": toCssValue(spacing.optionGap, "8px"),
        "--panel-radius": toCssValue(radius.panel, config.borderRadius || "16px"),
        "--fab-radius": toCssValue(fab.radius ?? radius.fab, "50%"),
        "--bubble-radius": toCssValue(radius.bubble, "12px"),
        "--bubble-tail-radius": toCssValue(radius.bubbleTail, "4px"),
        "--input-radius": toCssValue(radius.input, "8px"),
        "--button-radius": toCssValue(radius.button, "10px"),
        "--option-radius": toCssValue(radius.option, "6px"),
        "--menu-radius": toCssValue(radius.menu, "6px"),
        "--modal-radius": toCssValue(radius.modal, "12px"),
        "--header-action-radius": toCssValue(radius.headerAction, "6px"),
        "--shadow": toCssValue(shadows.panel, "0 4px 20px rgba(0, 0, 0, 0.08)"),
        "--header-shadow": toCssValue(shadows.header, "0 2px 8px rgba(0, 0, 0, 0.06)"),
        "--fab-shadow": toCssValue(fab.shadow ?? shadows.fab, "0 4px 16px rgba(139, 92, 246, 0.4)"),
        "--fab-hover-shadow": toCssValue(fab.hoverShadow ?? shadows.fabHover, "0 6px 20px rgba(139, 92, 246, 0.5)"),
        "--assistant-bubble-shadow": toCssValue(shadows.assistantBubble, "0 1px 4px rgba(0, 0, 0, 0.04)"),
        "--user-bubble-shadow": toCssValue(shadows.userBubble, "0 2px 8px rgba(139, 92, 246, 0.25)"),
        "--option-shadow": toCssValue(shadows.option, "0 2px 6px rgba(139, 92, 246, 0.2)"),
        "--option-hover-shadow": toCssValue(shadows.optionHover, "0 4px 12px rgba(139, 92, 246, 0.3)"),
        "--input-shadow": toCssValue(shadows.input, "0 1px 3px rgba(0, 0, 0, 0.04)"),
        "--input-focus-shadow": toCssValue(shadows.inputFocus, "0 0 0 3px rgba(139, 92, 246, 0.08)"),
        "--send-button-shadow": toCssValue(shadows.sendButton, "0 2px 6px rgba(139, 92, 246, 0.25)"),
        "--menu-shadow": toCssValue(shadows.menu, "0 3px 20px rgba(21, 38, 194, 0.3)"),
        "--dropdown-shadow": toCssValue(shadows.dropdown, "0 10px 30px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.06)"),
        "--modal-shadow": toCssValue(shadows.modal, "0 10px 30px rgba(0, 0, 0, 0.2)"),
        "--title-size": toCssValue(typography.titleSize, "14px"),
        "--subtitle-size": toCssValue(typography.subtitleSize, "14px"),
        "--message-size": toCssValue(typography.messageSize, "13px"),
        "--input-size": toCssValue(typography.inputSize, "16px"),
        "--option-size": toCssValue(typography.optionSize, "13px"),
        "--caption-size": toCssValue(typography.captionSize, "12px"),
        "--title-weight": toCssValue(typography.titleWeight, "600"),
        "--subtitle-weight": toCssValue(typography.subtitleWeight, "500"),
        "--message-weight": toCssValue(typography.messageWeight, "600"),
        "--line-height": toCssValue(typography.lineHeight, "1.46"),
    };
    Object.entries(theme.variables || {}).forEach(([key, value]) => {
        const normalizedKey = key.startsWith("--") ? key : `--${key}`;
        variables[normalizedKey] = toCssValue(value, "");
    });
    return variables;
}
function buildThemeVariableDeclarations(config) {
    return Object.entries(resolveThemeVariables(config))
        .map(([key, value]) => `${key}: ${value};`)
        .join("\n        ");
}
function applyThemeVariables(element, config) {
    const variables = resolveThemeVariables(config);
    Object.entries(variables).forEach(([key, value]) => {
        element.style.setProperty(key, value);
    });
}
function resolveFabIcon(config) {
    return config.theme?.fab?.icon ?? config.chatIcon;
}
function shouldShowFabWave(config) {
    return config.theme?.fab?.wave?.enabled !== false;
}
function shouldShowFabStatusDot(config) {
    return config.theme?.fab?.statusDot?.enabled !== false;
}

const COUNTRY_CODES = [
    {
        name: "Israel",
        dial_code: "+972",
        code: "IL",
    },
    {
        name: "Afghanistan",
        dial_code: "+93",
        code: "AF",
    },
    {
        name: "Albania",
        dial_code: "+355",
        code: "AL",
    },
    {
        name: "Algeria",
        dial_code: "+213",
        code: "DZ",
    },
    {
        name: "AmericanSamoa",
        dial_code: "+1 684",
        code: "AS",
    },
    {
        name: "Andorra",
        dial_code: "+376",
        code: "AD",
    },
    {
        name: "Angola",
        dial_code: "+244",
        code: "AO",
    },
    {
        name: "Anguilla",
        dial_code: "+1 264",
        code: "AI",
    },
    {
        name: "Antigua and Barbuda",
        dial_code: "+1268",
        code: "AG",
    },
    {
        name: "Argentina",
        dial_code: "+54",
        code: "AR",
    },
    {
        name: "Armenia",
        dial_code: "+374",
        code: "AM",
    },
    {
        name: "Aruba",
        dial_code: "+297",
        code: "AW",
    },
    {
        name: "Australia",
        dial_code: "+61",
        code: "AU",
    },
    {
        name: "Austria",
        dial_code: "+43",
        code: "AT",
    },
    {
        name: "Azerbaijan",
        dial_code: "+994",
        code: "AZ",
    },
    {
        name: "Bahamas",
        dial_code: "+1 242",
        code: "BS",
    },
    {
        name: "Bahrain",
        dial_code: "+973",
        code: "BH",
    },
    {
        name: "Bangladesh",
        dial_code: "+880",
        code: "BD",
    },
    {
        name: "Barbados",
        dial_code: "+1 246",
        code: "BB",
    },
    {
        name: "Belarus",
        dial_code: "+375",
        code: "BY",
    },
    {
        name: "Belgium",
        dial_code: "+32",
        code: "BE",
    },
    {
        name: "Belize",
        dial_code: "+501",
        code: "BZ",
    },
    {
        name: "Benin",
        dial_code: "+229",
        code: "BJ",
    },
    {
        name: "Bermuda",
        dial_code: "+1 441",
        code: "BM",
    },
    {
        name: "Bhutan",
        dial_code: "+975",
        code: "BT",
    },
    {
        name: "Bosnia and Herzegovina",
        dial_code: "+387",
        code: "BA",
    },
    {
        name: "Botswana",
        dial_code: "+267",
        code: "BW",
    },
    {
        name: "Brazil",
        dial_code: "+55",
        code: "BR",
    },
    {
        name: "British Indian Ocean Territory",
        dial_code: "+246",
        code: "IO",
    },
    {
        name: "Bulgaria",
        dial_code: "+359",
        code: "BG",
    },
    {
        name: "Burkina Faso",
        dial_code: "+226",
        code: "BF",
    },
    {
        name: "Burundi",
        dial_code: "+257",
        code: "BI",
    },
    {
        name: "Cambodia",
        dial_code: "+855",
        code: "KH",
    },
    {
        name: "Cameroon",
        dial_code: "+237",
        code: "CM",
    },
    {
        name: "Canada",
        dial_code: "+1",
        code: "CA",
    },
    {
        name: "Cape Verde",
        dial_code: "+238",
        code: "CV",
    },
    {
        name: "Cayman Islands",
        dial_code: "+ 345",
        code: "KY",
    },
    {
        name: "Central African Republic",
        dial_code: "+236",
        code: "CF",
    },
    {
        name: "Chad",
        dial_code: "+235",
        code: "TD",
    },
    {
        name: "Chile",
        dial_code: "+56",
        code: "CL",
    },
    {
        name: "China",
        dial_code: "+86",
        code: "CN",
    },
    {
        name: "Christmas Island",
        dial_code: "+61",
        code: "CX",
    },
    {
        name: "Colombia",
        dial_code: "+57",
        code: "CO",
    },
    {
        name: "Comoros",
        dial_code: "+269",
        code: "KM",
    },
    {
        name: "Congo",
        dial_code: "+242",
        code: "CG",
    },
    {
        name: "Cook Islands",
        dial_code: "+682",
        code: "CK",
    },
    {
        name: "Costa Rica",
        dial_code: "+506",
        code: "CR",
    },
    {
        name: "Croatia",
        dial_code: "+385",
        code: "HR",
    },
    {
        name: "Cuba",
        dial_code: "+53",
        code: "CU",
    },
    {
        name: "Cyprus",
        dial_code: "+537",
        code: "CY",
    },
    {
        name: "Czech Republic",
        dial_code: "+420",
        code: "CZ",
    },
    {
        name: "Denmark",
        dial_code: "+45",
        code: "DK",
    },
    {
        name: "Djibouti",
        dial_code: "+253",
        code: "DJ",
    },
    {
        name: "Dominica",
        dial_code: "+1 767",
        code: "DM",
    },
    {
        name: "Dominican Republic",
        dial_code: "+1 849",
        code: "DO",
    },
    {
        name: "Ecuador",
        dial_code: "+593",
        code: "EC",
    },
    {
        name: "Egypt",
        dial_code: "+20",
        code: "EG",
    },
    {
        name: "El Salvador",
        dial_code: "+503",
        code: "SV",
    },
    {
        name: "Equatorial Guinea",
        dial_code: "+240",
        code: "GQ",
    },
    {
        name: "Eritrea",
        dial_code: "+291",
        code: "ER",
    },
    {
        name: "Estonia",
        dial_code: "+372",
        code: "EE",
    },
    {
        name: "Ethiopia",
        dial_code: "+251",
        code: "ET",
    },
    {
        name: "Faroe Islands",
        dial_code: "+298",
        code: "FO",
    },
    {
        name: "Fiji",
        dial_code: "+679",
        code: "FJ",
    },
    {
        name: "Finland",
        dial_code: "+358",
        code: "FI",
    },
    {
        name: "France",
        dial_code: "+33",
        code: "FR",
    },
    {
        name: "French Guiana",
        dial_code: "+594",
        code: "GF",
    },
    {
        name: "French Polynesia",
        dial_code: "+689",
        code: "PF",
    },
    {
        name: "Gabon",
        dial_code: "+241",
        code: "GA",
    },
    {
        name: "Gambia",
        dial_code: "+220",
        code: "GM",
    },
    {
        name: "Georgia",
        dial_code: "+995",
        code: "GE",
    },
    {
        name: "Germany",
        dial_code: "+49",
        code: "DE",
    },
    {
        name: "Ghana",
        dial_code: "+233",
        code: "GH",
    },
    {
        name: "Gibraltar",
        dial_code: "+350",
        code: "GI",
    },
    {
        name: "Greece",
        dial_code: "+30",
        code: "GR",
    },
    {
        name: "Greenland",
        dial_code: "+299",
        code: "GL",
    },
    {
        name: "Grenada",
        dial_code: "+1 473",
        code: "GD",
    },
    {
        name: "Guadeloupe",
        dial_code: "+590",
        code: "GP",
    },
    {
        name: "Guam",
        dial_code: "+1 671",
        code: "GU",
    },
    {
        name: "Guatemala",
        dial_code: "+502",
        code: "GT",
    },
    {
        name: "Guinea",
        dial_code: "+224",
        code: "GN",
    },
    {
        name: "Guinea-Bissau",
        dial_code: "+245",
        code: "GW",
    },
    {
        name: "Guyana",
        dial_code: "+595",
        code: "GY",
    },
    {
        name: "Haiti",
        dial_code: "+509",
        code: "HT",
    },
    {
        name: "Honduras",
        dial_code: "+504",
        code: "HN",
    },
    {
        name: "Hungary",
        dial_code: "+36",
        code: "HU",
    },
    {
        name: "Iceland",
        dial_code: "+354",
        code: "IS",
    },
    {
        name: "India",
        dial_code: "+91",
        code: "IN",
    },
    {
        name: "Indonesia",
        dial_code: "+62",
        code: "ID",
    },
    {
        name: "Iraq",
        dial_code: "+964",
        code: "IQ",
    },
    {
        name: "Ireland",
        dial_code: "+353",
        code: "IE",
    },
    {
        name: "Israel",
        dial_code: "+972",
        code: "IL",
    },
    {
        name: "Italy",
        dial_code: "+33",
        code: "IT",
    },
    {
        name: "Jamaica",
        dial_code: "+1 876",
        code: "JM",
    },
    {
        name: "Japan",
        dial_code: "+81",
        code: "JP",
    },
    {
        name: "Jordan",
        dial_code: "+962",
        code: "JO",
    },
    {
        name: "Kazakhstan",
        dial_code: "+7 7",
        code: "KZ",
    },
    {
        name: "Kenya",
        dial_code: "+254",
        code: "KE",
    },
    {
        name: "Kiribati",
        dial_code: "+686",
        code: "KI",
    },
    {
        name: "Kuwait",
        dial_code: "+965",
        code: "KW",
    },
    {
        name: "Kyrgyzstan",
        dial_code: "+996",
        code: "KG",
    },
    {
        name: "Latvia",
        dial_code: "+371",
        code: "LV",
    },
    {
        name: "Lebanon",
        dial_code: "+961",
        code: "LB",
    },
    {
        name: "Lesotho",
        dial_code: "+266",
        code: "LS",
    },
    {
        name: "Liberia",
        dial_code: "+231",
        code: "LR",
    },
    {
        name: "Liechtenstein",
        dial_code: "+423",
        code: "LI",
    },
    {
        name: "Lithuania",
        dial_code: "+370",
        code: "LT",
    },
    {
        name: "Luxembourg",
        dial_code: "+352",
        code: "LU",
    },
    {
        name: "Madagascar",
        dial_code: "+261",
        code: "MG",
    },
    {
        name: "Malawi",
        dial_code: "+265",
        code: "MW",
    },
    {
        name: "Malaysia",
        dial_code: "+60",
        code: "MY",
    },
    {
        name: "Maldives",
        dial_code: "+960",
        code: "MV",
    },
    {
        name: "Mali",
        dial_code: "+223",
        code: "ML",
    },
    {
        name: "Malta",
        dial_code: "+356",
        code: "MT",
    },
    {
        name: "Marshall Islands",
        dial_code: "+692",
        code: "MH",
    },
    {
        name: "Martinique",
        dial_code: "+596",
        code: "MQ",
    },
    {
        name: "Mauritania",
        dial_code: "+222",
        code: "MR",
    },
    {
        name: "Mauritius",
        dial_code: "+230",
        code: "MU",
    },
    {
        name: "Mayotte",
        dial_code: "+262",
        code: "YT",
    },
    {
        name: "Mexico",
        dial_code: "+52",
        code: "MX",
    },
    {
        name: "Monaco",
        dial_code: "+377",
        code: "MC",
    },
    {
        name: "Mongolia",
        dial_code: "+976",
        code: "MN",
    },
    {
        name: "Montenegro",
        dial_code: "+382",
        code: "ME",
    },
    {
        name: "Montserrat",
        dial_code: "+1664",
        code: "MS",
    },
    {
        name: "Morocco",
        dial_code: "+212",
        code: "MA",
    },
    {
        name: "Myanmar",
        dial_code: "+95",
        code: "MM",
    },
    {
        name: "Namibia",
        dial_code: "+264",
        code: "NA",
    },
    {
        name: "Nauru",
        dial_code: "+674",
        code: "NR",
    },
    {
        name: "Nepal",
        dial_code: "+977",
        code: "NP",
    },
    {
        name: "Netherlands",
        dial_code: "+31",
        code: "NL",
    },
    {
        name: "Netherlands Antilles",
        dial_code: "+599",
        code: "AN",
    },
    {
        name: "New Caledonia",
        dial_code: "+687",
        code: "NC",
    },
    {
        name: "New Zealand",
        dial_code: "+64",
        code: "NZ",
    },
    {
        name: "Nicaragua",
        dial_code: "+505",
        code: "NI",
    },
    {
        name: "Niger",
        dial_code: "+227",
        code: "NE",
    },
    {
        name: "Nigeria",
        dial_code: "+234",
        code: "NG",
    },
    {
        name: "Niue",
        dial_code: "+683",
        code: "NU",
    },
    {
        name: "Norfolk Island",
        dial_code: "+672",
        code: "NF",
    },
    {
        name: "Northern Mariana Islands",
        dial_code: "+1 670",
        code: "MP",
    },
    {
        name: "Norway",
        dial_code: "+47",
        code: "NO",
    },
    {
        name: "Oman",
        dial_code: "+968",
        code: "OM",
    },
    {
        name: "Pakistan",
        dial_code: "+92",
        code: "PK",
    },
    {
        name: "Palau",
        dial_code: "+680",
        code: "PW",
    },
    {
        name: "Panama",
        dial_code: "+507",
        code: "PA",
    },
    {
        name: "Papua New Guinea",
        dial_code: "+675",
        code: "PG",
    },
    {
        name: "Paraguay",
        dial_code: "+595",
        code: "PY",
    },
    {
        name: "Peru",
        dial_code: "+51",
        code: "PE",
    },
    {
        name: "Philippines",
        dial_code: "+63",
        code: "PH",
    },
    {
        name: "Poland",
        dial_code: "+48",
        code: "PL",
    },
    {
        name: "Portugal",
        dial_code: "+351",
        code: "PT",
    },
    {
        name: "Puerto Rico",
        dial_code: "+1 933",
        code: "PR",
    },
    {
        name: "Qatar",
        dial_code: "+974",
        code: "QA",
    },
    {
        name: "Romania",
        dial_code: "+40",
        code: "RO",
    },
    {
        name: "Rwanda",
        dial_code: "+250",
        code: "RW",
    },
    {
        name: "Samoa",
        dial_code: "+685",
        code: "WS",
    },
    {
        name: "San Marino",
        dial_code: "+378",
        code: "SM",
    },
    {
        name: "Saudi Arabia",
        dial_code: "+966",
        code: "SA",
    },
    {
        name: "Senegal",
        dial_code: "+221",
        code: "SN",
    },
    {
        name: "Serbia",
        dial_code: "+381",
        code: "RS",
    },
    {
        name: "Seychelles",
        dial_code: "+248",
        code: "SC",
    },
    {
        name: "Sierra Leone",
        dial_code: "+232",
        code: "SL",
    },
    {
        name: "Singapore",
        dial_code: "+65",
        code: "SG",
    },
    {
        name: "Slovakia",
        dial_code: "+421",
        code: "SK",
    },
    {
        name: "Slovenia",
        dial_code: "+386",
        code: "SI",
    },
    {
        name: "Solomon Islands",
        dial_code: "+677",
        code: "SB",
    },
    {
        name: "South Africa",
        dial_code: "+27",
        code: "ZA",
    },
    {
        name: "South Georgia and the South Sandwich Islands",
        dial_code: "+500",
        code: "GS",
    },
    {
        name: "Spain",
        dial_code: "+34",
        code: "ES",
    },
    {
        name: "Sri Lanka",
        dial_code: "+94",
        code: "LK",
    },
    {
        name: "Sudan",
        dial_code: "+249",
        code: "SD",
    },
    {
        name: "Suriname",
        dial_code: "+597",
        code: "SR",
    },
    {
        name: "Swaziland",
        dial_code: "+268",
        code: "SZ",
    },
    {
        name: "Sweden",
        dial_code: "+46",
        code: "SE",
    },
    {
        name: "Switzerland",
        dial_code: "+41",
        code: "CH",
    },
    {
        name: "Tajikistan",
        dial_code: "+992",
        code: "TJ",
    },
    {
        name: "Thailand",
        dial_code: "+66",
        code: "TH",
    },
    {
        name: "Togo",
        dial_code: "+228",
        code: "TG",
    },
    {
        name: "Tokelau",
        dial_code: "+690",
        code: "TK",
    },
    {
        name: "Tonga",
        dial_code: "+676",
        code: "TO",
    },
    {
        name: "Trinidad and Tobago",
        dial_code: "+1 868",
        code: "TT",
    },
    {
        name: "Tunisia",
        dial_code: "+216",
        code: "TN",
    },
    {
        name: "Turkey",
        dial_code: "+90",
        code: "TR",
    },
    {
        name: "Turkmenistan",
        dial_code: "+993",
        code: "TM",
    },
    {
        name: "Turks and Caicos Islands",
        dial_code: "+1 649",
        code: "TC",
    },
    {
        name: "Tuvalu",
        dial_code: "+688",
        code: "TV",
    },
    {
        name: "Uganda",
        dial_code: "+256",
        code: "UG",
    },
    {
        name: "Ukraine",
        dial_code: "+380",
        code: "UA",
    },
    {
        name: "United Arab Emirates",
        dial_code: "+971",
        code: "UAE",
    },
    {
        name: "United Kingdom",
        dial_code: "+44",
        code: "GB",
    },
    {
        name: "United States",
        dial_code: "+1",
        code: "US",
    },
    {
        name: "Uruguay",
        dial_code: "+598",
        code: "UY",
    },
    {
        name: "Uzbekistan",
        dial_code: "+998",
        code: "UZ",
    },
    {
        name: "Vanuatu",
        dial_code: "+678",
        code: "VU",
    },
    {
        name: "Wallis and Futuna",
        dial_code: "+681",
        code: "WF",
    },
    {
        name: "Yemen",
        dial_code: "+967",
        code: "YE",
    },
    {
        name: "Zambia",
        dial_code: "+260",
        code: "ZM",
    },
    {
        name: "Zimbabwe",
        dial_code: "+263",
        code: "ZW",
    },
    {
        name: "land Islands",
        dial_code: "",
        code: "AX",
    },
    {
        name: "Antarctica",
        dial_code: null,
        code: "AQ",
    },
    {
        name: "Bolivia, Plurinational State of",
        dial_code: "+591",
        code: "BO",
    },
    {
        name: "Brunei Darussalam",
        dial_code: "+673",
        code: "BN",
    },
    {
        name: "Cocos (Keeling) Islands",
        dial_code: "+61",
        code: "CC",
    },
    {
        name: "Congo, The Democratic Republic of the",
        dial_code: "+243",
        code: "CD",
    },
    {
        name: "Cote d'Ivoire",
        dial_code: "+225",
        code: "CI",
    },
    {
        name: "Falkland Islands (Malvinas)",
        dial_code: "+500",
        code: "FK",
    },
    {
        name: "Guernsey",
        dial_code: "+44",
        code: "GG",
    },
    {
        name: "Holy See (Vatican City State)",
        dial_code: "+379",
        code: "VA",
    },
    {
        name: "Hong Kong",
        dial_code: "+852",
        code: "HK",
    },
    {
        name: "Iran, Islamic Republic of",
        dial_code: "+98",
        code: "IR",
    },
    {
        name: "Isle of Man",
        dial_code: "+44",
        code: "IM",
    },
    {
        name: "Jersey",
        dial_code: "+44",
        code: "JE",
    },
    {
        name: "Korea, Democratic People's Republic of",
        dial_code: "+850",
        code: "KP",
    },
    {
        name: "Korea, Republic of",
        dial_code: "+82",
        code: "KR",
    },
    {
        name: "Lao People's Democratic Republic",
        dial_code: "+856",
        code: "LA",
    },
    {
        name: "Libyan Arab Jamahiriya",
        dial_code: "+218",
        code: "LY",
    },
    {
        name: "Macao",
        dial_code: "+853",
        code: "MO",
    },
    {
        name: "Macedonia, The Former Yugoslav Republic of",
        dial_code: "+389",
        code: "MK",
    },
    {
        name: "Micronesia, Federated States of",
        dial_code: "+691",
        code: "FM",
    },
    {
        name: "Moldova, Republic of",
        dial_code: "+373",
        code: "MD",
    },
    {
        name: "Mozambique",
        dial_code: "+258",
        code: "MZ",
    },
    {
        name: "Palestinian Territory, Occupied",
        dial_code: "+970",
        code: "PS",
    },
    {
        name: "Pitcairn",
        dial_code: "+872",
        code: "PN",
    },
    {
        name: "R\u00e9union",
        dial_code: "+262",
        code: "RE",
    },
    {
        name: "Russia",
        dial_code: "+7",
        code: "RU",
    },
    {
        name: "Saint Barth\u00e9lemy",
        dial_code: "+590",
        code: "BL",
    },
    {
        name: "Saint Helena, Ascension and Tristan Da Cunha",
        dial_code: "+290",
        code: "SH",
    },
    {
        name: "Saint Kitts and Nevis",
        dial_code: "+1 869",
        code: "KN",
    },
    {
        name: "Saint Lucia",
        dial_code: "+1 758",
        code: "LC",
    },
    {
        name: "Saint Martin",
        dial_code: "+590",
        code: "MF",
    },
    {
        name: "Saint Pierre and Miquelon",
        dial_code: "+508",
        code: "PM",
    },
    {
        name: "Saint Vincent and the Grenadines",
        dial_code: "+1 784",
        code: "VC",
    },
    {
        name: "Sao Tome and Principe",
        dial_code: "+233",
        code: "ST",
    },
    {
        name: "Somalia",
        dial_code: "+252",
        code: "SO",
    },
    {
        name: "Svalbard and Jan Mayen",
        dial_code: "+47",
        code: "SJ",
    },
    {
        name: "Syrian Arab Republic",
        dial_code: "+963",
        code: "SY",
    },
    {
        name: "Taiwan, Province of China",
        dial_code: "+886",
        code: "TW",
    },
    {
        name: "Tanzania, United Republic of",
        dial_code: "+255",
        code: "TZ",
    },
    {
        name: "Timor-Leste",
        dial_code: "+670",
        code: "TL",
    },
    {
        name: "Venezuela, Bolivarian Republic of",
        dial_code: "+58",
        code: "VE",
    },
    {
        name: "Viet Nam",
        dial_code: "+84",
        code: "VN",
    },
    {
        name: "Virgin Islands, British",
        dial_code: "+1 284",
        code: "VG",
    },
    {
        name: "Virgin Islands, U.S.",
        dial_code: "+1 340",
        code: "VI",
    },
];

function buildUIStyles(config, state) {
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

const DEFAULT_FAB_ICON = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
function renderFabHTML(config, isOnline) {
    return `
    <span class="cw-fab-icon" aria-hidden="true">
      ${renderIconMarkup(resolveFabIcon(config), DEFAULT_FAB_ICON)}
    </span>
    ${shouldShowFabStatusDot(config)
        ? `<span class="cw-fab-status-dot ${isOnline ? "online" : "offline"}"></span>`
        : ""}
    ${shouldShowFabWave(config) ? '<div class="cw-fab-wave"></div>' : ""}
  `;
}
function resolveDefaultPhoneSelection(config) {
    const defaultPhoneCountry = COUNTRY_CODES.find((country) => country.dial_code ===
        config.inputConfig?.phoneConfig?.defaultCountryCode) ||
        COUNTRY_CODES.find((country) => country.code === config.inputConfig?.phoneConfig?.defaultCountry ||
            country.name === config.inputConfig?.phoneConfig?.defaultCountry) ||
        COUNTRY_CODES[0];
    return {
        dialCode: defaultPhoneCountry?.dial_code || "",
        countryCode: defaultPhoneCountry?.code || "",
    };
}
function renderCountryPickerHTML(selection) {
    return `
    <div class="cw-country-picker">
      <span class="cw-country-code">${selection.dialCode}</span>
      <span class="cw-country-name">${selection.countryCode}</span>
      <span class="cw-country-arrow">▼</span>
      <div class="cw-country-dropdown">
        ${COUNTRY_CODES.map((country) => `
            <div class="cw-country-item ${country.dial_code === selection.dialCode ? "selected" : ""}" 
              data-code="${country.dial_code}" 
              data-country-code="${country.code}"
              tabindex="0">
              <span class="cw-country-item-name">${country.name}</span>
              <span class="cw-country-item-dial">${country.dial_code}</span>
              <span class="cw-country-item-code">${country.code}</span>
            </div>
          `).join("")}
      </div>
    </div>
  `;
}
function renderInputHTML(config, inputType, phoneSelection) {
    return `
    <div class="cw-input ${inputType === "phone" ? "phone-input" : ""}">
      ${inputType === "phone" ? renderCountryPickerHTML(phoneSelection) : ""}
      ${renderMenuHTML(config, config.inputConfig?.menu, inputType)}
      <input 
        type="${inputType === "email" ? "email" : inputType === "phone" ? "tel" : "text"}" 
        placeholder="${config.inputConfig?.placeholder || config.placeholder || "Type your message..."}"
        aria-label="Type a message"
      />
      <button class="cw-send" aria-label="Send message" title="Send message">
        ${renderControlIcon(config, "send", "cw-control-icon cw-send-icon")}
      </button>
    </div>
  `;
}
function renderUIHTML(config, state, inputType, phoneSelection) {
    return `
    ${buildUIStyles(config, state)}
    <div class="chatbot-container" role="region" aria-label="Chat support widget">
      <button class="cw-fab" aria-label="Open chat">
        ${renderFabHTML(config, state.isOnline)}
      </button>
      <div class="cw-panel" role="dialog" aria-modal="false">
        <div class="cw-header">
          <div class="avatar">${renderIconMarkup(config.botIcon, "🤖")}</div>
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
            <button class="reset-btn" title="Reset Session">${renderControlIcon(config, "headerReset", "cw-control-icon cw-reset-icon")}</button>
            <button class="close" title="Close">${renderControlIcon(config, "close", "cw-control-icon cw-close-icon")}</button>
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

function createUI(root, config, state, handlers) {
    const currentInputType = config.inputConfig?.type || "text";
    state.currentInputType = currentInputType;
    const defaultPhoneSelection = resolveDefaultPhoneSelection(config);
    let selectedPhoneSelection = { ...defaultPhoneSelection };
    let phonePickerCleanup;
    root.innerHTML = renderUIHTML(config, state, currentInputType, selectedPhoneSelection);
    const container = root.querySelector(".chatbot-container");
    const fab = container.querySelector(".cw-fab");
    const panel = container.querySelector(".cw-panel");
    const body = container.querySelector(".cw-body");
    const closeBtn = container.querySelector(".close");
    const resetBtn = container.querySelector(".reset-btn");
    const syncBtn = container.querySelector(".sync-btn");
    const connectionDot = container.querySelector(".connection-dot");
    const connectionText = container.querySelector(".connection-text");
    let inputWrapper = container.querySelector(".cw-input");
    let input = inputWrapper.querySelector("input");
    let sendBtn = inputWrapper.querySelector(".cw-send");
    const syncControlMarkup = () => {
        resetBtn.innerHTML = renderControlIcon(config, "headerReset", "cw-control-icon cw-reset-icon");
        closeBtn.innerHTML = renderControlIcon(config, "close", "cw-control-icon cw-close-icon");
        sendBtn.innerHTML = renderControlIcon(config, "send", "cw-control-icon cw-send-icon");
        const menuToggleBtn = inputWrapper.querySelector(".menu-toggle-btn");
        if (menuToggleBtn) {
            menuToggleBtn.innerHTML = `
        ${renderControlIcon(config, "menu", "cw-control-icon menu-icon-sb menu-toggle-icon")}
        ${renderControlIcon(config, "menuClose", "cw-control-icon menu-icon-sb menu-close-icon icon-hidden")}
      `;
        }
        fab.innerHTML = renderFabHTML(config, state.isOnline);
    };
    const scrollToBottom = (instant = false) => {
        if (panel.style.display === "none")
            return;
        try {
            if (instant) {
                body.scrollTop = body.scrollHeight;
            }
            else {
                body.scrollTo({ top: body.scrollHeight, behavior: "smooth" });
            }
        }
        catch {
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
    const syncPhoneSelection = (selection) => {
        selectedPhoneSelection = selection;
    };
    const initializePhonePicker = (scope = container) => {
        phonePickerCleanup?.();
        const controller = attachPhonePicker({
            container: scope,
            defaultSelection: defaultPhoneSelection,
            onChange: syncPhoneSelection,
        });
        phonePickerCleanup = controller?.cleanup;
    };
    const syncInputRefs = (scope = container) => {
        inputWrapper = scope.querySelector(".cw-input");
        input = inputWrapper.querySelector("input");
        sendBtn = inputWrapper.querySelector(".cw-send");
    };
    const getDefaultPlaceholder = () => config.inputConfig?.placeholder ||
        config.placeholder ||
        "Type your message...";
    const setInputDisabledState = (disabled) => {
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
        if (state.inputDisabled)
            return;
        let value = input.value.trim();
        if (!value)
            return;
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
            if (state.inputDisabled)
                return;
            if (event.key === "Enter") {
                event.preventDefault();
                handleSend();
            }
            if (event.key === "Escape" && state.isOpen) {
                handlers.onClose();
            }
        });
    };
    const renderInput = (type, inputConfig) => {
        state.currentInputType = type;
        if (inputConfig) {
            config.inputConfig = { ...config.inputConfig, ...inputConfig, type };
        }
        const footer = container.querySelector(".cw-footer");
        const previousInputWrapper = footer.querySelector(".cw-input");
        const nextInputMarkup = renderInputHTML(config, type, selectedPhoneSelection);
        const temp = document.createElement("div");
        temp.innerHTML = nextInputMarkup;
        const nextInputWrapper = temp.firstElementChild;
        previousInputWrapper?.replaceWith(nextInputWrapper);
        syncInputRefs(footer);
        syncControlMarkup();
        bindInputEvents();
        attachMenuListeners(container, config.inputConfig?.menu, handlers, inputWrapper);
        if (type === "phone") {
            initializePhonePicker(inputWrapper);
        }
        else {
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
        if (existing)
            existing.remove();
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
    attachMenuListeners(container, config.inputConfig?.menu);
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
        setOpen(open) {
            state.isOpen = open;
            panel.style.display = open ? "flex" : "none";
            fab.style.display = open ? "none" : "inline-grid";
            if (open) {
                panel.offsetHeight;
            }
        },
        setTyping(isTyping, role = "assistant") {
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
            const element = root.querySelector(".chatbot-container");
            applyThemeVariables(element, config);
            syncControlMarkup();
        },
        focusInput() {
            if (!state.inputDisabled)
                input.focus();
        },
        setInputDisabled(disabled) {
            setInputDisabledState(disabled);
        },
        updateConnectionStatus(isOnline) {
            if (connectionDot && connectionText) {
                connectionDot.className = `connection-dot ${isOnline ? "" : "offline"}`;
                connectionText.textContent = isOnline ? "Online" : "Offline";
                fab.className = `cw-fab ${isOnline ? "" : "offline"}`;
            }
        },
        updateSyncStatus(status) {
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
                connectionDot.className = `connection-dot ${status === "pending"
                    ? "syncing"
                    : status === "failed"
                        ? "offline"
                        : ""}`;
            }
        },
        setInputType(type, inputConfig) {
            renderInput(type, inputConfig);
        },
    };
}

const DEFAULT_CONFIG = {
    // Appearance
    primaryColor: "#8b5cf6",
    secondaryColor: "#6366f1",
    backgroundColor: "#ffffff",
    textColor: "#333333",
    borderRadius: "16px",
    // Behavior
    position: "bottom-right",
    autoOpen: false,
    persistMessages: true,
    maxMessages: 200,
    // Content
    title: "Chat Support",
    placeholder: "Type your message...",
    welcomeMessage: "Hello! How can I help you today?",
    errorMessage: "Sorry, something went wrong. Please try again.",
    typingMessage: "Typing...",
    // Icons
    chatIcon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>`,
    botIcon: "🤖",
    userIcon: "👤",
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    // Storage
    storageKey: "chatbot-widget",
    storage: {
        strategy: "localStorage",
        namespace: "chatbot-widget",
    },
    autoOpenDelayMs: 0,
};
const STORAGE_KEY_PARTS = {
    MESSAGES: "messages",
    SESSION: "sessions",
    CONFIG: "config",
};

class StorageService {
    constructor(config) {
        this.config = config;
        this.namespace = config.namespace || "chatbot-widget";
    }
    getStorageKey(part) {
        return `${this.namespace}:${STORAGE_KEY_PARTS[part]}`;
    }
    /**
     * Save session data to localStorage
     */
    saveSession(sessionId, session) {
        try {
            const sessions = this.getAllSessions().filter((s) => s && typeof s.session_id === "string");
            const existingIndex = sessions.findIndex((s) => s.session_id === sessionId);
            if (existingIndex >= 0) {
                sessions[existingIndex] = session;
            }
            else {
                sessions.push(session);
            }
            // Keep only recent sessions (max 50)
            const maxSessions = this.config.maxSessions || 50;
            const sortedSessions = sessions
                .sort((a, b) => new Date(b.created_at || 0).getTime() -
                new Date(a.created_at || 0).getTime())
                .slice(0, maxSessions);
            localStorage.setItem(this.getStorageKey("SESSION"), JSON.stringify(sortedSessions));
        }
        catch (error) {
            console.error("Failed to save session:", error);
        }
    }
    /**
     * Get session from localStorage
     */
    getSession(sessionId) {
        try {
            const sessions = this.getAllSessions();
            if (!Array.isArray(sessions) || sessions.length === 0)
                return null;
            const safeSessions = sessions.filter((s) => s && typeof s.session_id === "string");
            return safeSessions.find((s) => s.session_id === sessionId) || null;
        }
        catch (error) {
            console.error("Failed to get session:", error);
            return null;
        }
    }
    /**
     * Get all sessions from localStorage
     */
    getAllSessions() {
        try {
            const raw = localStorage.getItem(this.getStorageKey("SESSION"));
            if (!raw)
                return [];
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed))
                return [];
            // filter null/malformed entries so callers don't get s === null
            return parsed.filter((p) => p && typeof p.session_id === "string");
        }
        catch (error) {
            console.error("Failed to get all sessions:", error);
            return [];
        }
    }
    /**
     * Save messages to localStorage
     */
    saveMessages(sessionId, messages) {
        try {
            const allMessages = this.getAllMessages();
            const maxMessages = this.config.maxMessagesPerSession;
            const truncatedMessages = typeof maxMessages === "number" && maxMessages > 0
                ? (messages || []).slice(-maxMessages)
                : messages || [];
            // normalize timestamps to ISO string
            allMessages[sessionId] = truncatedMessages.map((msg) => {
                let tsIso = new Date().toISOString();
                try {
                    if (msg.timestamp instanceof Date) {
                        tsIso = msg.timestamp.toISOString();
                    }
                    else if (typeof msg.timestamp === "string") {
                        tsIso = new Date(msg.timestamp).toISOString();
                    }
                    else if (typeof msg.created_at === "string") {
                        tsIso = new Date(msg.created_at).toISOString();
                    }
                }
                catch (e) {
                    // fallback to now
                    tsIso = new Date().toISOString();
                }
                return {
                    ...msg,
                    timestamp: tsIso,
                };
            });
            localStorage.setItem(this.getStorageKey("MESSAGES"), JSON.stringify(allMessages));
        }
        catch (error) {
            console.error("Failed to save messages:", error);
        }
    }
    /**
     * Get messages from localStorage
     */
    getMessages(sessionId) {
        try {
            const allMessages = this.getAllMessages();
            const sessionMessages = Array.isArray(allMessages[sessionId])
                ? allMessages[sessionId]
                : [];
            return sessionMessages.map((msg) => {
                // convert timestamp back to Date safely
                try {
                    return {
                        ...msg,
                        timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
                    };
                }
                catch (e) {
                    return {
                        ...msg,
                        timestamp: new Date(),
                    };
                }
            });
        }
        catch (error) {
            console.error("Failed to get messages:", error);
            return [];
        }
    }
    /**
     * Get all messages grouped by session
     */
    getAllMessages() {
        try {
            const raw = localStorage.getItem(this.getStorageKey("MESSAGES"));
            if (!raw)
                return {};
            const parsed = JSON.parse(raw);
            if (!parsed || typeof parsed !== "object")
                return {};
            // ensure each session key has an array
            const safe = {};
            Object.keys(parsed).forEach((k) => {
                if (Array.isArray(parsed[k])) {
                    safe[k] = parsed[k].filter((m) => m != null);
                }
            });
            return safe;
        }
        catch (error) {
            console.error("Failed to get all messages:", error);
            return {};
        }
    }
    /**
     * Clear session data
     */
    clearSession(sessionId) {
        try {
            // Remove from sessions
            const sessions = this.getAllSessions().filter((s) => s.session_id !== sessionId);
            localStorage.setItem(this.getStorageKey("SESSION"), JSON.stringify(sessions));
            // Remove messages
            const allMessages = this.getAllMessages();
            delete allMessages[sessionId];
            localStorage.setItem(this.getStorageKey("MESSAGES"), JSON.stringify(allMessages));
        }
        catch (error) {
            console.error("Failed to clear session:", error);
        }
    }
    /**
     * Clear all data
     */
    clearAll() {
        try {
            Object.keys(STORAGE_KEY_PARTS).forEach((part) => {
                localStorage.removeItem(this.getStorageKey(part));
            });
        }
        catch (error) {
            console.error("Failed to clear all storage:", error);
        }
    }
    /**
     * Get storage usage info
     */
    getStorageInfo() {
        try {
            let used = 0;
            Object.keys(STORAGE_KEY_PARTS).forEach((part) => {
                const item = localStorage.getItem(this.getStorageKey(part));
                if (item) {
                    used += new Blob([item]).size;
                }
            });
            const total = 5 * 1024 * 1024; // 5MB typical localStorage limit
            return {
                used,
                total,
                percentage: Math.round((used / total) * 100),
            };
        }
        catch (error) {
            console.error("Failed to get storage info:", error);
            return { used: 0, total: 0, percentage: 0 };
        }
    }
}

var storage_service = /*#__PURE__*/Object.freeze({
    __proto__: null,
    StorageService: StorageService
});

class MessageService {
    constructor(storageConfig = { strategy: "localStorage" }) {
        this.storageService = new StorageService({
            strategy: "localStorage",
            ...storageConfig,
        });
    }
    async ensureSession(sessionId, sessionData) {
        const existingSession = this.storageService.getSession(sessionId);
        if (existingSession && existingSession.status === "active") {
            return existingSession;
        }
        const newSession = {
            session_id: sessionId,
            bot_id: sessionData?.bot_id || null,
            user_id: sessionData?.user_id || null,
            status: "active",
            metadata: sessionData?.metadata || {},
            created_at: existingSession?.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
            expires_at: existingSession?.expires_at,
        };
        this.storageService.saveSession(sessionId, newSession);
        return newSession;
    }
    async addMessage(sessionId, messageData) {
        await this.ensureSession(sessionId);
        const messages = this.storageService.getMessages(sessionId);
        const timestamp = new Date();
        const message = {
            id: generateId(),
            message_id: messageData.message_id || generateId(),
            session_id: sessionId,
            type: messageData.type || "text",
            content: messageData.content || "",
            role: messageData.role,
            payload: messageData.payload || {},
            disabled: messageData.disabled || false,
            sequence_number: messages.length + 1,
            timestamp,
            created_at: timestamp.toISOString(),
            updated_at: timestamp.toISOString(),
        };
        messages.push(message);
        this.storageService.saveMessages(sessionId, messages);
        await this.updateSession(sessionId, {
            updated_at: timestamp.toISOString(),
            status: "active",
        });
        return message;
    }
    async sendMessage(sessionId, content, type = "text", payload) {
        return this.addMessage(sessionId, {
            message_id: generateId(),
            type,
            content,
            role: "user",
            payload,
        });
    }
    async getSession(sessionId) {
        const session = this.storageService.getSession(sessionId);
        if (!session)
            return null;
        return {
            session,
            messages: this.storageService.getMessages(sessionId),
        };
    }
    async updateSession(sessionId, updates) {
        const existingSession = this.storageService.getSession(sessionId) ||
            (await this.ensureSession(sessionId));
        const nextMetadata = updates.metadata && typeof updates.metadata === "object"
            ? {
                ...(existingSession.metadata || {}),
                ...updates.metadata,
            }
            : existingSession.metadata;
        const updatedSession = {
            ...existingSession,
            ...updates,
            metadata: nextMetadata,
            updated_at: new Date().toISOString(),
        };
        this.storageService.saveSession(sessionId, updatedSession);
        return updatedSession;
    }
    async updateMessage(sessionId, messageId, updates) {
        const messages = this.storageService.getMessages(sessionId);
        const messageIndex = messages.findIndex((m) => m.message_id === messageId);
        if (messageIndex === -1)
            return null;
        messages[messageIndex] = {
            ...messages[messageIndex],
            ...updates,
            updated_at: new Date().toISOString(),
        };
        this.storageService.saveMessages(sessionId, messages);
        await this.updateSession(sessionId, {
            updated_at: new Date().toISOString(),
        });
        return messages[messageIndex];
    }
    async deleteSession(sessionId) {
        this.storageService.clearSession(sessionId);
    }
    async expireSession(sessionId) {
        this.storageService.clearSession(sessionId);
    }
    getAllSessions() {
        return this.storageService.getAllSessions();
    }
    canSync() {
        return false;
    }
    async sync() {
        return Promise.resolve();
    }
    getSyncStatus() {
        return {
            canSync: false,
            queueSize: 0,
        };
    }
}

var message_service = /*#__PURE__*/Object.freeze({
    __proto__: null,
    MessageService: MessageService
});

class HooksService {
    constructor(config = {}, sessionStore, sessionId) {
        this.config = config;
        this.sessionStore = sessionStore;
        this.sessionId = sessionId || "";
    }
    setContext(sessionId, chatbotInstance) {
        this.sessionId = sessionId;
        this.chatbotInstance = chatbotInstance;
    }
    async executeOnOpen(sessionId, chatbotInstance) {
        const finalSessionId = sessionId || this.sessionId;
        const finalInstance = chatbotInstance || this.chatbotInstance;
        const onOpenConfig = this.config.onOpen;
        if (!onOpenConfig?.enabled)
            return null;
        try {
            if (onOpenConfig.customAction) {
                return await onOpenConfig.customAction(finalSessionId, finalInstance);
            }
            if (onOpenConfig.defaultAction !== false) {
                return {
                    sessionId: finalSessionId,
                    timestamp: new Date().toISOString(),
                    action: "opened",
                };
            }
        }
        catch (error) {
            console.error("onOpen hook failed:", error);
            throw error;
        }
        return null;
    }
    async executeSendEmail(sessionId, mailConfig, extraData) {
        const finalSessionId = sessionId || this.sessionId;
        const sendEmailConfig = this.config.sendEmail;
        if (!sendEmailConfig?.enabled) {
            console.warn("SendEmail hook is not enabled");
            return false;
        }
        try {
            const baseConfig = mailConfig || sendEmailConfig.config;
            if (!baseConfig)
                throw new Error("No email configuration provided");
            const isPlainObj = (value) => !!value && typeof value === "object" && !Array.isArray(value);
            const normalizedExtra = extraData == null
                ? {}
                : typeof extraData === "object"
                    ? extraData
                    : { value: extraData };
            const extraMetadata = isPlainObj(normalizedExtra.metadata)
                ? normalizedExtra.metadata
                : {};
            const extraRest = isPlainObj(normalizedExtra)
                ? { ...normalizedExtra }
                : {};
            delete extraRest.metadata;
            const finalConfig = {
                ...baseConfig,
                metadata: {
                    ...(isPlainObj(baseConfig.metadata) ? baseConfig.metadata : {}),
                    ...extraRest,
                    ...extraMetadata,
                },
            };
            if (sendEmailConfig.customAction) {
                return !!(await sendEmailConfig.customAction(finalSessionId, finalConfig));
            }
            if (sendEmailConfig.defaultAction === false) {
                return false;
            }
            if (!this.sessionStore) {
                console.warn("No local session store available for sendEmail hook");
                return false;
            }
            const requestedAt = new Date().toISOString();
            const existingSession = await this.sessionStore.getSession(finalSessionId);
            const metadata = existingSession?.session.metadata || {};
            const emailRequests = Array.isArray(metadata.emailRequests)
                ? metadata.emailRequests
                : [];
            await this.sessionStore.updateSession(finalSessionId, {
                metadata: {
                    ...metadata,
                    lastEmailRequest: {
                        ...finalConfig,
                        requestedAt,
                    },
                    emailRequests: [
                        ...emailRequests,
                        {
                            ...finalConfig,
                            requestedAt,
                        },
                    ],
                },
            });
            return true;
        }
        catch (error) {
            console.error("sendEmail hook failed:", error);
            return false;
        }
    }
    async executeOnComplete(sessionId, sessionData) {
        const finalSessionId = sessionId || this.sessionId;
        const onCompleteConfig = this.config.onComplete;
        if (!onCompleteConfig?.enabled) {
            console.warn("OnComplete hook is not enabled");
            return null;
        }
        try {
            let emailSent = false;
            if (this.config.sendEmail?.enabled) {
                emailSent = await this.executeSendEmail(finalSessionId, undefined, sessionData);
            }
            if (onCompleteConfig.customAction) {
                return await onCompleteConfig.customAction(finalSessionId, {
                    ...sessionData,
                    emailSent,
                });
            }
            const completedAt = sessionData?.completedAt || new Date().toISOString();
            if (onCompleteConfig.defaultAction !== false && this.sessionStore) {
                const existingSession = await this.sessionStore.getSession(finalSessionId);
                await this.sessionStore.updateSession(finalSessionId, {
                    status: "completed",
                    expires_at: completedAt,
                    metadata: {
                        ...(existingSession?.session.metadata || {}),
                        completionData: sessionData || null,
                        completedAt,
                        emailSent,
                    },
                });
            }
            return {
                sessionId: finalSessionId,
                status: "completed",
                emailSent,
                completedAt,
            };
        }
        catch (error) {
            console.error("onComplete hook failed:", error);
            throw error;
        }
    }
    getHooks() {
        const sendEmail = (mailConfig) => this.executeSendEmail(undefined, mailConfig);
        sendEmail.enabled = this.config.sendEmail?.enabled || false;
        sendEmail.config = this.config.sendEmail?.config;
        const onComplete = (sessionData) => this.executeOnComplete(undefined, sessionData);
        onComplete.enabled = this.config.onComplete?.enabled || false;
        const onOpen = () => this.executeOnOpen();
        onOpen.enabled = this.config.onOpen?.enabled || false;
        return {
            sendEmail,
            onComplete,
            onOpen,
        };
    }
    updateConfig(config) {
        this.config = { ...this.config, ...config };
    }
    getConfig() {
        return { ...this.config };
    }
}

class Chatbot {
    constructor(config = {}) {
        this.eventEmitter = createEventEmitter();
        if (Chatbot.instance) {
            console.warn("Chatbot instance already exists. Use existing instance.");
            return Chatbot.instance;
        }
        // Merge with default config
        this.config = deepMerge(DEFAULT_CONFIG, config);
        // Initialize session
        this.sessionId = this.generateSessionId();
        // Initialize message service
        this.initializeMessageService();
        // Remove existing instance if any
        this.removeExistingInstance();
        // Initialize state - do this synchronously first
        this.initializeStateSync();
        // Create UI
        this.createUserInterface();
        // Set singleton instance
        Chatbot.instance = this;
        // Initialize features asynchronously
        this.initializeFeatures();
        // Initialize hooks service
        this.initializeHooksService();
    }
    /**
     * Initialize hooks service
     */
    initializeHooksService() {
        if (this.config.ChatHooks) {
            this.hooksService = new HooksService(this.config.ChatHooks, this.messageService, this.sessionId);
            // Set context for hooks
            this.hooksService.setContext(this.sessionId, this);
        }
    }
    /**
     * Initialize message service with local storage configuration
     */
    initializeMessageService() {
        this.messageService = new MessageService({
            strategy: "localStorage",
            namespace: this.config.storage?.namespace || this.config.storageKey,
            maxSessions: this.config.storage?.maxSessions,
            maxMessagesPerSession: this.config.storage?.maxMessagesPerSession || this.config.maxMessages,
        });
    }
    /**
     * Remove existing chatbot instance
     */
    removeExistingInstance() {
        const existingRoot = document.querySelector(".chatbot-widget-root");
        if (existingRoot) {
            existingRoot.remove();
        }
    }
    /**
     * Initialize chatbot state synchronously
     */
    initializeStateSync() {
        this.state = {
            isOpen: false,
            isTyping: false,
            messages: [], // Start with empty, load async
            currentInput: "",
            inputDisabled: false,
            waitingForOptionSelection: false,
            isOnline: navigator.onLine,
            syncStatus: "synced",
        };
    }
    /**
     * Initialize chatbot state asynchronously
     */
    async initializeStateAsync() {
        let persistedMessages = [];
        if (this.config.persistMessages) {
            try {
                const sessionData = await this.messageService.getSession(this.sessionId);
                if (sessionData) {
                    persistedMessages = sessionData.messages;
                }
            }
            catch (error) {
                console.error("Failed to load persisted messages:", error);
            }
        }
        this.state.messages = persistedMessages;
        this.ui.renderMessages(this.state.messages);
    }
    /**
     * Create user interface
     */
    createUserInterface() {
        this.root = document.createElement("div");
        this.root.className = "chatbot-widget-root";
        document.body.appendChild(this.root);
        this.ui = createUI(this.root, this.config, this.state, {
            onToggle: () => this.toggle(),
            onSend: (msg) => this.sendMessage(msg),
            onClose: () => this.close(),
            onReset: () => this.resetSession(),
            onOptionSelect: (optionId, optionText, messageId, meta) => this.handleOptionSelection(optionId, optionText, messageId, meta),
            onSync: () => this.sync(),
            onRetry: () => this.retry(),
        });
    }
    /**
     * Initialize additional features
     */
    async initializeFeatures() {
        // Load persisted messages
        await this.initializeStateAsync();
        // Handle auto-open
        if (this.config.autoOpen) {
            setTimeout(() => {
                void this.open();
            }, this.config.autoOpenDelayMs ?? 0);
        }
        // Add welcome message if no messages exist
        if (this.state.messages.length === 0 && this.config.welcomeMessage) {
            setTimeout(() => this.addWelcomeMessage(), 300);
        }
        // Initialize online/offline handling
        this.initializeNetworkHandling();
        // Update input state
        this.updateInputState();
    }
    /**
     * Initialize network status handling
     */
    initializeNetworkHandling() {
        window.addEventListener("online", () => {
            this.state.isOnline = true;
            this.eventEmitter.emit("online");
            this.ui.updateConnectionStatus(true);
            void this.sync();
        });
        window.addEventListener("offline", () => {
            this.state.isOnline = false;
            this.eventEmitter.emit("offline");
            this.ui.updateConnectionStatus(false);
        });
    }
    /**
     * Generate unique session ID
     */
    generateSessionId() {
        return generateSessionId("session", this.config.user_id, this.config.bot_id);
    }
    /**
     * Add welcome message
     */
    async addWelcomeMessage() {
        if (!this.config.welcomeMessage)
            return;
        const welcomeMessage = {
            id: generateId(),
            message_id: generateId(),
            type: "text",
            content: this.config.welcomeMessage,
            role: "assistant",
            timestamp: new Date(),
            session_id: this.sessionId,
        };
        await this.addMessageInternal(welcomeMessage);
    }
    /**
     * Reset session
     */
    async resetSession() {
        try {
            const previousSessionId = this.sessionId;
            await this.messageService.expireSession(previousSessionId);
            // Generate new session ID
            this.sessionId = this.generateSessionId();
            // Clear local state
            this.state.messages = [];
            this.state.inputDisabled = false;
            this.state.waitingForOptionSelection = false;
            this.state.isTyping = false;
            // Clear browser storage
            this.clearLocalSessionData(previousSessionId);
            // Update UI
            this.ui.setInputDisabled(false);
            this.ui.setTyping(false);
            this.ui.renderMessages(this.state.messages);
            // Add welcome message for new session
            if (this.config.welcomeMessage) {
                setTimeout(() => this.addWelcomeMessage(), 500);
            }
            // Emit reset event
            this.eventEmitter.emit("reset");
            this.config.onReset?.();
            console.log(`New session started: ${this.sessionId}`);
        }
        catch (error) {
            console.error("Failed to reset session:", error);
            this.config.onError?.(error);
        }
    }
    /**
     * Clear local session data
     */
    clearLocalSessionData(_sessionId) {
        // Clear sessionStorage
        sessionStorage.removeItem("chatFlowStep");
        sessionStorage.removeItem("chatFlowData");
    }
    /**
     * Add message internally
     */
    async addMessageInternal(message) {
        try {
            this.state.messages.push(message);
            // Limit messages if configured
            if (this.config.maxMessages &&
                this.state.messages.length > this.config.maxMessages) {
                this.state.messages = this.state.messages.slice(-this.config.maxMessages);
            }
            // Update UI
            this.ui.renderMessages(this.state.messages);
            this.updateInputState();
            // Persist locally
            if (this.config.persistMessages) {
                await this.messageService.addMessage(this.sessionId, {
                    message_id: message.message_id || message.id,
                    type: message.type || "text",
                    content: message.content || "",
                    role: message.role,
                    payload: message.payload,
                    disabled: message.disabled,
                });
            }
        }
        catch (error) {
            console.error("Failed to add message:", error);
            this.state.syncStatus = "failed";
            this.ui.updateSyncStatus("failed");
        }
    }
    /**
     * Update input state based on active options
     */
    updateInputState() {
        const hasActiveOptionSelection = this.state.messages.some((msg) => msg.type === "option_selection" &&
            !msg.disabled &&
            msg.role === "assistant");
        this.state.inputDisabled = hasActiveOptionSelection;
        this.state.waitingForOptionSelection = hasActiveOptionSelection;
        this.ui.setInputDisabled(this.state.inputDisabled);
    }
    /**
     * Handle option selection
     */
    async handleOptionSelection(optionId, optionText, messageId, meta) {
        try {
            // Disable the option message
            await this.updateMessage(messageId, { disabled: true });
            // Add user's selection as a message
            await this.addMessageInternal({
                id: generateId(),
                message_id: generateId(),
                type: "text",
                content: optionText,
                role: "user",
                timestamp: new Date(),
                session_id: this.sessionId,
            });
            // Handle response if callback provided
            if (this.config.onMessageSend) {
                this.handleOptionSelectionResponse(optionId, optionText, meta);
            }
        }
        catch (error) {
            console.error("Failed to handle option selection:", error);
            this.config.onError?.(error);
        }
    }
    /**
     * Handle option selection response
     */
    async handleOptionSelectionResponse(optionId, optionText, meta) {
        try {
            this.state.isTyping = true;
            this.ui.setTyping(true);
            const result = await Promise.resolve(this.config.onMessageSend?.({
                type: "option_selection",
                optionId,
                optionText,
                allowMultiple: !!meta?.allowMultiple,
                optionIds: meta?.optionIds,
                optionTexts: meta?.optionTexts,
                options: meta?.options,
                sessionId: this.sessionId,
            }));
            if (result) {
                await this.handleMessageResult(result);
            }
        }
        catch (error) {
            console.error("Option selection response error:", error);
            this.config.onError?.(error);
            await this.addErrorMessage();
        }
        finally {
            this.state.isTyping = false;
            this.ui.setTyping(false);
        }
    }
    /**
     * Handle message result from callback
     */
    async handleMessageResult(result) {
        if (typeof result === "string") {
            await this.pushMessage(result, "assistant");
        }
        else if (Array.isArray(result)) {
            for (const item of result) {
                await this.addMessageInternal(typeof item === "string"
                    ? this.createTextMessage(item, "assistant")
                    : { ...item, role: "assistant", timestamp: new Date() });
            }
        }
        else if (typeof result === "object" &&
            (result.type || result.content || result.payload)) {
            await this.addMessageInternal({
                id: generateId(),
                message_id: generateId(),
                ...result,
                role: "assistant",
                timestamp: new Date(),
                session_id: this.sessionId,
            });
        }
        else {
            await this.pushMessage(String(result), "assistant");
        }
    }
    /**
     * Create text message object
     */
    createTextMessage(content, role = "assistant") {
        return {
            id: generateId(),
            message_id: generateId(),
            type: "text",
            content: sanitizeHtml(content),
            role,
            timestamp: new Date(),
            session_id: this.sessionId,
        };
    }
    /**
     * Add error message
     */
    async addErrorMessage() {
        await this.addMessageInternal({
            id: generateId(),
            message_id: generateId(),
            type: "text",
            content: this.config.errorMessage || "Sorry, something went wrong.",
            role: "assistant",
            timestamp: new Date(),
            session_id: this.sessionId,
        });
    }
    /**
     * Update message
     */
    async updateMessage(messageId, updates) {
        const messageIndex = this.state.messages.findIndex((msg) => msg.id === messageId);
        if (messageIndex === -1)
            return;
        // Update local message
        this.state.messages[messageIndex] = {
            ...this.state.messages[messageIndex],
            ...updates,
        };
        // Update UI
        this.ui.renderMessages(this.state.messages);
        // Persist locally
        if (this.config.persistMessages) {
            try {
                await this.messageService.updateMessage(this.sessionId, this.state.messages[messageIndex].message_id || messageId, updates);
            }
            catch (error) {
                console.error("Failed to update message:", error);
            }
        }
    }
    /**
     * Public API Methods
     */
    /**
     * Push a message to the chat
     */
    async pushMessage(msg, role = "assistant") {
        const message = typeof msg === "string"
            ? this.createTextMessage(msg, role)
            : {
                ...msg,
                id: msg.id || generateId(),
                message_id: msg.message_id || generateId(),
                timestamp: msg.timestamp || new Date(),
                session_id: this.sessionId,
            };
        await this.addMessageInternal(message);
    }
    /**
     * Push option selection message
     */
    async pushOptionSelection(question, options, cfg) {
        const message = {
            id: generateId(),
            message_id: generateId(),
            type: "option_selection",
            content: question,
            role: "assistant",
            timestamp: new Date(),
            payload: { options, ...(cfg || {}) },
            disabled: false,
            session_id: this.sessionId,
        };
        await this.addMessageInternal(message);
    }
    /**
     * Send message
     */
    async sendMessage(message) {
        if (this.state.inputDisabled && typeof message === "string") {
            return;
        }
        try {
            // Add user message
            if (typeof message === "string") {
                if (!message.trim())
                    return;
                await this.pushMessage(message, "user");
            }
            else {
                await this.addMessageInternal({
                    id: generateId(),
                    message_id: generateId(),
                    type: (message.type || "text"),
                    content: message.payload?.text || "",
                    payload: message.payload,
                    role: "user",
                    timestamp: new Date(),
                    session_id: this.sessionId,
                });
            }
            // Handle response if callback provided
            if (this.config.onMessageSend) {
                this.state.isTyping = true;
                this.ui.setTyping(true);
                const messageWithSession = typeof message === "string"
                    ? { content: message, sessionId: this.sessionId }
                    : { ...message, sessionId: this.sessionId };
                const result = await Promise.resolve(this.config.onMessageSend(messageWithSession));
                if (result) {
                    await this.handleMessageResult(result);
                }
            }
        }
        catch (error) {
            console.error("Send message error:", error);
            this.config.onError?.(error);
            await this.addErrorMessage();
        }
        finally {
            this.state.isTyping = false;
            this.ui.setTyping(false);
        }
    }
    /**
     * Get hooks that users can call directly
     */
    getHooks() {
        if (!this.hooksService) {
            console.warn("Hooks service not initialized");
            return null;
        }
        return this.hooksService.getHooks();
    }
    /**
     * Complete session - trigger onComplete hook (can be called by user)
     */
    async completeSession(additionalData) {
        if (!this.hooksService) {
            console.warn("No hooks service configured");
            return null;
        }
        try {
            const sessionData = {
                session_id: this.sessionId,
                messages: this.state.messages,
                metadata: {
                    ...this.state.messages,
                    ...additionalData,
                },
                completedAt: new Date().toISOString(),
            };
            const result = await this.hooksService.executeOnComplete(this.sessionId, sessionData);
            return result;
        }
        catch (error) {
            console.error("Session completion failed:", error);
            this.config.onError?.(error);
            throw error;
        }
    }
    /**
     * Send email manually (can be called by user)
     */
    async sendEmail(mailConfig) {
        if (!this.hooksService) {
            console.warn("No hooks service configured");
            return false;
        }
        try {
            return await this.hooksService.executeSendEmail(this.sessionId, mailConfig);
        }
        catch (error) {
            console.error("Email sending failed:", error);
            this.config.onError?.(error);
            return false;
        }
    }
    /**
     * Set input type dynamically
     * This allows users to change the input field type on the fly
     */
    setInputType(type, config) {
        const currentInputConfig = this.config.inputConfig;
        // Preserve menu and other existing input config while switching modes.
        this.config.inputConfig = {
            ...(currentInputConfig || {}),
            type,
            placeholder: config?.placeholder ?? currentInputConfig?.placeholder,
            phoneConfig: config?.phoneConfig !== undefined
                ? {
                    ...(currentInputConfig?.phoneConfig || {}),
                    ...config.phoneConfig,
                }
                : currentInputConfig?.phoneConfig,
        };
        // Update state
        this.state.currentInputType = type;
        // Update UI
        if (this.ui && typeof this.ui.setInputType === "function") {
            this.ui.setInputType(type, config);
        }
        console.log(`Input type changed to: ${type}`);
    }
    /**
     * Get current input type
     */
    getInputType() {
        return (this.state.currentInputType || this.config.inputConfig?.type || "text");
    }
    /**
     * Open chat
     */
    async open() {
        if (this.state.isOpen)
            return;
        this.state.isOpen = true;
        this.ui.setOpen(true);
        // Execute onOpen hook
        try {
            if (this.hooksService) {
                await this.hooksService.executeOnOpen(this.sessionId, this);
            }
        }
        catch (error) {
            console.error("onOpen hook execution failed:", error);
            this.config.onError?.(error);
        }
        // Emit events and continue
        this.eventEmitter.emit("open");
        this.config.onOpen?.();
        setTimeout(() => this.ui.focusInput(), 120);
    }
    /**
     * Close chat
     */
    close() {
        if (!this.state.isOpen)
            return;
        this.state.isOpen = false;
        this.ui.setOpen(false);
        this.eventEmitter.emit("close");
        this.config.onClose?.();
    }
    /**
     * Toggle chat
     */
    toggle() {
        this.state.isOpen ? this.close() : this.open();
    }
    /**
     * Get open state
     */
    isOpen() {
        return this.state.isOpen;
    }
    /**
     * Clear messages (alias for resetSession)
     */
    clearMessages() {
        this.resetSession();
    }
    /**
     * Sync local persistence state
     */
    async sync() {
        try {
            this.state.syncStatus = "pending";
            this.ui.updateSyncStatus("pending");
            await this.messageService.sync();
            this.state.syncStatus = "synced";
            this.ui.updateSyncStatus("synced");
            this.eventEmitter.emit("sync");
        }
        catch (error) {
            console.error("Sync failed:", error);
            this.state.syncStatus = "failed";
            this.ui.updateSyncStatus("failed");
            this.config.onError?.(error);
        }
    }
    /**
     * Retry failed operations
     */
    async retry() {
        await this.sync();
    }
    /**
     * Get current session ID
     */
    getSessionId() {
        return this.sessionId;
    }
    /**
     * Get all sessions
     */
    getAllSessions() {
        return this.messageService.getAllSessions();
    }
    /**
     * Update configuration
     */
    updateConfig(cfg) {
        this.config = deepMerge(this.config, cfg);
        this.ui.updateConfig(this.config);
        this.eventEmitter.emit("configUpdate", this.config);
    }
    /**
     * Reset theme-related configuration back to built-in defaults
     */
    resetTheme() {
        this.config = {
            ...this.config,
            primaryColor: DEFAULT_CONFIG.primaryColor,
            secondaryColor: DEFAULT_CONFIG.secondaryColor,
            backgroundColor: DEFAULT_CONFIG.backgroundColor,
            textColor: DEFAULT_CONFIG.textColor,
            borderRadius: DEFAULT_CONFIG.borderRadius,
            fontFamily: DEFAULT_CONFIG.fontFamily,
            theme: undefined,
        };
        this.ui.updateConfig(this.config);
        this.eventEmitter.emit("configUpdate", this.config);
    }
    /**
     * Get current configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Get current state
     */
    getState() {
        return { ...this.state };
    }
    /**
     * Add event listener
     */
    on(event, callback) {
        this.eventEmitter.on(event, callback);
    }
    /**
     * Remove event listener
     */
    off(event, callback) {
        this.eventEmitter.off(event, callback);
    }
    /**
     * Get connection status
     */
    isOnline() {
        return this.state.isOnline;
    }
    /**
     * Get sync status
     */
    getSyncStatus() {
        const serviceStatus = this.messageService.getSyncStatus();
        return {
            ...serviceStatus,
            status: this.state.syncStatus,
        };
    }
    /**
     * Destroy chatbot instance
     */
    destroy() {
        if (this.root) {
            this.root.remove();
        }
        // Remove event listeners
        window.removeEventListener("online", () => { });
        window.removeEventListener("offline", () => { });
        Chatbot.instance = null;
        this.eventEmitter.emit("destroy");
    }
    /**
     * Get singleton instance
     */
    static getInstance() {
        return Chatbot.instance;
    }
}
Chatbot.instance = null;

function getRegistry() {
    if (!window.__chatbotAutoOpenTTLRegistry__) {
        window.__chatbotAutoOpenTTLRegistry__ = {
            listeners: {},
            timers: {},
        };
    }
    return window.__chatbotAutoOpenTTLRegistry__;
}
function autoOpenChatbotTTL(bot, openAndInit, options = {}) {
    if (typeof window === "undefined") {
        return () => { };
    }
    const ttlMs = options.ttlMs ?? 20 * 60 * 1000;
    const storageKey = options.storageKey ?? "chatbot_autoopen_next_at_v1";
    const flowKeysToClear = options.flowKeysToClear ?? [
        "chatFlowStep",
        "chatFlowData",
    ];
    const resetOnFirstOpen = options.resetOnFirstOpen ?? false;
    const registry = getRegistry();
    const readStorageValue = () => {
        try {
            return localStorage.getItem(storageKey);
        }
        catch {
            return null;
        }
    };
    const writeStorageValue = (value) => {
        try {
            localStorage.setItem(storageKey, String(value));
        }
        catch {
            // Ignore storage write failures.
        }
    };
    const getNextAt = () => {
        const value = Number(readStorageValue() || 0);
        return Number.isFinite(value) ? value : 0;
    };
    const isBotOpen = () => typeof bot?.isOpen === "function" ? !!bot.isOpen() : false;
    const hardReset = async () => {
        try {
            flowKeysToClear.forEach((key) => sessionStorage.removeItem(key));
        }
        catch {
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
        if (!nextAt)
            return;
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
    const onStorage = (event) => {
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

var autoOpenTtl = /*#__PURE__*/Object.freeze({
    __proto__: null,
    autoOpenChatbotTTL: autoOpenChatbotTTL
});

// Web Component
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
                primaryColor: this.getAttribute("primary-color") || undefined,
                secondaryColor: this.getAttribute("secondary-color") || undefined,
                welcomeMessage: this.getAttribute("welcome-message") || undefined,
                autoOpen: this.hasAttribute("auto-open"),
                storageKey: this.getAttribute("storage-key") || undefined,
                fontFamily: this.getAttribute("font-family") || undefined,
            };
            this.chatbot = new Chatbot(config);
        }
    }
    disconnectedCallback() {
        this.chatbot?.destroy();
        this.chatbot = null;
    }
    // Public methods for external access
    open() {
        this.chatbot?.open();
    }
    close() {
        this.chatbot?.close();
    }
    isOpen() {
        return this.chatbot?.isOpen() || false;
    }
    sendMessage(message) {
        this.chatbot?.sendMessage(message);
    }
    clearMessages() {
        this.chatbot?.clearMessages();
    }
    resetSession() {
        this.chatbot?.resetSession();
    }
    updateConfig(config) {
        this.chatbot?.updateConfig(config);
    }
    resetTheme() {
        this.chatbot?.resetTheme();
    }
}
// Register web component if not already registered
if (!customElements.get("chatbot-widget")) {
    customElements.define("chatbot-widget", ChatbotElement);
}
// Global namespace for UMD builds
if (typeof window !== "undefined") {
    window.UniversalChatbot = {
        Chatbot,
        ChatbotElement,
        autoOpenChatbotTTL: () => Promise.resolve().then(function () { return autoOpenTtl; }).then((m) => m.autoOpenChatbotTTL),
        MessageService: () => Promise.resolve().then(function () { return message_service; }).then((m) => m.MessageService),
        StorageService: () => Promise.resolve().then(function () { return storage_service; }).then((m) => m.StorageService),
    };
}

export { Chatbot, ChatbotElement, MessageService, StorageService, autoOpenChatbotTTL, deepMerge, Chatbot as default, formatTimestamp, generateId, generateMessageId, generateSessionId, sanitizeHtml };
//# sourceMappingURL=index.js.map
