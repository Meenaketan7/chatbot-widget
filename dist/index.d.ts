interface ChatbotConfig {
    primaryColor?: string;
    secondaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    borderRadius?: string;
    position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
    autoOpen?: boolean;
    persistMessages?: boolean;
    maxMessages?: number;
    title?: string;
    placeholder?: string;
    welcomeMessage?: string;
    errorMessage?: string;
    typingMessage?: string;
    chatIcon?: string | HTMLElement;
    botIcon?: string | HTMLElement;
    userIcon?: string | HTMLElement;
    onMessageSend?: (message: string) => Promise<string> | string;
    onOpen?: () => void;
    onClose?: () => void;
    onError?: (error: Error) => void;
}
interface ChatbotAPI {
    open(): void;
    close(): void;
    toggle(): void;
    sendMessage(message: string): void;
    clearMessages(): void;
    destroy(): void;
    updateConfig(config: Partial<ChatbotConfig>): void;
}

declare class Chatbot implements ChatbotAPI {
    private config;
    private state;
    private root;
    private ui;
    constructor(config?: Partial<ChatbotConfig>);
    private pushMessage;
    open(): void;
    close(): void;
    toggle(): void;
    sendMessage(message: string): void;
    clearMessages(): void;
    destroy(): void;
    updateConfig(config: Partial<ChatbotConfig>): void;
}

export { Chatbot };
