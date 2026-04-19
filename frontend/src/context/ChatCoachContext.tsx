import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

const CHAT_SEED: ChatMessage[] = [
  {
    id: "s1",
    role: "assistant",
    content:
      "Ask about this quarter, your biggest risks, or the tradeoffs behind a decision. I’ll keep it short and use the current snapshot.",
  },
];

type ChatCoachContextValue = {
  messages: ChatMessage[];
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>;
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  resetChat: () => void;
};

const ChatCoachContext = createContext<ChatCoachContextValue | null>(null);

export function ChatCoachProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>(CHAT_SEED);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const resetChat = useCallback(() => {
    setMessages(CHAT_SEED);
    setInput("");
    setLoading(false);
  }, []);

  const value = useMemo(
    () => ({
      messages,
      setMessages,
      input,
      setInput,
      loading,
      setLoading,
      resetChat,
    }),
    [messages, input, loading, resetChat],
  );

  return <ChatCoachContext.Provider value={value}>{children}</ChatCoachContext.Provider>;
}

export function useChatCoach(): ChatCoachContextValue {
  const ctx = useContext(ChatCoachContext);
  if (!ctx) {
    throw new Error("useChatCoach must be used within ChatCoachProvider");
  }
  return ctx;
}
