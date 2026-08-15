import axios from "axios";
import { createContext, useState, useContext } from "react";
import { useUserContext } from "@/hooks/UserContextProvider";

const handleQuery = (obj?: any, ..._args: any[]) =>
  !obj
    ? ""
    : Object.entries(obj)
        .filter(([_, val]: any) => val || val === 0)
        .map(([name, val]: any, i?: any, ..._args: any[]) =>
          i == 0 ? `?${name}=${val}` : `${name}=${val}`,
        )
        .join("&");
const ChatData = createContext<any>(null);
const ChatContextProvider = ({ children, token }: any) => {
  const { fetchUserData } = useUserContext();
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [chatData, setChatData] = useState(null);
  const host = window?.location?.hostname;
  const fetchChatData = async (active?: any, directToken?: any, query?: any, noWaiting?: any, ..._args: any[]) => {
    if (!noWaiting) setIsLoading(true);
    if (!token && !active) {
      setChatData(null);
      return setIsLoading(false);
    }
    try {
      const { data } = await axios.request({ url: `http://${host}:5000/get/chat${handleQuery(query)}`, ...{
          headers: {
            Authorization: `Bearer ${active ? directToken : token}`,
          },
        } });
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
  };

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
};

export default ChatContextProvider;

export const useChatContext = () => useContext(ChatData);
