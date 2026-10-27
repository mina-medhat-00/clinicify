import { createContext, useContext } from "react";
import { useRemoteData } from "@/contexts/use-remote-data";
import { api } from "@/services/client";
import type { ChatMessage } from "@/types";
import { toQuery } from "@/utils/query";

export type MessagesQuery = { message_to: number | string };

async function getMessages(query: MessagesQuery) {
  const { data } = await api.get(`/get/messages${toQuery(query)}`);
  return data?.data as ChatMessage[];
}

const MessagesData = createContext<any>(null);
export default function MessagesContextProvider({ children }: any) {
  const {
    data: messagesData,
    isLoading,
    isError,
    load: fetchMessagesData,
  } = useRemoteData(getMessages, { requiresAuth: true });
  return (
    <MessagesData.Provider
      value={{ isLoading, messagesData, fetchMessagesData, isError }}
    >
      {children}
    </MessagesData.Provider>
  );
}

export function useMessagesContext() {
  return useContext(MessagesData);
}
