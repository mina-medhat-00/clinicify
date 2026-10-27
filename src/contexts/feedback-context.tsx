import { createContext, useContext } from "react";
import { useRemoteData } from "@/contexts/use-remote-data";
import { api } from "@/services/client";
import type { Feedback } from "@/types";
import { toQuery } from "@/utils/query";

export type FeedbackQuery = { username?: string | number; limit?: number };

async function getFeedback(query?: FeedbackQuery) {
  const { data } = await api.get(`/get/feedback${toQuery(query)}`);
  return data?.data as Feedback[];
}

const FeedbackData = createContext<any>(null);
// Loads `contextQuery` on mount unless `noDirectFetch` (the page loads it).
export default function FeedbackContextProvider({
  children,
  noDirectFetch,
  contextQuery,
}: any) {
  const {
    data: feedbackData,
    isLoading,
    isError,
    load: fetchFeedbackData,
  } = useRemoteData(getFeedback, {
    autoLoad: !noDirectFetch && { query: contextQuery },
  });
  return (
    <FeedbackData.Provider
      value={{ isLoading, feedbackData, fetchFeedbackData, isError }}
    >
      {children}
    </FeedbackData.Provider>
  );
}

export function useFeedbackContext() {
  return useContext(FeedbackData);
}
