import type { ReactNode } from "react";
import { createStrictContext } from "@/utils/create-strict-context";
import { useRemoteData } from "@/hooks/use-remote-data";
import { apiGet } from "@/services/client";
import type { ChatThread } from "@/types/content";
import type { Id } from "@/types/user";
import { toQuery } from "@/utils/query";

// chat_to: also return this user's chat; userid: (admin) list another user's chats.
export interface ChatQuery {
  chat_to?: Id | null;
  userid?: Id;
}

function getChats(query?: ChatQuery) {
  return apiGet<ChatThread[]>(
    `/get/chat${toQuery(query ? { ...query } : null)}`,
  );
}

function useChatValue() {
  const {
    data: chatData,
    setData: setChatData,
    isLoading,
    isError,
    load: fetchChatData,
  } = useRemoteData(getChats, { requiresAuth: true });
  return { isLoading, isError, chatData, fetchChatData, setChatData };
}

const [ChatData, useChatContext] =
  createStrictContext<ReturnType<typeof useChatValue>>("ChatContext");
export { useChatContext };

export default function ChatContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const value = useChatValue();
  return <ChatData.Provider value={value}>{children}</ChatData.Provider>;
}
