import { InputFieldType, InputMenuConfig, MenuItemConfig } from "../core/types";

/**
 * Render menu HTML based on configuration (SmartBot Style)
 */

export function renderMenuHTML(
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
        <img class="menu-icon-sb menu-toggle-icon" src="https://custpostimages.s3.ap-south-1.amazonaws.com/sb_images/headder_menu_icon_new_sb.svg" alt="Menu">
        <img class="menu-icon-sb menu-close-icon icon-hidden" src="https://s3.ap-south-1.amazonaws.com/custpostimages/ss_images/close_modal.png" alt="Close">
      </button>

      <div class="menu-options-div">
  `;

  menuConfig.items.forEach((item: MenuItemConfig, index: number) => {
    const isLast = index === menuConfig.items.length - 1;
    menuHTML += `
      <div class="pull-left full-width menu-option-div ${!isLast ? "border-bottom" : ""}">
        <label class="pull-left full-width pointer menu-option-label">
          ${item.icon ? `<div class="menu-icon-smatest">${item.icon}</div>` : ""}
          <a 
            title="${item.text}" 
            class="text-black bot-google-font menu-option-link" 
            href="${item.action === "call" ? `tel:${item.actionValue}` : item.action === "email" ? `mailto:${item.actionValue}` : item.actionValue || "#"}"
            ${item.action === "redirect" ? 'target="_blank" rel="noopener noreferrer"' : ""}
            data-menu-id="${item.id}"
            data-menu-action="${item.action}"
            ${item.actionValue ? `data-menu-value="${item.actionValue}"` : ""}
          >
            <span>${item.text}</span>
          </a>
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
  const menuLinks = Array.from(
    menuContainer.querySelectorAll(".menu-option-link"),
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

  menuLinks.forEach((link) => {
    const onClick = async (event: Event) => {
      const action = link.getAttribute("data-menu-action");
      const menuId = link.getAttribute("data-menu-id");

      if (action === "custom") {
        event.preventDefault();
        try {
          const menuItem = menuConfig.items.find((item) => item.id === menuId);
          if (menuItem?.customHandler) {
            await Promise.resolve(menuItem.customHandler());
          }
        } catch (error) {
          console.error("Custom menu action failed:", error);
        }
        closeMenu();
        return;
      }

      setTimeout(closeMenu, 120);
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        (link as HTMLElement).click();
      }
    };

    link.addEventListener("click", onClick);
    link.addEventListener("keydown", onKey);
  });

  (menuContainer as any).__menu_cleanup = () => {
    menuToggleBtn.removeEventListener("click", toggleMenu);
    document.removeEventListener("click", closeMenuOutside);
    document.removeEventListener("keydown", onKeyDown);
    menuLinks.forEach((link) => link.replaceWith(link.cloneNode(true)));
    delete (menuContainer as any).__menu_listeners_attached;
  };
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
      const menuItem = menuConfig.items.find((item) => item.id === menuId);
      if (menuItem?.customHandler) {
        try {
          await Promise.resolve(menuItem.customHandler());
        } catch (error) {
          console.error("Custom menu action failed:", error);
        }
      }
      break;
    }

    default:
      console.warn(`Unknown menu action: ${action}`);
  }
}
