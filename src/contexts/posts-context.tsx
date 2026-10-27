import { createContext, useContext } from "react";
import { useRemoteData } from "@/contexts/use-remote-data";
import { api } from "@/services/client";
import type { Post } from "@/types";
import { toQuery } from "@/utils/query";

export type PostsQuery = { limit?: number };

async function getPosts(query?: PostsQuery) {
  const { data } = await api.get(`/get/posts${toQuery(query)}`);
  return data?.data as Post[];
}

const PostsData = createContext<any>(null);
export default function PostsContextProvider({
  children,
  noFirstRender,
  query,
}: any) {
  const {
    data: postsData,
    isLoading,
    isError,
    load: fetchPostsData,
  } = useRemoteData(getPosts, { autoLoad: !noFirstRender && { query } });
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
