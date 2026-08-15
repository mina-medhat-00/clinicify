import axios from "axios";
import { createContext, useContext, useState } from "react";
import Cookies from "universal-cookie";
import type { ChatMessage } from "@/types";

const handleQuery = (obj?: any, ..._args: any[]) =>
  !obj
    ? ""
    : Object.entries(obj)
        .filter(([_, val]: any) => val || val === 0)
        .map(([name, val]: any, i?: any, ..._args: any[]) =>
          i == 0 ? `?${name}=${val}` : `${name}=${val}`,
        )
        .join("&");
const cookies = new Cookies();
const MessagesData = createContext<any>(null);
const MessagesContextProvider = ({ children, fetchUserData }: any) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [messagesData, setMessagesData] = useState<ChatMessage[] | null>(null);
  const host = window?.location?.hostname;
  const fetchMessagesData = async (
    token?: any,
    query?: any,
    noRender?: any,
    ..._args: any[]
  ) => {
    if (!noRender) setIsLoading(true);
    try {
      const { data } = await axios.request({
        url: `http://${host}:5000/get/messages${handleQuery(query)}`,
        ...{
          timeout: 10000,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cookies?.get("accessToken")}`,
          },
        },
      });
      setMessagesData(() => data?.data);
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
  };

  return (
    <MessagesData.Provider
      value={{ isLoading, messagesData, fetchMessagesData, isError }}
    >
      {children}
    </MessagesData.Provider>
  );
};

export default MessagesContextProvider;

export const useMessagesContext = () => useContext(MessagesData);
