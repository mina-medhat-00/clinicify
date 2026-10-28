import type { ReactNode } from "react";
import { createStrictContext } from "@/utils/create-strict-context";
import { useRemoteData } from "@/hooks/use-remote-data";
import { apiGet } from "@/services/client";
import type { Post } from "@/types/content";
import { toQuery } from "@/utils/query";

export interface PostsQuery {
  limit?: number;
}

function getPosts(query?: PostsQuery) {
  return apiGet<Post[]>(`/get/posts${toQuery(query ? { ...query } : null)}`);
}

function usePostsValue(query?: PostsQuery, noFirstRender?: boolean) {
  const {
    data: postsData,
    isLoading,
    isError,
    load: fetchPostsData,
  } = useRemoteData(getPosts, { autoLoad: !noFirstRender && { query } });
  return { isLoading, isError, postsData, fetchPostsData };
}

const [PostsData, usePostsContext] =
  createStrictContext<ReturnType<typeof usePostsValue>>("PostsContext");
export { usePostsContext };

export default function PostsContextProvider({
  children,
  noFirstRender,
  query,
}: {
  children: ReactNode;
  noFirstRender?: boolean;
  query?: PostsQuery;
}) {
  const value = usePostsValue(query, noFirstRender);
  return <PostsData.Provider value={value}>{children}</PostsData.Provider>;
}
