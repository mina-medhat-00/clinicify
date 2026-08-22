import axios from "axios";
import { createContext, useContext, useState } from "react";
import { useUserContext } from "@/contexts/user-context";
import type { ChatThread } from "@/types";
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
const ChatData = createContext<any>(null);
function ChatContextProvider({ children, token }: any) {
  const { fetchUserData } = useUserContext();
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [chatData, setChatData] = useState<ChatThread[] | null>(null);
  async function fetchChatData(
    active?: any,
    directToken?: any,
    query?: any,
    noWaiting?: any,
    ..._args: any[]
  ) {
    if (!noWaiting) setIsLoading(true);
    if (!token && !active) {
      setChatData(null);
      return setIsLoading(false);
    }
    try {
      const { data } = await axios.request({
        url: apiUrl(`/get/chat${handleQuery(query)}`),
        ...{
          headers: {
            Authorization: `Bearer ${active ? directToken : token}`,
          },
        },
      });
      setChatData(data?.data);
      setIsError(false);
      setIsLoading(false);
    } catch (err) {
      const msg = err?.response?.data?.data?.name;
      switch (msg) {
        case "TokenExpiredError":
          fetchUserData(true, null, {
            response: {
              data: {
                data: {
                  name: "TokenExpiredError",
                },
              },
            },
          });
          break;
        case "JsonWebTokenError":
          setChatData(null);
          fetchUserData(true, null, {
            response: {
              data: {
                data: {
                  name: "JsonWebTokenError",
                },
              },
            },
          });
          break;
        default:
          setIsError(true);
          setChatData(null);
          break;
      }
      setIsLoading(false);
      throw err;
    }
  }

  return (
    <ChatData.Provider
      value={{
        isLoading,
        isError,
        chatData,
        fetchChatData,
        setChatData,
      }}
    >
      {children}
    </ChatData.Provider>
  );
}

export default ChatContextProvider;

export function useChatContext() {
  return useContext(ChatData);
}
