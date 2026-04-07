import type { ChatbotConfig, RenderableIcon } from "../core/types";

const DEFAULT_CONTROL_ICONS = {
  send: `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none"><path fill="currentColor" fill-rule="evenodd" d="M2.345 2.245a1 1 0 0 1 1.102-.14l18 9a1 1 0 0 1 0 1.79l-18 9a1 1 0 0 1-1.396-1.211L4.613 13H10a1 1 0 1 0 0-2H4.613L2.05 3.316a1 1 0 0 1 .294-1.071z" clip-rule="evenodd"/></svg>`,
  close: `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  headerReset: `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 3v5h5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  menu: `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none"><rect x="3" y="5" width="18" height="3" rx="1.5" fill="currentColor"/><rect x="3" y="10.5" width="18" height="3" rx="1.5" fill="currentColor"/><rect x="3" y="16" width="18" height="3" rx="1.5" fill="currentColor"/></svg>`,
  menuClose: `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  multiConfirm: "",
  modalReset: "",
  modalCancel: "",
} as const;

export type ControlIconKey = keyof typeof DEFAULT_CONTROL_ICONS;

const isRenderableNode = (value: unknown): value is Node =>
  typeof Node !== "undefined" && value instanceof Node;

export function renderIconMarkup(
  icon: RenderableIcon | undefined,
  fallback = "",
): string {
  const resolvedIcon =
    typeof icon === "function" ? (icon as () => unknown)() : icon;

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

export function resolveControlIcon(
  config: ChatbotConfig,
  key: ControlIconKey,
): RenderableIcon {
  return config.theme?.icons?.[key] ?? DEFAULT_CONTROL_ICONS[key];
}

export function renderControlIcon(
  config: ChatbotConfig,
  key: ControlIconKey,
  className: string,
): string {
  return `<span class="${className}" aria-hidden="true">${renderIconMarkup(resolveControlIcon(config, key))}</span>`;
}

export function renderOptionalControlIcon(
  config: ChatbotConfig,
  key: ControlIconKey,
  className: string,
): string {
  const icon = resolveControlIcon(config, key);
  const markup = renderIconMarkup(icon);
  if (!markup) return "";

  return `<span class="${className}" aria-hidden="true">${markup}</span>`;
}
