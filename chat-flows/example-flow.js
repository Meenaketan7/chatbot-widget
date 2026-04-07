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
    "Welcome. This demo shows the widget's local-storage flow, hooks, input modes, menu actions, and option selection features.";

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
  ];

  const TIMELINE_OPTIONS = [
    { id: "today", text: "Today" },
    { id: "week", text: "This week" },
    { id: "month", text: "This month" },
    { id: "research", text: "Just researching" },
  ];

  const THEMES = [
    {
      primaryColor: "#0f766e",
      secondaryColor: "#0ea5e9",
      borderRadius: "18px",
    },
    {
      primaryColor: "#7c3aed",
      secondaryColor: "#ec4899",
      borderRadius: "16px",
    },
  ];

  let activeThemeIndex = 0;
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

  const toggleTheme = async () => {
    if (!bot) return;

    activeThemeIndex = activeThemeIndex === 0 ? 1 : 0;
    const theme = THEMES[activeThemeIndex];
    bot.updateConfig(theme);
    await bot.pushMessage(
      `Theme switched. Primary color is now ${theme.primaryColor}.`,
    );
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
    primaryColor: THEMES[0].primaryColor,
    secondaryColor: THEMES[0].secondaryColor,
    backgroundColor: "#ffffff",
    borderRadius: THEMES[0].borderRadius,
    autoOpen: false,
    position: "bottom-right",
    persistMessages: true,
    maxMessages: 120,
    welcomeMessage: INTRO_MESSAGE,
    chatIcon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
    botIcon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="8" width="18" height="10" rx="2"/><path d="M12 4v4"/><circle cx="9" cy="13" r="1"/><circle cx="15" cy="13" r="1"/></svg>`,
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
            icon: "📘",
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
            icon: "🧾",
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
            id: "theme",
            icon: "🎨",
            text: "Toggle Theme",
            action: "custom",
            customHandler: async (context) => {
              console.info("[demo:menuThemeContext]", context);
              await toggleTheme();
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
