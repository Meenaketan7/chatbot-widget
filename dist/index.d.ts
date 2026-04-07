type MessageType = "text" | "card" | "quick_replies" | "image" | "system" | "option_selection" | "multiselect";
type StorageStrategy = "localStorage";
type SyncStatus = "synced" | "pending" | "failed";
type ChatbotPosition = "bottom-right" | "bottom-left" | "top-right" | "top-left";
type RenderableIconResult = string | Node | null | undefined;
type RenderableIcon = string | Node | (() => RenderableIconResult);
type MenuActionType = "redirect" | "call" | "email" | "custom";
interface MenuActionContext {
    id: string;
    text: string;
    action: MenuActionType;
    actionValue?: string;
    event?: Event;
}
interface MenuItemConfig {
    id: string;
    icon: RenderableIcon;
    text: string;
    action: MenuActionType;
    actionValue?: string;
    customHandler?: (context?: MenuActionContext) => void | Promise<void>;
}
interface InputMenuConfig {
    enabled: boolean;
    items: MenuItemConfig[];
    position?: "left" | "right";
    showWhen?: InputFieldType[];
}
type InputFieldType = "text" | "phone" | "email";
interface PhoneInputConfig {
    defaultCountryCode?: string;
    defaultCountry?: string;
    placeholder?: string;
}
interface InputConfig {
    type: InputFieldType;
    placeholder?: string;
    phoneConfig?: PhoneInputConfig;
    menu?: InputMenuConfig;
}
type ThemeValue = string | number;
type ThemeScalar = string | number;
interface ChatbotThemeColors {
    primary?: ThemeValue;
    secondary?: ThemeValue;
    panelBackground?: ThemeValue;
    bodyBackground?: ThemeValue;
    footerBackground?: ThemeValue;
    headerBackground?: ThemeValue;
    headerText?: ThemeValue;
    headerSubtext?: ThemeValue;
    headerAvatarBackground?: ThemeValue;
    headerActionBackground?: ThemeValue;
    headerActionHoverBackground?: ThemeValue;
    textPrimary?: ThemeValue;
    textSecondary?: ThemeValue;
    assistantBubbleBackground?: ThemeValue;
    assistantBubbleText?: ThemeValue;
    userBubbleBackground?: ThemeValue;
    userBubbleText?: ThemeValue;
    inputBackground?: ThemeValue;
    inputText?: ThemeValue;
    inputPlaceholder?: ThemeValue;
    borderColor?: ThemeValue;
    fabBackground?: ThemeValue;
    fabText?: ThemeValue;
    optionBackground?: ThemeValue;
    optionText?: ThemeValue;
    menuBackground?: ThemeValue;
    menuText?: ThemeValue;
    menuBorderColor?: ThemeValue;
    sendButtonBackground?: ThemeValue;
    sendButtonText?: ThemeValue;
    sendButtonDisabledBackground?: ThemeValue;
    modalBackground?: ThemeValue;
    modalTitleText?: ThemeValue;
    modalText?: ThemeValue;
    overlayBackground?: ThemeValue;
    resetButtonBackground?: ThemeValue;
    resetButtonText?: ThemeValue;
    resetButtonBorder?: ThemeValue;
    cancelButtonBackground?: ThemeValue;
    cancelButtonText?: ThemeValue;
    cancelButtonBorder?: ThemeValue;
    success?: ThemeValue;
    error?: ThemeValue;
    warning?: ThemeValue;
    scrollbarThumb?: ThemeValue;
    scrollbarThumbHover?: ThemeValue;
}
interface ChatbotThemeTypography {
    fontFamily?: ThemeValue;
    titleSize?: ThemeValue;
    subtitleSize?: ThemeValue;
    messageSize?: ThemeValue;
    inputSize?: ThemeValue;
    optionSize?: ThemeValue;
    captionSize?: ThemeValue;
    titleWeight?: ThemeValue;
    subtitleWeight?: ThemeValue;
    messageWeight?: ThemeValue;
    lineHeight?: ThemeValue;
}
interface ChatbotThemeLayout {
    panelWidth?: ThemeValue;
    panelHeight?: ThemeValue;
    panelMaxWidth?: ThemeValue;
    panelMaxHeight?: ThemeValue;
    mobilePanelWidth?: ThemeValue;
    mobilePanelHeight?: ThemeValue;
    mobilePanelMaxWidth?: ThemeValue;
    mobilePanelMaxHeight?: ThemeValue;
    fabSize?: ThemeValue;
    mobileFabSize?: ThemeValue;
    fabWaveSize?: ThemeValue;
    fabBorderWidth?: ThemeValue;
    headerAvatarSize?: ThemeValue;
    headerActionSize?: ThemeValue;
    botAvatarSize?: ThemeValue;
    sendButtonSize?: ThemeValue;
    menuToggleSize?: ThemeValue;
    menuWidth?: ThemeValue;
    countryDropdownWidth?: ThemeValue;
    modalWidth?: ThemeValue;
    messageMaxWidth?: ThemeValue;
    mobileMessageMaxWidth?: ThemeValue;
    optionMinWidth?: ThemeValue;
}
interface ChatbotThemeSpacing {
    headerPadding?: ThemeValue;
    bodyPadding?: ThemeValue;
    mobileBodyPadding?: ThemeValue;
    footerPadding?: ThemeValue;
    bubblePadding?: ThemeValue;
    optionPadding?: ThemeValue;
    inputPaddingX?: ThemeValue;
    menuPadding?: ThemeValue;
    menuItemPadding?: ThemeValue;
    modalPadding?: ThemeValue;
    countryPickerPadding?: ThemeValue;
    countryItemPadding?: ThemeValue;
    headerGap?: ThemeValue;
    bodyGap?: ThemeValue;
    messageGap?: ThemeValue;
    optionGap?: ThemeValue;
}
interface ChatbotThemeRadius {
    panel?: ThemeValue;
    fab?: ThemeValue;
    bubble?: ThemeValue;
    bubbleTail?: ThemeValue;
    input?: ThemeValue;
    button?: ThemeValue;
    option?: ThemeValue;
    menu?: ThemeValue;
    modal?: ThemeValue;
    headerAction?: ThemeValue;
}
interface ChatbotThemeShadows {
    panel?: ThemeValue;
    header?: ThemeValue;
    fab?: ThemeValue;
    fabHover?: ThemeValue;
    assistantBubble?: ThemeValue;
    userBubble?: ThemeValue;
    option?: ThemeValue;
    optionHover?: ThemeValue;
    input?: ThemeValue;
    inputFocus?: ThemeValue;
    sendButton?: ThemeValue;
    menu?: ThemeValue;
    dropdown?: ThemeValue;
    modal?: ThemeValue;
}
interface ChatbotThemeButtonStyle {
    background?: ThemeValue;
    text?: ThemeValue;
    borderColor?: ThemeValue;
    hoverBackground?: ThemeValue;
    hoverText?: ThemeValue;
    hoverBorderColor?: ThemeValue;
    disabledBackground?: ThemeValue;
    disabledText?: ThemeValue;
    disabledBorderColor?: ThemeValue;
}
interface ChatbotThemeButtons {
    fab?: ChatbotThemeButtonStyle;
    send?: ChatbotThemeButtonStyle;
    menuToggle?: ChatbotThemeButtonStyle;
    close?: ChatbotThemeButtonStyle;
    headerReset?: ChatbotThemeButtonStyle;
    multiConfirm?: ChatbotThemeButtonStyle;
    modalReset?: ChatbotThemeButtonStyle;
    modalCancel?: ChatbotThemeButtonStyle;
}
interface ChatbotThemeFabWave {
    enabled?: boolean;
    color?: ThemeValue;
    size?: ThemeValue;
    opacity?: ThemeScalar;
    duration?: ThemeScalar;
}
interface ChatbotThemeFabStatusDot {
    enabled?: boolean;
    onlineColor?: ThemeValue;
    offlineColor?: ThemeValue;
    size?: ThemeValue;
    top?: ThemeValue;
    left?: ThemeValue;
    borderColor?: ThemeValue;
    borderWidth?: ThemeValue;
    shadow?: ThemeValue;
}
interface ChatbotThemeFab {
    icon?: RenderableIcon;
    iconSize?: ThemeValue;
    iconColor?: ThemeValue;
    iconBackground?: ThemeValue;
    iconPadding?: ThemeValue;
    iconRadius?: ThemeValue;
    background?: ThemeValue;
    text?: ThemeValue;
    borderColor?: ThemeValue;
    hoverBackground?: ThemeValue;
    hoverText?: ThemeValue;
    hoverBorderColor?: ThemeValue;
    size?: ThemeValue;
    mobileSize?: ThemeValue;
    borderWidth?: ThemeValue;
    radius?: ThemeValue;
    shadow?: ThemeValue;
    hoverShadow?: ThemeValue;
    wave?: ChatbotThemeFabWave;
    statusDot?: ChatbotThemeFabStatusDot;
}
interface ChatbotThemeIcons {
    send?: RenderableIcon;
    close?: RenderableIcon;
    headerReset?: RenderableIcon;
    menu?: RenderableIcon;
    menuClose?: RenderableIcon;
    multiConfirm?: RenderableIcon;
    modalReset?: RenderableIcon;
    modalCancel?: RenderableIcon;
}
interface ChatbotTheme {
    colors?: ChatbotThemeColors;
    typography?: ChatbotThemeTypography;
    layout?: ChatbotThemeLayout;
    spacing?: ChatbotThemeSpacing;
    radius?: ChatbotThemeRadius;
    shadows?: ChatbotThemeShadows;
    buttons?: ChatbotThemeButtons;
    fab?: ChatbotThemeFab;
    icons?: ChatbotThemeIcons;
    variables?: Record<string, ThemeValue>;
}
interface ChatMessage {
    id: string;
    message_id?: string;
    session_id?: string;
    type?: MessageType;
    content?: string;
    role: "user" | "assistant" | "system";
    timestamp: Date;
    payload?: any;
    disabled?: boolean;
    sequence_number?: number;
    created_at?: string;
    updated_at?: string;
    autoScroll?: boolean;
}
interface ChatSession {
    session_id: string;
    bot_id?: string | null;
    user_id?: string | null;
    status?: "active" | "inactive" | "completed";
    metadata?: Record<string, any>;
    created_at?: string;
    updated_at?: string;
    expires_at?: string;
}
interface StorageConfig {
    strategy?: StorageStrategy;
    namespace?: string;
    maxSessions?: number;
    maxMessagesPerSession?: number;
}
interface CreateSessionRequest {
    session_id?: string;
    bot_id?: string;
    user_id?: string;
    metadata?: Record<string, any>;
}
interface AddMessageRequest {
    message_id?: string;
    type?: MessageType;
    content?: string;
    role: "user" | "assistant" | "system";
    payload?: any;
    disabled?: boolean;
}
interface ChatbotConfig {
    primaryColor?: string;
    secondaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    borderRadius?: string;
    theme?: ChatbotTheme;
    position?: ChatbotPosition;
    autoOpen?: boolean;
    persistMessages?: boolean;
    maxMessages?: number;
    title?: string;
    placeholder?: string;
    welcomeMessage?: string;
    errorMessage?: string;
    typingMessage?: string;
    chatIcon?: RenderableIcon;
    botIcon?: RenderableIcon;
    userIcon?: RenderableIcon;
    fontFamily?: string;
    inputConfig?: InputConfig;
    bot_id?: string;
    user_id?: string;
    onMessageSend?: (message: string | any) => Promise<string | any> | string | any;
    onOpen?: () => void;
    onClose?: () => void;
    onReset?: () => void;
    onError?: (error: Error) => void;
    storageKey?: string;
    storage?: StorageConfig;
    autoOpenDelayMs?: number;
    welcomeCard?: any;
    ChatHooks?: ChatHooks;
}
interface ChatbotState {
    isOpen: boolean;
    isTyping: boolean;
    typingRole?: "user" | "assistant";
    messages: ChatMessage[];
    currentInput: string;
    inputDisabled: boolean;
    waitingForOptionSelection: boolean;
    isOnline: boolean;
    syncStatus: SyncStatus;
    currentInputType?: InputFieldType;
}
interface SyncStatusInfo {
    canSync: boolean;
    queueSize: number;
    status: SyncStatus;
}
interface MailConfig {
    recipients: string[];
    sender: {
        name: string;
        email: string;
    };
    subject?: string;
    metadata?: Record<string, any>;
}
interface ChatHooks {
    onComplete?: {
        enabled: boolean;
        customAction?: (sessionId: string, sessionData: any) => Promise<any>;
        defaultAction?: boolean;
    };
    sendEmail?: {
        enabled: boolean;
        customAction?: (sessionId: string, mailConfig: MailConfig) => Promise<any>;
        defaultAction?: boolean;
        config?: MailConfig;
    };
    onOpen?: {
        enabled: boolean;
        customAction?: (sessionId: string, chatbotInstance: any) => Promise<any>;
        defaultAction?: boolean;
    };
}

interface HookFunction<T = any> {
    (...args: any[]): Promise<T>;
    enabled?: boolean;
    config?: any;
}
interface ExposedHooks {
    sendEmail: HookFunction<boolean>;
    onComplete: HookFunction<any>;
    onOpen: HookFunction<any>;
}

declare class Chatbot {
    private config;
    private state;
    private root;
    private ui;
    private sessionId;
    private messageService;
    private eventEmitter;
    private static instance;
    private hooksService?;
    constructor(config?: Partial<ChatbotConfig>);
    /**
     * Initialize hooks service
     */
    private initializeHooksService;
    /**
     * Initialize message service with local storage configuration
     */
    private initializeMessageService;
    /**
     * Remove existing chatbot instance
     */
    private removeExistingInstance;
    /**
     * Initialize chatbot state synchronously
     */
    private initializeStateSync;
    /**
     * Initialize chatbot state asynchronously
     */
    private initializeStateAsync;
    /**
     * Create user interface
     */
    private createUserInterface;
    /**
     * Initialize additional features
     */
    private initializeFeatures;
    /**
     * Initialize network status handling
     */
    private initializeNetworkHandling;
    /**
     * Generate unique session ID
     */
    private generateSessionId;
    /**
     * Add welcome message
     */
    private addWelcomeMessage;
    /**
     * Reset session
     */
    resetSession(): Promise<void>;
    /**
     * Clear local session data
     */
    private clearLocalSessionData;
    /**
     * Add message internally
     */
    private addMessageInternal;
    /**
     * Update input state based on active options
     */
    private updateInputState;
    /**
     * Handle option selection
     */
    private handleOptionSelection;
    /**
     * Handle option selection response
     */
    private handleOptionSelectionResponse;
    /**
     * Handle message result from callback
     */
    private handleMessageResult;
    /**
     * Create text message object
     */
    private createTextMessage;
    /**
     * Add error message
     */
    private addErrorMessage;
    /**
     * Update message
     */
    private updateMessage;
    /**
     * Public API Methods
     */
    /**
     * Push a message to the chat
     */
    pushMessage(msg: ChatMessage | string, role?: "assistant" | "user"): Promise<void>;
    /**
     * Push option selection message
     */
    pushOptionSelection(question: string, options: Array<{
        id: string;
        text: string;
        value?: any;
    }>, cfg?: {
        allowMultiple?: boolean;
        minSelections?: number;
        maxSelections?: number;
        confirmButtonText?: string;
        required?: boolean;
    }): Promise<void>;
    /**
     * Send message
     */
    sendMessage(message: string | {
        type?: string;
        payload?: any;
    }): Promise<void>;
    /**
     * Get hooks that users can call directly
     */
    getHooks(): ExposedHooks | null;
    /**
     * Complete session - trigger onComplete hook (can be called by user)
     */
    completeSession(additionalData?: any): Promise<any>;
    /**
     * Send email manually (can be called by user)
     */
    sendEmail(mailConfig?: MailConfig): Promise<boolean>;
    /**
     * Set input type dynamically
     * This allows users to change the input field type on the fly
     */
    setInputType(type: "text" | "phone" | "email", config?: {
        placeholder?: string;
        phoneConfig?: {
            defaultCountryCode?: string;
            defaultCountry?: string;
            placeholder?: string;
        };
    }): void;
    /**
     * Get current input type
     */
    getInputType(): "text" | "phone" | "email";
    /**
     * Open chat
     */
    open(): Promise<void>;
    /**
     * Close chat
     */
    close(): void;
    /**
     * Toggle chat
     */
    toggle(): void;
    /**
     * Get open state
     */
    isOpen(): boolean;
    /**
     * Clear messages (alias for resetSession)
     */
    clearMessages(): void;
    /**
     * Sync local persistence state
     */
    sync(): Promise<void>;
    /**
     * Retry failed operations
     */
    retry(): Promise<void>;
    /**
     * Get current session ID
     */
    getSessionId(): string;
    /**
     * Get all sessions
     */
    getAllSessions(): any[];
    /**
     * Update configuration
     */
    updateConfig(cfg: Partial<ChatbotConfig>): void;
    /**
     * Reset theme-related configuration back to built-in defaults
     */
    resetTheme(): void;
    /**
     * Get current configuration
     */
    getConfig(): ChatbotConfig;
    /**
     * Get current state
     */
    getState(): ChatbotState;
    /**
     * Add event listener
     */
    on(event: string, callback: Function): void;
    /**
     * Remove event listener
     */
    off(event: string, callback: Function): void;
    /**
     * Get connection status
     */
    isOnline(): boolean;
    /**
     * Get sync status
     */
    getSyncStatus(): SyncStatusInfo;
    /**
     * Destroy chatbot instance
     */
    destroy(): void;
    /**
     * Get singleton instance
     */
    static getInstance(): Chatbot | null;
}

declare function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T;
declare function generateId(): string;
declare function sanitizeHtml(input: string): string;
/**
 * Format timestamp for display
 */
declare function formatTimestamp(date: Date): string;
/**
 * Generate message ID with timestamp
 */
declare function generateMessageId(prefix?: string): string;
/**
 * Generate session ID with timestamp
 */
declare function generateSessionId(prefix?: string, userId?: string, botId?: string): string;

interface AutoOpenChatbotTTLOptions {
    ttlMs?: number;
    storageKey?: string;
    flowKeysToClear?: string[];
    resetOnFirstOpen?: boolean;
}
interface AutoOpenChatbotTTLBot {
    isOpen?: () => boolean;
    reset?: () => void | Promise<void>;
    resetChat?: () => void | Promise<void>;
    resetSession?: () => void | Promise<void>;
    clearMessages?: () => void | Promise<void>;
}
interface AutoOpenTTLRegistry {
    listeners: Record<string, (event: StorageEvent) => void>;
    timers: Record<string, number | undefined>;
}
declare global {
    interface Window {
        __chatbotAutoOpenTTLRegistry__?: AutoOpenTTLRegistry;
    }
}
declare function autoOpenChatbotTTL(bot: AutoOpenChatbotTTLBot, openAndInit: () => void | Promise<void>, options?: AutoOpenChatbotTTLOptions): () => void;

declare class MessageService {
    private storageService;
    constructor(storageConfig?: StorageConfig);
    ensureSession(sessionId: string, sessionData?: CreateSessionRequest): Promise<ChatSession>;
    addMessage(sessionId: string, messageData: AddMessageRequest): Promise<ChatMessage>;
    sendMessage(sessionId: string, content: string, type?: "text" | "option_selection", payload?: any): Promise<ChatMessage>;
    getSession(sessionId: string): Promise<{
        session: ChatSession;
        messages: ChatMessage[];
    } | null>;
    updateSession(sessionId: string, updates: Partial<ChatSession>): Promise<ChatSession | null>;
    updateMessage(sessionId: string, messageId: string, updates: Partial<ChatMessage>): Promise<ChatMessage | null>;
    deleteSession(sessionId: string): Promise<void>;
    expireSession(sessionId: string): Promise<void>;
    getAllSessions(): ChatSession[];
    canSync(): boolean;
    sync(): Promise<void>;
    getSyncStatus(): {
        canSync: boolean;
        queueSize: number;
        lastSync?: Date;
    };
}

declare class StorageService {
    private config;
    private namespace;
    constructor(config: StorageConfig);
    private getStorageKey;
    /**
     * Save session data to localStorage
     */
    saveSession(sessionId: string, session: ChatSession): void;
    /**
     * Get session from localStorage
     */
    getSession(sessionId: string): ChatSession | null;
    /**
     * Get all sessions from localStorage
     */
    getAllSessions(): ChatSession[];
    /**
     * Save messages to localStorage
     */
    saveMessages(sessionId: string, messages: ChatMessage[]): void;
    /**
     * Get messages from localStorage
     */
    getMessages(sessionId: string): ChatMessage[];
    /**
     * Get all messages grouped by session
     */
    private getAllMessages;
    /**
     * Clear session data
     */
    clearSession(sessionId: string): void;
    /**
     * Clear all data
     */
    clearAll(): void;
    /**
     * Get storage usage info
     */
    getStorageInfo(): {
        used: number;
        total: number;
        percentage: number;
    };
}

declare class ChatbotElement extends HTMLElement {
    chatbot: Chatbot | null;
    connectedCallback(): void;
    disconnectedCallback(): void;
    open(): void;
    close(): void;
    isOpen(): boolean;
    sendMessage(message: string): void;
    clearMessages(): void;
    resetSession(): void;
    updateConfig(config: Partial<ChatbotConfig>): void;
    resetTheme(): void;
}

export { Chatbot, ChatbotElement, MessageService, StorageService, autoOpenChatbotTTL, deepMerge, Chatbot as default, formatTimestamp, generateId, generateMessageId, generateSessionId, sanitizeHtml };
export type { AutoOpenChatbotTTLBot, AutoOpenChatbotTTLOptions, ChatMessage, ChatbotConfig, ChatbotState, ChatbotTheme, ChatbotThemeButtonStyle, ChatbotThemeButtons, ChatbotThemeColors, ChatbotThemeFab, ChatbotThemeFabStatusDot, ChatbotThemeFabWave, ChatbotThemeIcons, ChatbotThemeLayout, ChatbotThemeRadius, ChatbotThemeShadows, ChatbotThemeSpacing, ChatbotThemeTypography, MessageType, RenderableIcon, StorageStrategy, SyncStatus, SyncStatusInfo };
