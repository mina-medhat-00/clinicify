import { message } from "antd";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import type { AuthTokenPayload, User } from "@/types";
import { createContext, useContext, useLayoutEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";
import { apiUrl } from "@/utils/api";

const UserData = createContext<any>(null);
const UserContextProvider = ({ children, token }: any) => {
  const [isLoading, setIsLoading] = useState(true);
  const [tokenExpired, setTokenExpired] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [messageApi, contextHolder] = message.useMessage();
  const [userData, setUserData] = useState<User | null>(null);
  const [isError, setIsError] = useState(false);
  const fetchUserData = async (
    active?: any,
    directToken?: any,
    directError?: any,
    noRender?: any,
    ..._args: any[]
  ) => {
    if (!noRender) setIsLoading(true);
    if (!token && !directToken) {
      setUserData(null);
      return setIsLoading(false);
    }
    try {
      if (directError) throw directError;
      const { data } = await axios.request({
        url: apiUrl("/user"),
        ...{
          headers: { Authorization: `Bearer ${active ? directToken : token}` },
          timeout: 10000,
        },
      });
      setUserData(data?.data);
      setIsLoading(false);
      setIsError(false);
      return data;
    } catch (err) {
      const msg = err?.response?.data?.data?.name;
      switch (msg) {
        case "TokenExpiredError": {
          let userData;
          setUserData((dat?: any, ..._args: any[]) => {
            userData = dat;
            return dat;
          });
          if (userData && !location?.pathname.includes("login")) {
            setTokenExpired(true);
            messageApi.open({
              key: 1,
              type: "error",
              content: "your time has expired, redirecting to login page ...",
              duration: 3,
            });
            setTimeout(() => {
              setUserData(null);
              navigate(`/login?redirect=${location?.pathname}`);
            }, 3000);
          }
          const cookie = new Cookies();
          cookie.remove("accessToken");
          break;
        }
        case "JsonWebTokenError":
          setUserData(null);
          break;
        default:
          setIsError(true);
          setUserData(null);
          break;
      }
      setIsLoading(false);
    }
  };
  useLayoutEffect(() => {
    fetchUserData(true, new Cookies().get("accessToken"));
  }, []);
  useLayoutEffect(() => {
    const accessToken = new Cookies().get("accessToken");
    if (!accessToken) return;
    let timeId;
    const handleExpired = async () => {
      try {
        const record = jwtDecode<AuthTokenPayload>(accessToken);
        timeId = setTimeout(
          () => {
            fetchUserData(true, new Cookies().get("accessToken"), null, true);
          },
          Math.abs(+(record?.exp + "000") - Date.now()),
        );
      } catch {
        return;
      }
    };
    handleExpired();
    return () => {
      clearTimeout(timeId);
    };
  }, [new Cookies().get("accessToken")]);
  return (
    <UserData.Provider
      value={{
        isLoading,
        userData,
        fetchUserData,
        setUserData,
        isError,
        tokenExpired,
        messageApi,
      }}
    >
      {children}
      {contextHolder}
    </UserData.Provider>
  );
};

export default UserContextProvider;

export const useUserContext = () => useContext(UserData);
