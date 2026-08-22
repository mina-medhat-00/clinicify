import axios from "axios";
import { createContext, useContext, useState } from "react";
import Cookies from "universal-cookie";
import type { ChatMessage } from "@/types";
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
const cookies = new Cookies();
const MessagesData = createContext<any>(null);
function MessagesContextProvider({ children, fetchUserData }: any) {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [messagesData, setMessagesData] = useState<ChatMessage[] | null>(null);
  async function fetchMessagesData(
    token?: any,
    query?: any,
    noRender?: any,
    ..._args: any[]
  ) {
    if (!noRender) setIsLoading(true);
    try {
      const { data } = await axios.request({
        url: apiUrl(`/get/messages${handleQuery(query)}`),
        ...{
          timeout: 10000,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cookies?.get("accessToken")}`,
          },
        },
      });
      setMessagesData(function () {
        return data?.data;
      });
      setIsError(false);
      setIsLoading(false);
      return data;
    } catch (err) {
      const msg = err?.response?.data?.data?.name;
      setIsError(true);
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
          break;
      }
      setIsLoading(false);
      throw err;
    }
  }

  return (
    <MessagesData.Provider
      value={{ isLoading, messagesData, fetchMessagesData, isError }}
    >
      {children}
    </MessagesData.Provider>
  );
}

export default MessagesContextProvider;

export function useMessagesContext() {
  return useContext(MessagesData);
}
