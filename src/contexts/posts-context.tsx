import axios from "axios";
import { createContext, useContext, useLayoutEffect, useState } from "react";
import type { Post } from "@/types";
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
const PostsData = createContext<any>(null);
const PostsContextProvider = ({ children, noFirstRender, query }: any) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [postsData, setPostsData] = useState<Post[] | null>(null);
  const fetchPostsData = async (
    query?: any,
    noRender?: any,
    ..._args: any[]
  ) => {
    if (!noRender) setIsLoading(true);
    try {
      const { data } = await axios.request({
        url: apiUrl(`/get/posts${handleQuery(query)}`),
        ...{
          timeout: 10000,
        },
      });
      setPostsData(() => data?.data);
      setIsError(false);
      setIsLoading(false);
      return data;
    } catch (err) {
      setIsError(true);
      setIsLoading(false);
      throw err;
    }
  };
  useLayoutEffect(() => {
    if (!noFirstRender) fetchPostsData(query);
  }, []);
  return (
    <PostsData.Provider
      value={{ isLoading, isError, postsData, fetchPostsData }}
    >
      {children}
    </PostsData.Provider>
  );
};

export default PostsContextProvider;

export const usePostsContext = () => useContext(PostsData);
