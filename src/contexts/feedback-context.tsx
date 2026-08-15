import axios from "axios";
import { createContext, useContext, useLayoutEffect, useState } from "react";
import type { Feedback } from "@/types";
import { apiUrl } from "@/utils/api";

const handleQuery = (obj?: any, ..._args: any[]) =>
  !obj
    ? ""
    : Object.entries(obj)
        .filter(([_, val]: any) => val || val === 0)
        .map(([name, val]: any, i?: any, ..._args: any[]) =>
          i == 0 ? `?${name}=${val}` : `${name}=${val}`,
        )
        .join("&");
const FeedbackData = createContext<any>(null);
const FeedbackContextProvider = ({
  children,
  noDirectFetch,
  noLoading,
  contextQuery,
}: any) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [feedbackData, setFeedbackData] = useState<Feedback[] | null>(null);
  const fetchFeedbackData = async (query?: any, ..._args: any[]) => {
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
  };
  useLayoutEffect(() => {
    if (!noDirectFetch) fetchFeedbackData();
  }, []);
  return (
    <FeedbackData.Provider
      value={{ isLoading, feedbackData, fetchFeedbackData, isError }}
    >
      {children}
    </FeedbackData.Provider>
  );
};

export default FeedbackContextProvider;

export const useFeedbackContext = () => useContext(FeedbackData);
