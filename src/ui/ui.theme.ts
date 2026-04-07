import type {
  ChatbotConfig,
  RenderableIcon,
  ThemeScalar,
  ThemeValue,
} from "../core/types";

type ThemeVarMap = Record<string, string>;

const toCssValue = (value: ThemeValue | undefined, fallback: string): string => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  return typeof value === "number" ? `${value}px` : String(value);
};

const toScalarValue = (
  value: ThemeScalar | undefined,
  fallback: string,
): string => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  return String(value);
};

const toDurationValue = (
  value: ThemeScalar | undefined,
  fallback: string,
): string => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  return typeof value === "number" ? `${value}ms` : String(value);
};

export function resolveThemeVariables(config: ChatbotConfig): ThemeVarMap {
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

  const resolveButtonVar = (
    value: ThemeValue | undefined,
    fallback: string,
  ): string => toCssValue(value, fallback);

  const variables: ThemeVarMap = {
    "--primary": toCssValue(colors.primary, config.primaryColor || "#8b5cf6"),
    "--accent": toCssValue(
      colors.secondary,
      config.secondaryColor || "#6366f1",
    ),
    "--bg": toCssValue(
      colors.panelBackground,
      config.backgroundColor || "#ffffff",
    ),
    "--radius": toCssValue(radius.panel, config.borderRadius || "16px"),
    "--font-family": toCssValue(
      typography.fontFamily,
      config.fontFamily ||
        'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    ),
    "--text-primary": toCssValue(
      colors.textPrimary,
      config.textColor || "#455a64",
    ),
    "--text-secondary": toCssValue(colors.textSecondary, "#576e93"),
    "--body-bg": toCssValue(colors.bodyBackground, "#f8f9fb"),
    "--bubble-bg": toCssValue(colors.assistantBubbleBackground, "#ffffff"),
    "--bubble-text": toCssValue(
      colors.assistantBubbleText,
      config.textColor || "#455a64",
    ),
    "--user-bubble-bg": toCssValue(
      colors.userBubbleBackground,
      colors.primary ? toCssValue(colors.primary, "#8b5cf6") : "#8b5cf6",
    ),
    "--user-bubble-text": toCssValue(colors.userBubbleText, "#ffffff"),
    "--input-bg": toCssValue(colors.inputBackground, "#f8f9fb"),
    "--input-text": toCssValue(
      colors.inputText,
      config.textColor || "#455a64",
    ),
    "--input-placeholder": toCssValue(colors.inputPlaceholder, "#9ca3af"),
    "--footer-bg": toCssValue(colors.footerBackground, "#ffffff"),
    "--border-color": toCssValue(colors.borderColor, "#e5e7eb"),
    "--header-bg": toCssValue(
      colors.headerBackground,
      colors.primary ? toCssValue(colors.primary, "#8b5cf6") : "#8b5cf6",
    ),
    "--header-text": toCssValue(colors.headerText, "#ffffff"),
    "--header-subtext": toCssValue(colors.headerSubtext, "rgba(255,255,255,0.9)"),
    "--header-avatar-bg": toCssValue(
      colors.headerAvatarBackground,
      "rgba(255,255,255,0.15)",
    ),
    "--header-action-bg": toCssValue(
      colors.headerActionBackground,
      "rgba(255,255,255,0.15)",
    ),
    "--header-action-hover-bg": toCssValue(
      colors.headerActionHoverBackground,
      "rgba(255,255,255,0.25)",
    ),
    "--fab-bg": toCssValue(
      fab.background ?? buttons.fab?.background ?? colors.fabBackground,
      colors.primary ? toCssValue(colors.primary, "#8b5cf6") : "#8b5cf6",
    ),
    "--fab-text": toCssValue(
      fab.text ?? buttons.fab?.text ?? colors.fabText,
      "#ffffff",
    ),
    "--fab-border-color": toCssValue(
      fab.borderColor ?? buttons.fab?.borderColor,
      fab.background
        ? toCssValue(fab.background, "#8b5cf6")
        : buttons.fab?.background
          ? toCssValue(buttons.fab.background, "#8b5cf6")
          : colors.fabBackground
            ? toCssValue(colors.fabBackground, "#8b5cf6")
            : colors.primary
              ? toCssValue(colors.primary, "#8b5cf6")
              : "#8b5cf6",
    ),
    "--fab-hover-bg": resolveButtonVar(
      fab.hoverBackground ?? buttons.fab?.hoverBackground,
      toCssValue(
        fab.background ?? buttons.fab?.background ?? colors.fabBackground,
        colors.primary ? toCssValue(colors.primary, "#8b5cf6") : "#8b5cf6",
      ),
    ),
    "--fab-hover-text": resolveButtonVar(
      fab.hoverText ?? buttons.fab?.hoverText,
      toCssValue(
        fab.text ?? buttons.fab?.text ?? colors.fabText,
        "#ffffff",
      ),
    ),
    "--fab-hover-border-color": resolveButtonVar(
      fab.hoverBorderColor ?? buttons.fab?.hoverBorderColor,
      toCssValue(
        fab.borderColor ?? buttons.fab?.borderColor,
        fab.background
          ? toCssValue(fab.background, "#8b5cf6")
          : buttons.fab?.background
            ? toCssValue(buttons.fab.background, "#8b5cf6")
            : colors.fabBackground
              ? toCssValue(colors.fabBackground, "#8b5cf6")
              : colors.primary
                ? toCssValue(colors.primary, "#8b5cf6")
                : "#8b5cf6",
      ),
    ),
    "--fab-icon-size": toCssValue(fab.iconSize, "24px"),
    "--fab-icon-color": toCssValue(
      fab.iconColor,
      toCssValue(
        fab.text ?? buttons.fab?.text ?? colors.fabText,
        "#ffffff",
      ),
    ),
    "--fab-icon-bg": toCssValue(fab.iconBackground, "transparent"),
    "--fab-icon-padding": toCssValue(fab.iconPadding, "0px"),
    "--fab-icon-radius": toCssValue(fab.iconRadius, "0px"),
    "--fab-wave-color": toCssValue(
      fabWave.color ??
        fab.background ??
        buttons.fab?.background ??
        colors.fabBackground,
      colors.primary ? toCssValue(colors.primary, "#8b5cf6") : "#8b5cf6",
    ),
    "--fab-wave-opacity": toScalarValue(fabWave.opacity, "0.7"),
    "--fab-wave-duration": toDurationValue(fabWave.duration, "1.3s"),
    "--fab-status-dot-size": toCssValue(fabStatusDot.size, "16px"),
    "--fab-status-dot-top": toCssValue(fabStatusDot.top, "0px"),
    "--fab-status-dot-left": toCssValue(fabStatusDot.left, "0px"),
    "--fab-status-dot-online": toCssValue(
      fabStatusDot.onlineColor,
      "#22c55e",
    ),
    "--fab-status-dot-offline": toCssValue(
      fabStatusDot.offlineColor,
      "#ef4444",
    ),
    "--fab-status-dot-border-color": toCssValue(
      fabStatusDot.borderColor,
      "transparent",
    ),
    "--fab-status-dot-border-width": toCssValue(
      fabStatusDot.borderWidth,
      "0px",
    ),
    "--fab-status-dot-shadow": toCssValue(
      fabStatusDot.shadow,
      "0 1px 3px rgba(44, 44, 44, 0.13)",
    ),
    "--option-bg": toCssValue(
      colors.optionBackground,
      colors.primary ? toCssValue(colors.primary, "#8b5cf6") : "#8b5cf6",
    ),
    "--option-text": toCssValue(colors.optionText, "#ffffff"),
    "--menu-bg": toCssValue(colors.menuBackground, "#ffffff"),
    "--menu-text": toCssValue(colors.menuText, "#455a64"),
    "--menu-border-color": toCssValue(colors.menuBorderColor, "#e5e7eb"),
    "--send-button-bg": toCssValue(
      buttons.send?.background ?? colors.sendButtonBackground,
      colors.primary ? toCssValue(colors.primary, "#8b5cf6") : "#8b5cf6",
    ),
    "--send-button-text": toCssValue(
      buttons.send?.text ?? colors.sendButtonText,
      "#ffffff",
    ),
    "--send-button-border": toCssValue(
      buttons.send?.borderColor,
      "transparent",
    ),
    "--send-button-hover-bg": resolveButtonVar(
      buttons.send?.hoverBackground,
      toCssValue(
        buttons.send?.background ?? colors.sendButtonBackground,
        colors.primary ? toCssValue(colors.primary, "#8b5cf6") : "#8b5cf6",
      ),
    ),
    "--send-button-hover-text": resolveButtonVar(
      buttons.send?.hoverText,
      toCssValue(buttons.send?.text ?? colors.sendButtonText, "#ffffff"),
    ),
    "--send-button-hover-border": resolveButtonVar(
      buttons.send?.hoverBorderColor,
      toCssValue(buttons.send?.borderColor, "transparent"),
    ),
    "--send-button-disabled-bg": toCssValue(
      buttons.send?.disabledBackground ?? colors.sendButtonDisabledBackground,
      "#d1d5db",
    ),
    "--send-button-disabled-text": toCssValue(
      buttons.send?.disabledText,
      "#ffffff",
    ),
    "--send-button-disabled-border": toCssValue(
      buttons.send?.disabledBorderColor,
      "transparent",
    ),
    "--modal-bg": toCssValue(colors.modalBackground, "#ffffff"),
    "--modal-title-text": toCssValue(
      colors.modalTitleText,
      config.textColor || "#455a64",
    ),
    "--modal-text": toCssValue(colors.modalText, "#576e93"),
    "--overlay-bg": toCssValue(colors.overlayBackground, "rgba(0,0,0,0.6)"),
    "--reset-button-bg": toCssValue(
      buttons.modalReset?.background ?? colors.resetButtonBackground,
      "#000000",
    ),
    "--reset-button-text": toCssValue(
      buttons.modalReset?.text ?? colors.resetButtonText,
      "#ffffff",
    ),
    "--reset-button-border": toCssValue(
      buttons.modalReset?.borderColor ?? colors.resetButtonBorder,
      "#000000",
    ),
    "--reset-button-hover-bg": resolveButtonVar(
      buttons.modalReset?.hoverBackground,
      toCssValue(
        buttons.modalReset?.background ?? colors.resetButtonBackground,
        "#000000",
      ),
    ),
    "--reset-button-hover-text": resolveButtonVar(
      buttons.modalReset?.hoverText,
      toCssValue(buttons.modalReset?.text ?? colors.resetButtonText, "#ffffff"),
    ),
    "--reset-button-hover-border": resolveButtonVar(
      buttons.modalReset?.hoverBorderColor,
      toCssValue(
        buttons.modalReset?.borderColor ?? colors.resetButtonBorder,
        "#000000",
      ),
    ),
    "--cancel-button-bg": toCssValue(
      buttons.modalCancel?.background ?? colors.cancelButtonBackground,
      "#ffffff",
    ),
    "--cancel-button-text": toCssValue(
      buttons.modalCancel?.text ?? colors.cancelButtonText,
      config.textColor || "#455a64",
    ),
    "--cancel-button-border": toCssValue(
      buttons.modalCancel?.borderColor ?? colors.cancelButtonBorder,
      "#d1d5db",
    ),
    "--cancel-button-hover-bg": resolveButtonVar(
      buttons.modalCancel?.hoverBackground,
      toCssValue(
        buttons.modalCancel?.background ?? colors.cancelButtonBackground,
        "#ffffff",
      ),
    ),
    "--cancel-button-hover-text": resolveButtonVar(
      buttons.modalCancel?.hoverText,
      toCssValue(
        buttons.modalCancel?.text ?? colors.cancelButtonText,
        config.textColor || "#455a64",
      ),
    ),
    "--cancel-button-hover-border": resolveButtonVar(
      buttons.modalCancel?.hoverBorderColor,
      toCssValue(
        buttons.modalCancel?.borderColor ?? colors.cancelButtonBorder,
        "#d1d5db",
      ),
    ),
    "--header-close-bg": toCssValue(
      buttons.close?.background ?? colors.headerActionBackground,
      "rgba(255,255,255,0.15)",
    ),
    "--header-close-text": toCssValue(
      buttons.close?.text ?? colors.headerText,
      "#ffffff",
    ),
    "--header-close-border": toCssValue(
      buttons.close?.borderColor,
      "transparent",
    ),
    "--header-close-hover-bg": resolveButtonVar(
      buttons.close?.hoverBackground,
      toCssValue(
        buttons.close?.background ?? colors.headerActionHoverBackground,
        "rgba(255,255,255,0.25)",
      ),
    ),
    "--header-close-hover-text": resolveButtonVar(
      buttons.close?.hoverText,
      toCssValue(buttons.close?.text ?? colors.headerText, "#ffffff"),
    ),
    "--header-close-hover-border": resolveButtonVar(
      buttons.close?.hoverBorderColor,
      toCssValue(buttons.close?.borderColor, "transparent"),
    ),
    "--header-reset-bg": toCssValue(
      buttons.headerReset?.background ?? colors.headerActionBackground,
      "rgba(255,255,255,0.15)",
    ),
    "--header-reset-text": toCssValue(
      buttons.headerReset?.text ?? colors.headerText,
      "#ffffff",
    ),
    "--header-reset-border": toCssValue(
      buttons.headerReset?.borderColor,
      "transparent",
    ),
    "--header-reset-hover-bg": resolveButtonVar(
      buttons.headerReset?.hoverBackground,
      toCssValue(
        buttons.headerReset?.background ?? colors.headerActionHoverBackground,
        "rgba(255,255,255,0.25)",
      ),
    ),
    "--header-reset-hover-text": resolveButtonVar(
      buttons.headerReset?.hoverText,
      toCssValue(buttons.headerReset?.text ?? colors.headerText, "#ffffff"),
    ),
    "--header-reset-hover-border": resolveButtonVar(
      buttons.headerReset?.hoverBorderColor,
      toCssValue(buttons.headerReset?.borderColor, "transparent"),
    ),
    "--menu-toggle-bg": toCssValue(
      buttons.menuToggle?.background,
      "transparent",
    ),
    "--menu-toggle-text": toCssValue(
      buttons.menuToggle?.text ?? colors.menuText,
      "#455a64",
    ),
    "--menu-toggle-border": toCssValue(
      buttons.menuToggle?.borderColor,
      "transparent",
    ),
    "--menu-toggle-hover-bg": resolveButtonVar(
      buttons.menuToggle?.hoverBackground,
      "rgba(0,0,0,0.06)",
    ),
    "--menu-toggle-hover-text": resolveButtonVar(
      buttons.menuToggle?.hoverText,
      toCssValue(buttons.menuToggle?.text ?? colors.menuText, "#455a64"),
    ),
    "--menu-toggle-hover-border": resolveButtonVar(
      buttons.menuToggle?.hoverBorderColor,
      toCssValue(buttons.menuToggle?.borderColor, "transparent"),
    ),
    "--multi-confirm-bg": toCssValue(
      buttons.multiConfirm?.background,
      "transparent",
    ),
    "--multi-confirm-text": toCssValue(
      buttons.multiConfirm?.text,
      toCssValue(colors.primary, "#8b5cf6"),
    ),
    "--multi-confirm-border": toCssValue(
      buttons.multiConfirm?.borderColor,
      toCssValue(colors.primary, "#8b5cf6"),
    ),
    "--multi-confirm-hover-bg": resolveButtonVar(
      buttons.multiConfirm?.hoverBackground,
      toCssValue(colors.primary, "#8b5cf6"),
    ),
    "--multi-confirm-hover-text": resolveButtonVar(
      buttons.multiConfirm?.hoverText,
      "#ffffff",
    ),
    "--multi-confirm-hover-border": resolveButtonVar(
      buttons.multiConfirm?.hoverBorderColor,
      toCssValue(colors.primary, "#8b5cf6"),
    ),
    "--multi-confirm-disabled-bg": toCssValue(
      buttons.multiConfirm?.disabledBackground,
      "transparent",
    ),
    "--multi-confirm-disabled-text": toCssValue(
      buttons.multiConfirm?.disabledText,
      toCssValue(colors.primary, "#8b5cf6"),
    ),
    "--multi-confirm-disabled-border": toCssValue(
      buttons.multiConfirm?.disabledBorderColor,
      toCssValue(colors.primary, "#8b5cf6"),
    ),
    "--success-color": toCssValue(colors.success, "#22c55e"),
    "--error-color": toCssValue(colors.error, "#ef4444"),
    "--warning-color": toCssValue(colors.warning, "#f59e0b"),
    "--scrollbar-thumb": toCssValue(colors.scrollbarThumb, "rgba(139,92,246,0.2)"),
    "--scrollbar-thumb-hover": toCssValue(
      colors.scrollbarThumbHover,
      "rgba(139,92,246,0.3)",
    ),
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
    "--mobile-fab-size": toCssValue(
      fab.mobileSize ?? layout.mobileFabSize,
      "54px",
    ),
    "--fab-wave-size": toCssValue(fabWave.size ?? layout.fabWaveSize, "64px"),
    "--fab-border-width": toCssValue(
      fab.borderWidth ?? layout.fabBorderWidth,
      "3px",
    ),
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
    "--header-shadow": toCssValue(
      shadows.header,
      "0 2px 8px rgba(0, 0, 0, 0.06)",
    ),
    "--fab-shadow": toCssValue(
      fab.shadow ?? shadows.fab,
      "0 4px 16px rgba(139, 92, 246, 0.4)",
    ),
    "--fab-hover-shadow": toCssValue(
      fab.hoverShadow ?? shadows.fabHover,
      "0 6px 20px rgba(139, 92, 246, 0.5)",
    ),
    "--assistant-bubble-shadow": toCssValue(
      shadows.assistantBubble,
      "0 1px 4px rgba(0, 0, 0, 0.04)",
    ),
    "--user-bubble-shadow": toCssValue(
      shadows.userBubble,
      "0 2px 8px rgba(139, 92, 246, 0.25)",
    ),
    "--option-shadow": toCssValue(
      shadows.option,
      "0 2px 6px rgba(139, 92, 246, 0.2)",
    ),
    "--option-hover-shadow": toCssValue(
      shadows.optionHover,
      "0 4px 12px rgba(139, 92, 246, 0.3)",
    ),
    "--input-shadow": toCssValue(shadows.input, "0 1px 3px rgba(0, 0, 0, 0.04)"),
    "--input-focus-shadow": toCssValue(
      shadows.inputFocus,
      "0 0 0 3px rgba(139, 92, 246, 0.08)",
    ),
    "--send-button-shadow": toCssValue(
      shadows.sendButton,
      "0 2px 6px rgba(139, 92, 246, 0.25)",
    ),
    "--menu-shadow": toCssValue(
      shadows.menu,
      "0 3px 20px rgba(21, 38, 194, 0.3)",
    ),
    "--dropdown-shadow": toCssValue(
      shadows.dropdown,
      "0 10px 30px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.06)",
    ),
    "--modal-shadow": toCssValue(
      shadows.modal,
      "0 10px 30px rgba(0, 0, 0, 0.2)",
    ),
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

export function buildThemeVariableDeclarations(config: ChatbotConfig): string {
  return Object.entries(resolveThemeVariables(config))
    .map(([key, value]) => `${key}: ${value};`)
    .join("\n        ");
}

export function applyThemeVariables(
  element: HTMLElement,
  config: ChatbotConfig,
): void {
  const variables = resolveThemeVariables(config);
  Object.entries(variables).forEach(([key, value]) => {
    element.style.setProperty(key, value);
  });
}

export function resolveFabIcon(
  config: ChatbotConfig,
): RenderableIcon | undefined {
  return config.theme?.fab?.icon ?? config.chatIcon;
}

export function shouldShowFabWave(config: ChatbotConfig): boolean {
  return config.theme?.fab?.wave?.enabled !== false;
}

export function shouldShowFabStatusDot(config: ChatbotConfig): boolean {
  return config.theme?.fab?.statusDot?.enabled !== false;
}
