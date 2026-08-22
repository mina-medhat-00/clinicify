import axios from "axios";
import { createContext, useContext, useLayoutEffect, useState } from "react";
import type { Feedback } from "@/types";
import { apiUrl } from "@/utils/api";

function handleQuery(obj?: any, ..._args: any[]) {
  return !obj
    ? ""
    : Object.entries(obj)
        .filter(function ([_, val]: any) {
          return val || val === 0;
        })
        .map(function ([name, val]: any, i?: any, ..._args: any[]) {
          return i == 0 ? `?${name}=${val}` : `${name}=${val}`;
        })
        .join("&");
}
const FeedbackData = createContext<any>(null);
export default function FeedbackContextProvider({
  children,
  noDirectFetch,
  noLoading,
  contextQuery,
}: any) {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [feedbackData, setFeedbackData] = useState<Feedback[] | null>(null);
  async function fetchFeedbackData(query?: any, ..._args: any[]) {
    if (!noLoading) setIsLoading(true);
    try {
      const { data } = await axios.request({
        url: apiUrl(`/get/feedback${handleQuery(query || contextQuery)}`),
        ...{ timeout: 8000 },
      });
      setFeedbackData(data?.data);
      setIsLoading(false);
      setIsError(false);
      return data;
    } catch (err) {
      setIsError(true);
      setIsLoading(false);
    }
  }
  useLayoutEffect(function () {
    if (!noDirectFetch) fetchFeedbackData();
  }, []);
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
