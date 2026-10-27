import { createContext, useContext } from "react";
import { useRemoteData } from "@/contexts/use-remote-data";
import { api } from "@/services/client";
import type { ChatThread } from "@/types";
import { toQuery } from "@/utils/query";

// chat_to: also return this user's chat; userid: (admin) list another user's chats.
export type ChatQuery = {
  chat_to?: number | string | null;
  userid?: number | string;
};

async function getChats(query?: ChatQuery) {
  const { data } = await api.get(`/get/chat${toQuery(query)}`);
  return data?.data as ChatThread[];
}

const ChatData = createContext<any>(null);
export default function ChatContextProvider({ children }: any) {
  const {
    data: chatData,
    setData: setChatData,
    isLoading,
    isError,
    load: fetchChatData,
  } = useRemoteData(getChats, { requiresAuth: true });
  return (
    <ChatData.Provider
      value={{ isLoading, isError, chatData, fetchChatData, setChatData }}
    >
      {children}
    </ChatData.Provider>
  );
}

export function useChatContext() {
  return useContext(ChatData);
}
