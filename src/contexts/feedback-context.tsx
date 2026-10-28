import type { ReactNode } from "react";
import { createStrictContext } from "@/utils/create-strict-context";
import { useRemoteData } from "@/hooks/use-remote-data";
import { apiGet } from "@/services/client";
import type { Feedback } from "@/types/content";
import { toQuery } from "@/utils/query";

export interface FeedbackQuery {
  username?: string;
  limit?: number;
}

function getFeedback(query?: FeedbackQuery) {
  return apiGet<Feedback[]>(
    `/get/feedback${toQuery(query ? { ...query } : null)}`,
  );
}

function useFeedbackValue(
  noDirectFetch?: boolean,
  contextQuery?: FeedbackQuery,
) {
  const {
    data: feedbackData,
    isLoading,
    isError,
    load: fetchFeedbackData,
  } = useRemoteData(getFeedback, {
    autoLoad: !noDirectFetch && { query: contextQuery },
  });
  return { isLoading, feedbackData, fetchFeedbackData, isError };
}

const [FeedbackData, useFeedbackContext] =
  createStrictContext<ReturnType<typeof useFeedbackValue>>("FeedbackContext");
export { useFeedbackContext };

// Loads `contextQuery` on mount unless `noDirectFetch` (the page loads it).
export default function FeedbackContextProvider({
  children,
  noDirectFetch,
  contextQuery,
}: {
  children: ReactNode;
  noDirectFetch?: boolean;
  contextQuery?: FeedbackQuery;
}) {
  const value = useFeedbackValue(noDirectFetch, contextQuery);
  return (
    <FeedbackData.Provider value={value}>{children}</FeedbackData.Provider>
  );
}
