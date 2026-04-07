(() => {
  const LIBRARY_SRC = "../dist/umd/index.js";
  const FLOW_KEYS = {
    step: "chatFlowStep",
    data: "chatFlowData",
    userId: "chatbot_demo_user_id",
  };

  const FLOW_STEPS = {
    service: "service",
    name: "name",
    email: "email",
    phone: "phone",
    interests: "interests",
    timeline: "timeline",
    notes: "notes",
    complete: "complete",
  };
  const INTRO_MESSAGE =
    "Welcome. This demo shows the widget's local-storage flow, hooks, input modes, option selection, custom menu actions, and full theme configuration.";

  const createIconNode = (
    label,
    {
      background = "#111827",
      color = "#ffffff",
      size = 22,
      radius = "8px",
      fontSize = "12px",
    } = {},
  ) => {
    const node = document.createElement("span");
    node.textContent = label;
    Object.assign(node.style, {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: radius,
      background,
      color,
      fontSize,
      fontWeight: "700",
      lineHeight: "1",
      boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)",
    });
    return node;
  };

  const createStrokeIcon = (pathMarkup) => `
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      ${pathMarkup}
    </svg>
  `;

  const DEMO_CHAT_ICON_NODE = createIconNode("AI", {
    background: "linear-gradient(135deg, #0f766e 0%, #155e75 100%)",
    color: "#ffffff",
    size: 26,
    radius: "999px",
    fontSize: "10px",
  });

  const DEMO_BOT_ICON_NODE = createIconNode("BOT", {
    background: "#ffffff",
    color: "#0f766e",
    size: 24,
    radius: "999px",
    fontSize: "8px",
  });

  const MENU_DOCS_ICON_NODE = createIconNode("D", {
    background: "#e0f2fe",
    color: "#0f4c81",
    size: 20,
    radius: "6px",
    fontSize: "11px",
  });

  const MENU_SUMMARY_ICON_SVG = createStrokeIcon(
    '<path d="M8 6h8"/><path d="M8 12h8"/><path d="M8 18h5"/><path d="M6 3h12a1 1 0 0 1 1 1v16l-3-2-3 2-3-2-3 2V4a1 1 0 0 1 1-1z"/>',
  );

  const MENU_THEME_ICON_SVG = createStrokeIcon(
    '<path d="M12 3v3"/><path d="M12 18v3"/><path d="M3 12h3"/><path d="M18 12h3"/><path d="m5.64 5.64 2.12 2.12"/><path d="m16.24 16.24 2.12 2.12"/><path d="m5.64 18.36 2.12-2.12"/><path d="m16.24 7.76 2.12-2.12"/><circle cx="12" cy="12" r="3.5"/>',
  );

  const SERVICE_OPTIONS = [
    {
      id: "support",
      text: "Customer support assistant",
      value: "customer-support",
    },
    {
      id: "sales",
      text: "Sales qualification bot",
      value: "sales-qualification",
    },
    {
      id: "onboarding",
      text: "Employee onboarding helper",
      value: "employee-onboarding",
    },
    {
      id: "knowledge",
      text: "Internal knowledge base guide",
      value: "knowledge-base",
    },
  ];

  const FEATURE_OPTIONS = [
    { id: "storage", text: "Local storage persistence" },
    { id: "hooks", text: "Hooks and completion callbacks" },
    { id: "options", text: "Single and multi-select messages" },
    { id: "inputs", text: "Text, email and phone inputs" },
    { id: "menu", text: "Input menu actions" },
    {
      id: "themes",
      text: "Full theme config with button styling, FAB overrides, and icon switching",
    },
  ];

  const TIMELINE_OPTIONS = [
    { id: "today", text: "Today" },
    { id: "week", text: "This week" },
    { id: "month", text: "This month" },
    { id: "research", text: "Just researching" },
  ];

  const THEME_PRESETS = {
    lagoon: {
      label: "Lagoon",
      config: {
        primaryColor: "#0f766e",
        secondaryColor: "#38bdf8",
        backgroundColor: "#fcfffe",
        borderRadius: "24px",
        fontFamily: '"Trebuchet MS", "Gill Sans", sans-serif',
        theme: {
          colors: {
            primary: "#0f766e",
            secondary: "#38bdf8",
            panelBackground: "#fcfffe",
            bodyBackground: "#eef8f7",
            footerBackground: "#ffffff",
            headerBackground:
              "linear-gradient(135deg, #0f766e 0%, #155e75 100%)",
            headerText: "#f8fffe",
            headerSubtext: "rgba(248,255,254,0.82)",
            headerAvatarBackground: "rgba(255,255,255,0.14)",
            headerActionBackground: "rgba(255,255,255,0.12)",
            headerActionHoverBackground: "rgba(255,255,255,0.2)",
            textPrimary: "#24434a",
            textSecondary: "#5d7f85",
            assistantBubbleBackground: "#ffffff",
            assistantBubbleText: "#24434a",
            userBubbleBackground: "#0f766e",
            userBubbleText: "#ffffff",
            inputBackground: "#f2fbf8",
            inputText: "#24434a",
            inputPlaceholder: "#7ca1a7",
            borderColor: "#d4ebe6",
            fabBackground: "#0f766e",
            fabText: "#ffffff",
            optionBackground: "#0f766e",
            optionText: "#ffffff",
            menuBackground: "#ffffff",
            menuText: "#24434a",
            menuBorderColor: "#d7e9e3",
            sendButtonBackground: "#0f766e",
            sendButtonText: "#ffffff",
            modalBackground: "#ffffff",
            modalTitleText: "#163238",
            modalText: "#5d7f85",
            overlayBackground: "rgba(12, 27, 34, 0.58)",
            resetButtonBackground: "#163238",
            resetButtonText: "#ffffff",
            resetButtonBorder: "#163238",
            cancelButtonBackground: "#ffffff",
            cancelButtonText: "#24434a",
            cancelButtonBorder: "#c8ded9",
            success: "#4ade80",
            error: "#ef4444",
            warning: "#f59e0b",
            scrollbarThumb: "rgba(15, 118, 110, 0.24)",
            scrollbarThumbHover: "rgba(15, 118, 110, 0.36)",
          },
          typography: {
            fontFamily: '"Trebuchet MS", "Gill Sans", sans-serif',
            titleSize: "16px",
            subtitleSize: "13px",
            messageSize: "14px",
            inputSize: "15px",
            optionSize: "14px",
            captionSize: "12px",
            titleWeight: 700,
            subtitleWeight: 600,
            messageWeight: 600,
            lineHeight: "1.5",
          },
          layout: {
            panelWidth: "400px",
            panelHeight: "680px",
            panelMaxHeight: "88vh",
            fabSize: "60px",
            fabWaveSize: "70px",
            headerAvatarSize: "44px",
            headerActionSize: "36px",
            botAvatarSize: "24px",
            sendButtonSize: "36px",
            menuToggleSize: "34px",
            menuWidth: "300px",
            modalWidth: "320px",
            messageMaxWidth: "82%",
            optionMinWidth: "28ch",
          },
          spacing: {
            headerPadding: "16px 18px",
            bodyPadding: "18px",
            footerPadding: "14px 16px",
            bubblePadding: "13px 16px",
            optionPadding: "10px 12px",
            inputPaddingX: "14px",
            menuPadding: "16px",
            menuItemPadding: "12px",
            modalPadding: "26px",
            countryPickerPadding: "9px 12px",
            headerGap: "14px",
            bodyGap: "10px",
            messageGap: "4px",
            optionGap: "9px",
          },
          radius: {
            panel: "24px",
            fab: "18px",
            bubble: "18px",
            bubbleTail: "6px",
            input: "14px",
            button: "12px",
            option: "10px",
            menu: "14px",
            modal: "20px",
            headerAction: "10px",
          },
          shadows: {
            panel: "0 22px 60px rgba(15, 58, 68, 0.18)",
            header: "0 8px 20px rgba(15, 118, 110, 0.18)",
            fab: "0 14px 32px rgba(15, 118, 110, 0.35)",
            fabHover: "0 18px 40px rgba(15, 118, 110, 0.42)",
            assistantBubble: "0 8px 20px rgba(18, 34, 42, 0.06)",
            userBubble: "0 10px 22px rgba(15, 118, 110, 0.24)",
            option: "0 10px 20px rgba(15, 118, 110, 0.18)",
            optionHover: "0 14px 28px rgba(15, 118, 110, 0.26)",
            input: "0 6px 16px rgba(15, 45, 56, 0.05)",
            inputFocus: "0 0 0 4px rgba(15, 118, 110, 0.14)",
            sendButton: "0 10px 22px rgba(15, 118, 110, 0.28)",
            menu: "0 18px 42px rgba(15, 58, 68, 0.18)",
            dropdown: "0 22px 50px rgba(15, 58, 68, 0.16)",
            modal: "0 26px 60px rgba(0, 0, 0, 0.22)",
          },
          buttons: {
            send: {
              background: "#0f766e",
              text: "#ffffff",
              borderColor: "#0f766e",
              hoverBackground: "#115e59",
              hoverText: "#ffffff",
              hoverBorderColor: "#115e59",
            },
            menuToggle: {
              background: "#effbf7",
              text: "#0f766e",
              borderColor: "#cceae3",
              hoverBackground: "#d9f6ef",
              hoverText: "#0f766e",
              hoverBorderColor: "#b3ddd4",
            },
            close: {
              background: "rgba(255,255,255,0.12)",
              text: "#f8fffe",
              borderColor: "rgba(255,255,255,0.1)",
              hoverBackground: "#dc2626",
              hoverText: "#ffffff",
              hoverBorderColor: "#dc2626",
            },
            headerReset: {
              background: "rgba(255,255,255,0.12)",
              text: "#f8fffe",
              borderColor: "rgba(255,255,255,0.1)",
              hoverBackground: "#f59e0b",
              hoverText: "#173036",
              hoverBorderColor: "#f59e0b",
            },
            multiConfirm: {
              background: "#ffffff",
              text: "#0f766e",
              borderColor: "#0f766e",
              hoverBackground: "#0f766e",
              hoverText: "#ffffff",
              hoverBorderColor: "#0f766e",
            },
            modalReset: {
              background: "#163238",
              text: "#ffffff",
              borderColor: "#163238",
              hoverBackground: "#0f766e",
              hoverText: "#ffffff",
              hoverBorderColor: "#0f766e",
            },
            modalCancel: {
              background: "#ffffff",
              text: "#24434a",
              borderColor: "#c8ded9",
              hoverBackground: "#eef8f7",
              hoverText: "#24434a",
              hoverBorderColor: "#9ecac1",
            },
          },
          fab: {
            icon: () =>
              createIconNode("AI", {
                background: "#ffffff",
                color: "#0f766e",
                size: 22,
                radius: "999px",
                fontSize: "9px",
              }),
            iconSize: "26px",
            iconBackground: "rgba(255,255,255,0.08)",
            iconPadding: "4px",
            iconRadius: "999px",
            wave: {
              color: "rgba(15, 118, 110, 0.28)",
              size: "78px",
              duration: "1.6s",
            },
            statusDot: {
              size: "14px",
              top: "2px",
              left: "2px",
              borderColor: "#effcf9",
              borderWidth: "2px",
            },
          },
          icons: {
            send: createStrokeIcon(
              '<path d="M3 12h14"/><path d="m13 5 7 7-7 7"/>',
            ),
            close: createStrokeIcon(
              '<path d="M6 6l12 12"/><path d="M18 6 6 18"/>',
            ),
            headerReset: "↺",
            menu: createIconNode("≡", {
              background: "#ffffff",
              color: "#0f766e",
              size: 18,
              radius: "4px",
              fontSize: "12px",
            }),
            menuClose: "✕",
            multiConfirm: "✓",
            modalReset: "↺",
            modalCancel: "−",
          },
        },
      },
    },
    editorial: {
      label: "Editorial",
      config: {
        primaryColor: "#8a3b12",
        secondaryColor: "#d97706",
        backgroundColor: "#fffdf8",
        borderRadius: "10px",
        fontFamily: 'Georgia, "Times New Roman", serif',
        theme: {
          colors: {
            primary: "#8a3b12",
            secondary: "#d97706",
            panelBackground: "#fffdf8",
            bodyBackground: "#f6efe5",
            footerBackground: "#fffaf2",
            headerBackground:
              "linear-gradient(135deg, #2f241f 0%, #6f2d14 100%)",
            headerText: "#fff8ef",
            headerSubtext: "rgba(255, 248, 239, 0.75)",
            textPrimary: "#3d2c24",
            textSecondary: "#7c6255",
            assistantBubbleBackground: "#fff7ec",
            assistantBubbleText: "#3d2c24",
            userBubbleBackground: "#8a3b12",
            userBubbleText: "#fffaf5",
            inputBackground: "#fff8ef",
            inputText: "#3d2c24",
            inputPlaceholder: "#9f7f70",
            borderColor: "#e6d5c2",
            fabBackground: "#8a3b12",
            optionBackground: "#6f2d14",
            optionText: "#fff8ef",
            menuBackground: "#fffaf2",
            menuText: "#3d2c24",
            menuBorderColor: "#e2d2bf",
            sendButtonBackground: "#8a3b12",
            modalBackground: "#fffaf2",
            modalTitleText: "#3d2c24",
            modalText: "#7c6255",
            overlayBackground: "rgba(35, 20, 14, 0.64)",
            resetButtonBackground: "#2f241f",
            resetButtonText: "#fffaf2",
            resetButtonBorder: "#2f241f",
            cancelButtonBackground: "#fffaf2",
            cancelButtonText: "#3d2c24",
            cancelButtonBorder: "#d6c4b2",
            scrollbarThumb: "rgba(138, 59, 18, 0.24)",
            scrollbarThumbHover: "rgba(138, 59, 18, 0.36)",
          },
          typography: {
            fontFamily: 'Georgia, "Times New Roman", serif',
            titleSize: "17px",
            subtitleSize: "12px",
            messageSize: "15px",
            inputSize: "16px",
            optionSize: "15px",
            captionSize: "12px",
            titleWeight: 700,
            subtitleWeight: 500,
            messageWeight: 600,
            lineHeight: "1.58",
          },
          layout: {
            panelWidth: "420px",
            panelHeight: "700px",
            panelMaxHeight: "90vh",
            fabSize: "58px",
            fabWaveSize: "72px",
            headerAvatarSize: "42px",
            headerActionSize: "34px",
            botAvatarSize: "24px",
            sendButtonSize: "38px",
            menuWidth: "320px",
            modalWidth: "340px",
            messageMaxWidth: "84%",
          },
          spacing: {
            headerPadding: "18px 20px 14px",
            bodyPadding: "20px",
            footerPadding: "14px 18px",
            bubblePadding: "14px 18px",
            optionPadding: "12px 14px",
            inputPaddingX: "16px",
            menuPadding: "18px",
            menuItemPadding: "14px",
            modalPadding: "28px",
            headerGap: "16px",
            bodyGap: "12px",
            optionGap: "10px",
          },
          radius: {
            panel: "10px",
            fab: "18px",
            bubble: "20px",
            bubbleTail: "6px",
            input: "16px",
            button: "12px",
            option: "12px",
            menu: "12px",
            modal: "18px",
            headerAction: "10px",
          },
          shadows: {
            panel: "0 24px 70px rgba(58, 32, 16, 0.18)",
            header: "0 10px 24px rgba(47, 36, 31, 0.22)",
            fab: "0 16px 34px rgba(111, 45, 20, 0.28)",
            fabHover: "0 20px 42px rgba(111, 45, 20, 0.34)",
            assistantBubble: "0 10px 24px rgba(76, 49, 35, 0.07)",
            userBubble: "0 12px 26px rgba(138, 59, 18, 0.26)",
            option: "0 10px 22px rgba(111, 45, 20, 0.18)",
            optionHover: "0 16px 30px rgba(111, 45, 20, 0.24)",
            input: "0 8px 20px rgba(70, 40, 18, 0.05)",
            inputFocus: "0 0 0 4px rgba(138, 59, 18, 0.14)",
            sendButton: "0 10px 24px rgba(138, 59, 18, 0.22)",
            menu: "0 20px 48px rgba(58, 32, 16, 0.16)",
            dropdown: "0 24px 56px rgba(58, 32, 16, 0.14)",
            modal: "0 28px 70px rgba(35, 20, 14, 0.24)",
          },
          buttons: {
            send: {
              background: "#8a3b12",
              text: "#fffaf2",
              borderColor: "#8a3b12",
              hoverBackground: "#6f2d14",
              hoverText: "#fffaf2",
              hoverBorderColor: "#6f2d14",
            },
            menuToggle: {
              background: "#fff3df",
              text: "#8a3b12",
              borderColor: "#e4cfb0",
              hoverBackground: "#f7e7cf",
              hoverText: "#6f2d14",
              hoverBorderColor: "#d7bb93",
            },
            close: {
              background: "rgba(255,248,239,0.1)",
              text: "#fff8ef",
              borderColor: "rgba(255,248,239,0.08)",
              hoverBackground: "#7f1d1d",
              hoverText: "#fff8ef",
              hoverBorderColor: "#7f1d1d",
            },
            headerReset: {
              background: "rgba(255,248,239,0.1)",
              text: "#fff8ef",
              borderColor: "rgba(255,248,239,0.08)",
              hoverBackground: "#d97706",
              hoverText: "#2f241f",
              hoverBorderColor: "#d97706",
            },
            multiConfirm: {
              background: "#fffaf2",
              text: "#8a3b12",
              borderColor: "#8a3b12",
              hoverBackground: "#8a3b12",
              hoverText: "#fffaf2",
              hoverBorderColor: "#8a3b12",
            },
            modalReset: {
              background: "#2f241f",
              text: "#fffaf2",
              borderColor: "#2f241f",
              hoverBackground: "#8a3b12",
              hoverText: "#fffaf2",
              hoverBorderColor: "#8a3b12",
            },
            modalCancel: {
              background: "#fffaf2",
              text: "#3d2c24",
              borderColor: "#d6c4b2",
              hoverBackground: "#f6efe5",
              hoverText: "#3d2c24",
              hoverBorderColor: "#c7af98",
            },
          },
          fab: {
            icon: createStrokeIcon(
              '<path d="M5 11a7 7 0 0 1 14 0v3a2 2 0 0 1-2 2H9l-4 3V11Z"/>',
            ),
            iconSize: "22px",
            iconColor: "#fff8ef",
            iconBackground: "rgba(255,248,239,0.08)",
            iconPadding: "6px",
            iconRadius: "999px",
            radius: "20px",
            wave: {
              enabled: true,
            },
            statusDot: {
              size: "14px",
              top: "3px",
              left: "3px",
              borderColor: "#fffaf2",
              borderWidth: "2px",
            },
          },
          icons: {
            send: "➤",
            close: "×",
            headerReset: "⟲",
            menu: `<img src="https://custpostimages.s3.ap-south-1.amazonaws.com/sb_images/headder_menu_icon_new_sb.svg" alt="Menu" style="width:18px;height:18px;object-fit:contain;">`,
            menuClose: `<img src="https://s3.ap-south-1.amazonaws.com/custpostimages/ss_images/close_modal.png" alt="Close" style="width:18px;height:18px;object-fit:contain;">`,
            multiConfirm: "◆",
            modalReset: "◆",
            modalCancel: "•",
          },
        },
      },
    },
    terminal: {
      label: "Terminal",
      config: {
        primaryColor: "#22c55e",
        secondaryColor: "#06b6d4",
        backgroundColor: "#0a0f0d",
        borderRadius: "8px",
        fontFamily: '"Courier New", "Lucida Console", monospace',
        theme: {
          colors: {
            primary: "#22c55e",
            secondary: "#06b6d4",
            panelBackground: "#0a0f0d",
            bodyBackground: "#07110c",
            footerBackground: "#09120d",
            headerBackground:
              "linear-gradient(135deg, #0f1f17 0%, #103324 100%)",
            headerText: "#d3ffe3",
            headerSubtext: "rgba(211, 255, 227, 0.72)",
            headerAvatarBackground: "rgba(34, 197, 94, 0.16)",
            headerActionBackground: "rgba(34, 197, 94, 0.12)",
            headerActionHoverBackground: "rgba(34, 197, 94, 0.22)",
            textPrimary: "#bef7d1",
            textSecondary: "#79b892",
            assistantBubbleBackground: "#101a14",
            assistantBubbleText: "#bef7d1",
            userBubbleBackground: "#164e2f",
            userBubbleText: "#d8ffe8",
            inputBackground: "#0f1713",
            inputText: "#d6ffe6",
            inputPlaceholder: "#66a582",
            borderColor: "#1b3427",
            fabBackground: "#164e2f",
            optionBackground: "#164e2f",
            optionText: "#d8ffe8",
            menuBackground: "#09120d",
            menuText: "#d6ffe6",
            menuBorderColor: "#1b3427",
            sendButtonBackground: "#22c55e",
            sendButtonText: "#041008",
            modalBackground: "#0e1712",
            modalTitleText: "#d8ffe8",
            modalText: "#79b892",
            overlayBackground: "rgba(1, 8, 5, 0.8)",
            resetButtonBackground: "#22c55e",
            resetButtonText: "#041008",
            resetButtonBorder: "#22c55e",
            cancelButtonBackground: "#0e1712",
            cancelButtonText: "#d8ffe8",
            cancelButtonBorder: "#28543d",
            success: "#22c55e",
            error: "#f87171",
            warning: "#facc15",
            scrollbarThumb: "rgba(34, 197, 94, 0.26)",
            scrollbarThumbHover: "rgba(34, 197, 94, 0.38)",
          },
          typography: {
            fontFamily: '"Courier New", "Lucida Console", monospace',
            titleSize: "15px",
            subtitleSize: "11px",
            messageSize: "13px",
            inputSize: "14px",
            optionSize: "13px",
            captionSize: "11px",
            titleWeight: 700,
            subtitleWeight: 500,
            messageWeight: 600,
            lineHeight: "1.55",
          },
          layout: {
            panelWidth: "430px",
            panelHeight: "720px",
            panelMaxHeight: "92vh",
            mobilePanelHeight: "94vh",
            fabSize: "58px",
            fabWaveSize: "68px",
            headerAvatarSize: "40px",
            headerActionSize: "34px",
            botAvatarSize: "22px",
            sendButtonSize: "36px",
            menuWidth: "320px",
            countryDropdownWidth: "380px",
            modalWidth: "330px",
            messageMaxWidth: "86%",
            optionMinWidth: "26ch",
          },
          spacing: {
            headerPadding: "14px 16px",
            bodyPadding: "16px",
            footerPadding: "12px 14px",
            bubblePadding: "12px 14px",
            optionPadding: "10px 12px",
            inputPaddingX: "14px",
            menuPadding: "14px",
            menuItemPadding: "12px",
            modalPadding: "24px",
            headerGap: "12px",
            bodyGap: "10px",
            optionGap: "8px",
          },
          radius: {
            panel: "8px",
            fab: "16px",
            bubble: "12px",
            bubbleTail: "4px",
            input: "10px",
            button: "10px",
            option: "8px",
            menu: "8px",
            modal: "12px",
            headerAction: "8px",
          },
          shadows: {
            panel: "0 20px 50px rgba(0, 0, 0, 0.45)",
            header: "0 8px 18px rgba(0, 0, 0, 0.28)",
            fab: "0 14px 30px rgba(34, 197, 94, 0.2)",
            fabHover: "0 18px 36px rgba(34, 197, 94, 0.3)",
            assistantBubble: "0 8px 18px rgba(0, 0, 0, 0.22)",
            userBubble: "0 12px 24px rgba(22, 78, 47, 0.32)",
            option: "0 10px 20px rgba(22, 78, 47, 0.22)",
            optionHover: "0 14px 28px rgba(22, 78, 47, 0.3)",
            input: "0 6px 14px rgba(0, 0, 0, 0.18)",
            inputFocus: "0 0 0 4px rgba(34, 197, 94, 0.16)",
            sendButton: "0 10px 22px rgba(34, 197, 94, 0.24)",
            menu: "0 18px 44px rgba(0, 0, 0, 0.38)",
            dropdown: "0 20px 48px rgba(0, 0, 0, 0.42)",
            modal: "0 26px 64px rgba(0, 0, 0, 0.52)",
          },
          buttons: {
            send: {
              background: "#22c55e",
              text: "#041008",
              borderColor: "#22c55e",
              hoverBackground: "#16a34a",
              hoverText: "#041008",
              hoverBorderColor: "#16a34a",
            },
            menuToggle: {
              background: "#0f1713",
              text: "#22c55e",
              borderColor: "#28543d",
              hoverBackground: "#163221",
              hoverText: "#7ef0aa",
              hoverBorderColor: "#22c55e",
            },
            close: {
              background: "rgba(34,197,94,0.08)",
              text: "#7ef0aa",
              borderColor: "rgba(34,197,94,0.12)",
              hoverBackground: "#7f1d1d",
              hoverText: "#ffe2e2",
              hoverBorderColor: "#f87171",
            },
            headerReset: {
              background: "rgba(34,197,94,0.08)",
              text: "#7ef0aa",
              borderColor: "rgba(34,197,94,0.12)",
              hoverBackground: "#14532d",
              hoverText: "#d8ffe8",
              hoverBorderColor: "#22c55e",
            },
            multiConfirm: {
              background: "#09120d",
              text: "#7ef0aa",
              borderColor: "#22c55e",
              hoverBackground: "#22c55e",
              hoverText: "#041008",
              hoverBorderColor: "#22c55e",
            },
            modalReset: {
              background: "#22c55e",
              text: "#041008",
              borderColor: "#22c55e",
              hoverBackground: "#16a34a",
              hoverText: "#041008",
              hoverBorderColor: "#16a34a",
            },
            modalCancel: {
              background: "#0e1712",
              text: "#d8ffe8",
              borderColor: "#28543d",
              hoverBackground: "#122019",
              hoverText: "#d8ffe8",
              hoverBorderColor: "#22c55e",
            },
          },
          fab: {
            icon: "$_",
            iconSize: "18px",
            iconColor: "#bef7d1",
            size: "56px",
            mobileSize: "52px",
            borderWidth: "2px",
            radius: "10px",
            wave: {
              color: "rgba(34, 197, 94, 0.22)",
              opacity: 0.5,
              duration: "1.8s",
            },
            statusDot: {
              enabled: false,
            },
          },
          icons: {
            send: ">",
            close: "⌫",
            headerReset: "↻",
            menu: "≡",
            menuClose: "×",
            multiConfirm: ">",
            modalReset: "↻",
            modalCancel: "_",
          },
        },
      },
    },
  };
  const DEFAULT_THEME_ID = "default";
  const DEFAULT_THEME_META = {
    id: DEFAULT_THEME_ID,
    label: "Default",
    config: null,
  };

  let activeThemeId = DEFAULT_THEME_ID;
  let bot = null;
  let stopAutoOpen = null;

  const onReady = (callback) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
      return;
    }

    callback();
  };

  const loadChatbotLibrary = () =>
    new Promise((resolve, reject) => {
      if (window.UniversalChatbot?.Chatbot) {
        resolve(window.UniversalChatbot);
        return;
      }

      const existingScript = document.querySelector(
        `script[data-chatbot-lib="${LIBRARY_SRC}"]`,
      );

      if (existingScript) {
        existingScript.addEventListener("load", () =>
          resolve(window.UniversalChatbot),
        );
        existingScript.addEventListener("error", () =>
          reject(new Error(`Failed to load ${LIBRARY_SRC}`)),
        );
        return;
      }

      const script = document.createElement("script");
      script.src = LIBRARY_SRC;
      script.async = true;
      script.dataset.chatbotLib = LIBRARY_SRC;
      script.onload = () => resolve(window.UniversalChatbot);
      script.onerror = () =>
        reject(new Error(`Failed to load chatbot library from ${LIBRARY_SRC}`));
      document.head.appendChild(script);
    });

  const safeStorage = {
    get(storage, key, fallback = null) {
      try {
        const value = storage.getItem(key);
        return value == null ? fallback : value;
      } catch {
        return fallback;
      }
    },
    set(storage, key, value) {
      try {
        storage.setItem(key, value);
      } catch {
        // Ignore storage failures in the demo.
      }
    },
    remove(storage, key) {
      try {
        storage.removeItem(key);
      } catch {
        // Ignore storage failures in the demo.
      }
    },
  };

  const getFlowStep = () =>
    safeStorage.get(sessionStorage, FLOW_KEYS.step, "") || "";

  const setFlowStep = (step) =>
    safeStorage.set(sessionStorage, FLOW_KEYS.step, step);

  const readFlowData = () => {
    const raw = safeStorage.get(sessionStorage, FLOW_KEYS.data, "{}");
    try {
      return JSON.parse(raw || "{}");
    } catch {
      return {};
    }
  };

  const writeFlowData = (data) => {
    safeStorage.set(sessionStorage, FLOW_KEYS.data, JSON.stringify(data || {}));
  };

  const patchFlowData = (updates) => {
    const nextData = {
      ...readFlowData(),
      ...updates,
    };
    writeFlowData(nextData);
    return nextData;
  };

  const resetFlowState = () => {
    safeStorage.remove(sessionStorage, FLOW_KEYS.step);
    safeStorage.remove(sessionStorage, FLOW_KEYS.data);
  };

  const getOrCreateUserId = () => {
    const existing = safeStorage.get(sessionStorage, FLOW_KEYS.userId, "");
    if (existing) return existing;

    const created = `demo_user_${Math.random().toString(36).slice(2, 10)}`;
    safeStorage.set(sessionStorage, FLOW_KEYS.userId, created);
    return created;
  };

  const parseIncomingMessage = (message) => {
    if (typeof message === "string") {
      return {
        text: message.trim(),
        optionId: "",
        optionText: "",
        optionIds: [],
        optionTexts: [],
      };
    }

    if (!message || typeof message !== "object") {
      return {
        text: "",
        optionId: "",
        optionText: "",
        optionIds: [],
        optionTexts: [],
      };
    }

    return {
      text:
        typeof message.content === "string"
          ? message.content.trim()
          : String(message.content || "").trim(),
      optionId: String(message.optionId || ""),
      optionText: String(message.optionText || ""),
      optionIds: Array.isArray(message.optionIds)
        ? message.optionIds.map((id) => String(id))
        : [],
      optionTexts: Array.isArray(message.optionTexts)
        ? message.optionTexts.map((text) => String(text))
        : [],
    };
  };

  const validators = {
    name(value) {
      return /^[A-Za-z][A-Za-z\s'-]{1,49}$/.test(value);
    },
    email(value) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    },
    phone(value) {
      const normalized = value.replace(/[^\d+]/g, "");
      const digitsOnly = normalized.replace(/^\+/, "");
      return /^\+?\d{7,15}$/.test(normalized) && !/^(\d)\1+$/.test(digitsOnly);
    },
  };

  const resolveAutoOpenHelper = async (chatbotLib) => {
    const exportedHelper = chatbotLib?.autoOpenChatbotTTL;
    if (typeof exportedHelper !== "function") {
      return null;
    }

    if (exportedHelper.length === 0) {
      try {
        const resolved = await exportedHelper();
        return typeof resolved === "function" ? resolved : null;
      } catch (error) {
        console.warn(
          "Failed to resolve autoOpenChatbotTTL from UMD bundle:",
          error,
        );
        return null;
      }
    }

    return exportedHelper;
  };

  const buildSummary = (data) =>
    [
      `Name: ${data.name || "N/A"}`,
      `Email: ${data.email || "N/A"}`,
      `Phone: ${data.phone || "N/A"}`,
      `Use case: ${data.serviceLabel || "N/A"}`,
      `Requested features: ${(data.featureLabels || []).join(", ") || "N/A"}`,
      `Timeline: ${data.timelineLabel || "N/A"}`,
      `Notes: ${data.notes || "None"}`,
    ].join("\n");

  const createMailConfig = (overrides = {}) => {
    const data = readFlowData();
    return {
      recipients: ["team@example.com"],
      sender: {
        name: "Chatbot Widget Demo",
        email: "noreply@example.com",
      },
      subject: "Chatbot widget demo lead",
      metadata: {
        sessionId: bot?.getSessionId?.() || "",
        summary: buildSummary(data),
        ...data,
        ...overrides,
      },
    };
  };

  const hasActiveOptionMessage = (questionText) => {
    if (!bot || typeof bot.getState !== "function") return false;

    const messages = bot.getState()?.messages || [];
    return messages.some(
      (message) =>
        message?.type === "option_selection" &&
        message?.role === "assistant" &&
        message?.disabled !== true &&
        message?.content === questionText,
    );
  };

  const ensureInitialOptions = async () => {
    if (!bot) return;
    const question = "What kind of chatbot do you want to prototype?";
    const currentStep = getFlowStep();

    if (currentStep && currentStep !== FLOW_STEPS.service) return;
    if (hasActiveOptionMessage(question)) return;

    bot.setInputType("text", {
      placeholder: "Choose an option below to begin...",
    });

    try {
      await bot.pushOptionSelection(question, SERVICE_OPTIONS, {
        allowMultiple: false,
        confirmButtonText: "Select",
      });
      setFlowStep(FLOW_STEPS.service);
    } catch (error) {
      console.error("Failed to initialize first step:", error);
      resetFlowState();
    }
  };

  const getThemePreset = (themeId) => {
    if (themeId === DEFAULT_THEME_ID) {
      return DEFAULT_THEME_META;
    }

    return THEME_PRESETS[themeId] || THEME_PRESETS.lagoon;
  };

  const applyThemePreset = async (themeId, source = "menu") => {
    if (!bot) return null;

    const preset = getThemePreset(themeId);
    activeThemeId = themeId;

    patchFlowData({
      activeThemeId: themeId,
      lastThemeSwitchSource: source,
      lastThemeLabel: preset.label,
    });

    if (themeId === DEFAULT_THEME_ID) {
      bot.resetTheme();
    } else {
      bot.updateConfig(preset.config);
    }

    await bot.pushMessage(
      themeId === DEFAULT_THEME_ID
        ? "Theme switched to Default. This resets the widget back to the built-in theme without passing a custom theme object."
        : `Theme switched to ${preset.label}. This preset updates colors, fonts, sizing, layout, spacing, radii, shadows, button styles, FAB overrides, and control icons through the widget theme config.`,
    );

    return preset;
  };

  const sendManualSummary = async () => {
    if (!bot) return false;

    const sent = await bot.sendEmail(
      createMailConfig({
        trigger: "menu-custom-action",
      }),
    );

    await bot.pushMessage(
      sent
        ? "The demo summary hook ran successfully. Check the console for the payload."
        : "The demo summary hook is disabled or failed.",
    );

    return sent;
  };

  const runCustomMenuActionExample = async (context = {}) => {
    const actionDetails = {
      id: context.id || "custom-action",
      text: context.text || "Custom menu action",
      action: context.action || "custom",
      actionValue: context.actionValue || "",
      triggeredAt: new Date().toISOString(),
    };

    patchFlowData({
      lastMenuAction: actionDetails,
    });

    console.info("[demo:menuCustomAction]", actionDetails, context);

    if (bot) {
      await bot.pushMessage(
        `Custom menu function executed for "${actionDetails.text}". This item did not navigate anywhere; it ran your own JavaScript handler instead.`,
      );
    }

    return actionDetails;
  };

  const createBotConfig = () => ({
    title: "Widget Demo Bot",
    autoOpen: false,
    position: "bottom-right",
    persistMessages: true,
    maxMessages: 120,
    welcomeMessage: INTRO_MESSAGE,
    chatIcon: DEMO_CHAT_ICON_NODE,
    botIcon: DEMO_BOT_ICON_NODE,
    bot_id: "chatbot_widget_demo_bot",
    user_id: getOrCreateUserId(),
    storageKey: "chatbot-widget-demo",
    storage: {
      strategy: "localStorage",
      namespace: "chatbot-widget-demo",
      maxSessions: 12,
      maxMessagesPerSession: 150,
    },
    inputConfig: {
      type: "text",
      placeholder: "Choose an option below to begin...",
      menu: {
        enabled: true,
        position: "right",
        items: [
          {
            id: "docs",
            icon: MENU_DOCS_ICON_NODE,
            text: "Docs",
            action: "redirect",
            actionValue: "https://example.com/chatbot-widget-docs",
          },
          {
            id: "call",
            icon: "📞",
            text: "Call",
            action: "call",
            actionValue: "+1-555-0101",
          },
          {
            id: "email",
            icon: "✉️",
            text: "Email",
            action: "email",
            actionValue: "team@example.com",
          },
          {
            id: "summary",
            icon: MENU_SUMMARY_ICON_SVG,
            text: "Send Summary",
            action: "custom",
            customHandler: async (context) => {
              console.info("[demo:menuSummaryContext]", context);
              await sendManualSummary();
            },
          },
          {
            id: "custom-function",
            icon: "⚙️",
            text: "Run Custom Function",
            action: "custom",
            actionValue: "demo-custom-function",
            customHandler: async (context) => {
              await runCustomMenuActionExample(context);
            },
          },
          {
            id: "theme-default",
            icon: createIconNode("DF", {
              background: "#eceff3",
              color: "#455a64",
              size: 20,
              radius: "6px",
              fontSize: "8px",
            }),
            text: "Theme: Default",
            action: "custom",
            customHandler: async (context) => {
              console.info("[demo:menuThemeContext]", context);
              await applyThemePreset("default");
            },
          },
          {
            id: "theme-lagoon",
            icon: MENU_THEME_ICON_SVG,
            text: "Theme: Lagoon",
            action: "custom",
            customHandler: async (context) => {
              console.info("[demo:menuThemeContext]", context);
              await applyThemePreset("lagoon");
            },
          },
          {
            id: "theme-editorial",
            icon: "📰",
            text: "Theme: Editorial",
            action: "custom",
            customHandler: async (context) => {
              console.info("[demo:menuThemeContext]", context);
              await applyThemePreset("editorial");
            },
          },
          {
            id: "theme-terminal",
            icon: "⌘",
            text: "Theme: Terminal",
            action: "custom",
            customHandler: async (context) => {
              console.info("[demo:menuThemeContext]", context);
              await applyThemePreset("terminal");
            },
          },
        ],
      },
    },
    ChatHooks: {
      onOpen: {
        enabled: true,
        customAction: async (sessionId) => {
          console.info("[demo:onOpen]", sessionId);
          return {
            sessionId,
            openedAt: new Date().toISOString(),
          };
        },
      },
      sendEmail: {
        enabled: true,
        customAction: async (sessionId, mailConfig) => {
          console.info("[demo:sendEmail]", sessionId, mailConfig);
          return true;
        },
        config: createMailConfig({
          trigger: "default-hook-config",
        }),
      },
      onComplete: {
        enabled: true,
        customAction: async (sessionId, sessionData) => {
          console.info("[demo:onComplete]", sessionId, sessionData);
          return {
            sessionId,
            completed: true,
            completedAt: new Date().toISOString(),
          };
        },
      },
    },
    onOpen: () => {
      console.info("[demo:onOpenCallback]");
    },
    onClose: () => {
      console.info("[demo:onCloseCallback]");
    },
    onReset: () => {
      console.info("[demo:onResetCallback]");
      resetFlowState();
      if (bot) {
        bot.setInputType("text", {
          placeholder: "Choose an option below to begin...",
        });
        window.setTimeout(() => {
          void ensureInitialOptions();
        }, 650);
      }
    },
    onError: (error) => {
      console.error("[demo:onError]", error);
    },
    onMessageSend: async (message) => {
      const incoming = parseIncomingMessage(message);
      const step = getFlowStep() || FLOW_STEPS.service;
      const data = readFlowData();

      switch (step) {
        case FLOW_STEPS.service: {
          const service =
            SERVICE_OPTIONS.find((item) => item.id === incoming.optionId) ||
            SERVICE_OPTIONS.find((item) => item.value === incoming.optionId);

          if (!service) {
            return "Please choose one of the provided options so the demo can continue.";
          }

          patchFlowData({
            serviceId: service.id,
            serviceValue: service.value,
            serviceLabel: service.text,
          });
          setFlowStep(FLOW_STEPS.name);
          bot.setInputType("text", {
            placeholder: "Enter your name",
          });

          return [
            `Great. We'll model this as a ${service.text.toLowerCase()} flow.`,
            "First, what name should I use for the demo summary?",
          ];
        }

        case FLOW_STEPS.name: {
          if (!validators.name(incoming.text)) {
            return "Enter a name with at least 2 letters. Numbers-only values are rejected in this demo.";
          }

          patchFlowData({
            name: incoming.text,
          });
          setFlowStep(FLOW_STEPS.email);
          bot.setInputType("email", {
            placeholder: "name@company.com",
          });

          return [
            `Nice to meet you, ${incoming.text}.`,
            "The widget can switch the footer to an email input. What email should we use?",
          ];
        }

        case FLOW_STEPS.email: {
          if (!validators.email(incoming.text)) {
            return "Enter a valid email address so the email-input example remains realistic.";
          }

          patchFlowData({
            email: incoming.text,
          });
          setFlowStep(FLOW_STEPS.phone);
          bot.setInputType("phone", {
            placeholder: "555 010 1234",
            phoneConfig: {
              defaultCountryCode: "+1",
            },
          });

          return [
            "Saved.",
            "Now the widget switches to phone mode. Enter a phone number to continue.",
          ];
        }

        case FLOW_STEPS.phone: {
          if (!validators.phone(incoming.text)) {
            return "Enter a valid 7 to 15 digit phone number. Repeated digits like 1111111111 are rejected in this demo.";
          }

          patchFlowData({
            phone: incoming.text,
          });
          setFlowStep(FLOW_STEPS.interests);
          bot.setInputType("text", {
            placeholder: "Choose up to three feature areas below...",
          });

          return [
            "Phone input captured.",
            {
              type: "option_selection",
              content:
                "Pick up to three widget capabilities you want highlighted in the demo summary.",
              payload: {
                options: FEATURE_OPTIONS,
                allowMultiple: true,
                minSelections: 1,
                maxSelections: 3,
                confirmButtonText: "Continue",
              },
            },
          ];
        }

        case FLOW_STEPS.interests: {
          const selectedIds =
            incoming.optionIds.length > 0
              ? incoming.optionIds
              : incoming.optionId
                ? [incoming.optionId]
                : [];
          const selectedLabels =
            incoming.optionTexts.length > 0
              ? incoming.optionTexts
              : incoming.optionText
                ? [incoming.optionText]
                : [];

          if (selectedIds.length === 0) {
            return "Select at least one feature so the multi-select example can continue.";
          }

          patchFlowData({
            featureIds: selectedIds,
            featureLabels: selectedLabels,
          });
          setFlowStep(FLOW_STEPS.timeline);

          return {
            type: "option_selection",
            content:
              "When would you like to explore this bot use case further?",
            payload: {
              options: TIMELINE_OPTIONS,
              allowMultiple: false,
            },
          };
        }

        case FLOW_STEPS.timeline: {
          const timeline =
            TIMELINE_OPTIONS.find((item) => item.id === incoming.optionId) ||
            TIMELINE_OPTIONS.find((item) => item.text === incoming.optionText);

          if (!timeline) {
            return "Choose one of the timing options so the flow can finish cleanly.";
          }

          patchFlowData({
            timelineId: timeline.id,
            timelineLabel: timeline.text,
          });
          setFlowStep(FLOW_STEPS.notes);
          bot.setInputType("text", {
            placeholder: "Add any notes or type none",
          });

          return [
            `Timeline noted: ${timeline.text}.`,
            "Last step: add a short note. This demonstrates regular free-text capture after option flows.",
          ];
        }

        case FLOW_STEPS.notes: {
          const finalData = patchFlowData({
            notes: incoming.text || "None",
            completedAt: new Date().toISOString(),
          });

          setFlowStep(FLOW_STEPS.complete);
          bot.setInputType("text", {
            placeholder: "This demo is complete. Reset to run it again.",
          });

          const completionResult = await bot.completeSession({
            source: "example-flow",
            flowData: finalData,
            summary: buildSummary(finalData),
          });
          console.info("[demo:completeSessionResult]", completionResult);

          return [
            "Demo complete. The completion hook and email hook both ran.",
            `Summary:\n${buildSummary(finalData)}`,
            "Open the console or inspect local storage to see the stored session data and hook payloads.",
          ];
        }

        case FLOW_STEPS.complete:
          return "This reference flow is already complete. Use the reset button to start again.";

        default:
          setFlowStep(FLOW_STEPS.service);
          return "The flow state was missing, so it has been reset. Use the provided options to start again.";
      }
    },
  });

  const exposeReferenceAPI = () => {
    if (!bot) return;

    window.chatbotExample = {
      bot,
      open: () => bot.open(),
      close: () => bot.close(),
      toggle: () => bot.toggle(),
      reset: () => bot.resetSession(),
      clearMessages: () => bot.clearMessages(),
      getSessionId: () => bot.getSessionId(),
      getState: () => bot.getState(),
      getConfig: () => bot.getConfig(),
      getHooks: () => bot.getHooks(),
      getInputType: () => bot.getInputType(),
      getAllSessions: () => bot.getAllSessions(),
      getThemePresets: () => ({
        default: DEFAULT_THEME_META,
        ...THEME_PRESETS,
      }),
      getActiveThemeId: () => activeThemeId,
      applyThemePreset,
      resetTheme: () => applyThemePreset(DEFAULT_THEME_ID, "reference-api"),
      sendManualSummary,
      runCustomMenuActionExample,
      showInitialOptions: ensureInitialOptions,
      stopAutoOpen: () => {
        if (typeof stopAutoOpen === "function") {
          stopAutoOpen();
          stopAutoOpen = null;
        }
      },
    };
  };

  const registerEventLogging = () => {
    if (!bot) return;

    bot.on("open", () => console.info("[demo:event] open"));
    bot.on("close", () => console.info("[demo:event] close"));
    bot.on("reset", () => console.info("[demo:event] reset"));
    bot.on("sync", () => console.info("[demo:event] sync"));
    bot.on("online", () => console.info("[demo:event] online"));
    bot.on("offline", () => console.info("[demo:event] offline"));
  };

  const initializeDemo = async () => {
    const chatbotLib = await loadChatbotLibrary();
    bot = new chatbotLib.Chatbot(createBotConfig());

    registerEventLogging();
    exposeReferenceAPI();

    const autoOpenHelper = await resolveAutoOpenHelper(chatbotLib);
    const openAndInit = () => {
      bot.open();
      window.setTimeout(() => {
        void ensureInitialOptions();
      }, 700);
    };

    if (autoOpenHelper) {
      stopAutoOpen = autoOpenHelper(bot, openAndInit, {
        ttlMs: 20 * 60 * 1000,
        storageKey: "chatbot_demo_autoopen_next_at_v1",
        flowKeysToClear: [FLOW_KEYS.step, FLOW_KEYS.data],
        resetOnFirstOpen: false,
      });
    } else {
      openAndInit();
    }
  };

  onReady(() => {
    void initializeDemo().catch((error) => {
      console.error("Failed to initialize chatbot demo flow:", error);
    });
  });
})();
