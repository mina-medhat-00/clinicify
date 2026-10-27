import { createContext, useContext } from "react";
import { useRemoteData } from "@/contexts/use-remote-data";
import { api } from "@/services/client";
import type { Comment } from "@/types";
import { toQuery } from "@/utils/query";

export type CommentsQuery = { postId: string | number; limit?: number };

async function getComments(query: CommentsQuery) {
  const { data } = await api.get(`/get/comments${toQuery(query)}`);
  return data?.data as Comment[];
}

const CommentsData = createContext<any>(null);
export default function CommentsContextProvider({ children }: any) {
  const {
    data: commentsData,
    setData: setCommentsData,
    isLoading,
    isError,
    load: fetchCommentsData,
  } = useRemoteData(getComments, { initialLoading: false });
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
