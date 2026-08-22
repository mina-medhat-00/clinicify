import axios from "axios";
import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useState,
} from "react";
import type { Feedback } from "@/types";
import { apiUrl } from "@/utils/api";

function handleQuery(obj?: any) {
  return !obj
    ? ""
    : Object.entries(obj)
        .filter(function ([_, val]: any) {
          return val || val === 0;
        })
        .map(function ([name, val]: any, i?: any) {
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
  const contextQueryKey = JSON.stringify(contextQuery ?? null);
  const fetchFeedbackData = useCallback(
    async function (query?: any) {
      await Promise.resolve();
      if (!noLoading) setIsLoading(true);
      try {
        const { data } = await axios.request({
          url: apiUrl(
            `/get/feedback${handleQuery(
              query ||
                (contextQueryKey === "null"
                  ? undefined
                  : JSON.parse(contextQueryKey)),
            )}`,
          ),
          ...{ timeout: 8000 },
        });
        setFeedbackData(data?.data);
        setIsLoading(false);
        setIsError(false);
        return data;
      } catch {
        setIsError(true);
        setIsLoading(false);
      }
    },
    [noLoading, contextQueryKey],
  );
  useLayoutEffect(
    function () {
      if (noDirectFetch) return;
      const timeId = setTimeout(function () {
        fetchFeedbackData();
      });
      return function () {
        clearTimeout(timeId);
      };
    },
    [fetchFeedbackData, noDirectFetch],
  );
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
