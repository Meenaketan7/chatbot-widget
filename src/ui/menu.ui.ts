import {
  ChatbotConfig,
  InputFieldType,
  InputMenuConfig,
  MenuActionContext,
  MenuItemConfig,
} from "../core/types";
import { renderControlIcon, renderIconMarkup } from "./ui.icons";

/**
 * Render menu HTML based on configuration (SmartBot Style)
 */

export function renderMenuHTML(
  config: ChatbotConfig,
  menuConfig: InputMenuConfig | undefined,
  currentInputType: InputFieldType,
): string {
  if (
    !menuConfig?.enabled ||
    !menuConfig.items ||
    currentInputType === "phone"
  ) {
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

  menuConfig.items.forEach((item: MenuItemConfig, index: number) => {
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
          ${
            item.action === "custom"
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
                </a>`
          }
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

export function attachMenuListeners(
  container: HTMLElement,
  menuConfig: InputMenuConfig | undefined,
  handlers: any,
  inputWrapper?: HTMLElement,
) {
  if (!menuConfig?.enabled || !menuConfig.items) return;

  const targetWrapper = inputWrapper || container.querySelector(".cw-input");
  const menuContainer = targetWrapper?.querySelector(
    ".cw-menu-container",
  ) as HTMLElement;
  if (!menuContainer) return;

  const menuToggleBtn = menuContainer.querySelector(
    ".menu-toggle-btn",
  ) as HTMLButtonElement | null;
  const menuOptionsDiv = menuContainer.querySelector(
    ".menu-options-div",
  ) as HTMLElement | null;
  const menuTriggers = Array.from(
    menuContainer.querySelectorAll(".menu-option-trigger"),
  ) as HTMLElement[];

  if (!menuToggleBtn || !menuOptionsDiv) return;

  if ((menuContainer as any).__menu_listeners_attached) return;
  (menuContainer as any).__menu_listeners_attached = true;

  const toggleIcon = (showClose: boolean) => {
    const toggleIconEl = menuToggleBtn.querySelector(
      ".menu-toggle-icon",
    ) as HTMLElement | null;
    const closeIconEl = menuToggleBtn.querySelector(
      ".menu-close-icon",
    ) as HTMLElement | null;

    if (showClose) {
      toggleIconEl?.classList.add("icon-hidden");
      closeIconEl?.classList.remove("icon-hidden");
    } else {
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

  const toggleMenu = (event?: Event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (menuContainer.classList.contains("open")) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  menuToggleBtn.addEventListener("click", toggleMenu);

  const closeMenuOutside = (event: MouseEvent) => {
    const path = (event.composedPath && event.composedPath()) || [];
    if (
      !path.includes(menuContainer) &&
      menuContainer.classList.contains("open")
    ) {
      closeMenu();
    }
  };
  document.addEventListener("click", closeMenuOutside);

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape" && menuContainer.classList.contains("open")) {
      closeMenu();
    }
  };
  document.addEventListener("keydown", onKeyDown);

  menuTriggers.forEach((trigger) => {
    const onClick = async (event: Event) => {
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

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        trigger.click();
      }
    };

    trigger.addEventListener("click", onClick);
    trigger.addEventListener("keydown", onKey);
  });

  (menuContainer as any).__menu_cleanup = () => {
    menuToggleBtn.removeEventListener("click", toggleMenu);
    document.removeEventListener("click", closeMenuOutside);
    document.removeEventListener("keydown", onKeyDown);
    menuTriggers.forEach((trigger) =>
      trigger.replaceWith(trigger.cloneNode(true)),
    );
    delete (menuContainer as any).__menu_listeners_attached;
  };
}

async function executeCustomMenuAction(
  menuConfig: InputMenuConfig,
  menuId: string | null,
  partialContext: Partial<MenuActionContext> = {},
): Promise<void> {
  const menuItem = menuConfig.items.find((item) => item.id === menuId);
  if (!menuItem?.customHandler) return;

  try {
    await Promise.resolve(
      menuItem.customHandler({
        id: menuItem.id,
        text: menuItem.text,
        action: menuItem.action,
        actionValue: menuItem.actionValue,
        ...partialContext,
      }),
    );
  } catch (error) {
    console.error("Custom menu action failed:", error);
  }
}

export async function handleMenuAction(
  action: string | null,
  value: string | null,
  menuId: string | null,
  menuConfig: InputMenuConfig,
): Promise<void> {
  switch (action) {
    case "redirect":
      if (value) {
        window.open(value, "_blank");
      }
      break;

    case "call":
      if (value) {
        window.location.href = `tel:${value}`;
      }
      break;

    case "email":
      if (value) {
        window.location.href = `mailto:${value}`;
      }
      break;

    case "custom": {
      await executeCustomMenuAction(menuConfig, menuId, {
        action: "custom",
        actionValue: value || undefined,
      });
      break;
    }

    default:
      console.warn(`Unknown menu action: ${action}`);
  }
}
