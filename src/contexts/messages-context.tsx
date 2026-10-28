import type { ReactNode } from "react";
import { createStrictContext } from "@/utils/create-strict-context";
import { useRemoteData } from "@/hooks/use-remote-data";
import { apiGet } from "@/services/client";
import type { ChatMessage } from "@/types/content";
import type { Id } from "@/types/user";
import { toQuery } from "@/utils/query";

export interface MessagesQuery {
  message_to: Id;
}

function getMessages(query: MessagesQuery) {
  return apiGet<ChatMessage[]>(`/get/messages${toQuery({ ...query })}`);
}

function useMessagesValue() {
  const {
    data: messagesData,
    isLoading,
    isError,
    load: fetchMessagesData,
  } = useRemoteData(getMessages, { requiresAuth: true });
  return { isLoading, messagesData, fetchMessagesData, isError };
}

const [MessagesData, useMessagesContext] =
  createStrictContext<ReturnType<typeof useMessagesValue>>("MessagesContext");
export { useMessagesContext };

export default function MessagesContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const value = useMessagesValue();
  return (
    <MessagesData.Provider value={value}>{children}</MessagesData.Provider>
  );
}
