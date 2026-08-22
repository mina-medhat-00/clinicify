import axios from "axios";
import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useState,
} from "react";
import type { Post } from "@/types";
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
const PostsData = createContext<any>(null);
export default function PostsContextProvider({
  children,
  noFirstRender,
  query,
}: any) {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [postsData, setPostsData] = useState<Post[] | null>(null);
  const queryKey = JSON.stringify(query ?? null);
  const fetchPostsData = useCallback(async function (
    query?: any,
    noRender?: any,
  ) {
    await Promise.resolve();
    if (!noRender) setIsLoading(true);
    try {
      const { data } = await axios.request({
        url: apiUrl(`/get/posts${handleQuery(query)}`),
        ...{
          timeout: 10000,
        },
      });
      setPostsData(function () {
        return data?.data;
      });
      setIsError(false);
      setIsLoading(false);
      return data;
    } catch (err) {
      setIsError(true);
      setIsLoading(false);
      throw err;
    }
  }, []);
  useLayoutEffect(
    function () {
      if (noFirstRender) return;
      const timeId = setTimeout(function () {
        fetchPostsData(
          queryKey === "null" ? undefined : JSON.parse(queryKey),
          true,
        );
      });
      return function () {
        clearTimeout(timeId);
      };
    },
    [fetchPostsData, noFirstRender, queryKey],
  );
  return (
    <PostsData.Provider
      value={{ isLoading, isError, postsData, fetchPostsData }}
    >
      {children}
    </PostsData.Provider>
  );
}

export function usePostsContext() {
  return useContext(PostsData);
}
