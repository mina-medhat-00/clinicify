import axios from "axios";
import { createContext, useCallback, useContext, useState } from "react";
import type { Comment } from "@/types";
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
const CommentsData = createContext<any>(null);
export default function CommentsContextProvider({ children }: any) {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [commentsData, setCommentsData] = useState<Comment[] | null>(null);
  const fetchCommentsData = useCallback(async function (
    query?: any,
    noRender?: any,
  ) {
    await Promise.resolve();
    if (!noRender) setIsLoading(true);
    try {
      const { data } = await axios.request({
        url: apiUrl(`/get/comments${handleQuery(query)}`),
        ...{
          timeout: 10000,
        },
      });
      setCommentsData(function () {
        return data?.data;
      });
      setIsError(false);
      setIsLoading(false);
      return data;
    } catch (err) {
      setIsLoading(false);
      setIsError(true);
      throw err;
    }
  }, []);

  return (
    <CommentsData.Provider
      value={{
        isLoading,
        commentsData,
        setCommentsData,
        fetchCommentsData,
        isError,
      }}
    >
      {children}
    </CommentsData.Provider>
  );
}

export function useCommentsContext() {
  return useContext(CommentsData);
}
