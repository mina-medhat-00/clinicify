import type { ReactNode } from "react";
import { createStrictContext } from "@/utils/create-strict-context";
import { useRemoteData } from "@/hooks/use-remote-data";
import { apiGet } from "@/services/client";
import type { Comment } from "@/types/content";
import type { Id } from "@/types/user";
import { toQuery } from "@/utils/query";

export interface CommentsQuery {
  postId: Id;
  limit?: number;
}

function getComments(query: CommentsQuery) {
  return apiGet<Comment[]>(`/get/comments${toQuery({ ...query })}`);
}

function useCommentsValue() {
  const {
    data: commentsData,
    setData: setCommentsData,
    isLoading,
    isError,
    load: fetchCommentsData,
  } = useRemoteData(getComments, { initialLoading: false });
  return {
    isLoading,
    commentsData,
    setCommentsData,
    fetchCommentsData,
    isError,
  };
}

const [CommentsData, useCommentsContext] =
  createStrictContext<ReturnType<typeof useCommentsValue>>("CommentsContext");
export { useCommentsContext };

export default function CommentsContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const value = useCommentsValue();
  return (
    <CommentsData.Provider value={value}>{children}</CommentsData.Provider>
  );
}
