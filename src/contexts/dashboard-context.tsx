import axios from "axios";
import { createContext, useContext, useLayoutEffect, useState } from "react";
import { useUserContext } from "@/contexts/user-context";
import { apiUrl } from "@/utils/api";

const DashboardData = createContext<any>(null);
export default function DashboardContextProvider({ children, token }: any) {
  const { fetchUserData } = useUserContext();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({});
  async function fetchDashboardData(
    active?: any,
    directToken?: any,
    ..._args: any[]
  ) {
    setIsLoading(true);
    if (!token && !active) {
      setDashboardData(null);
      return setIsLoading(false);
    }
    try {
      const { data } = await axios.request({
        url: apiUrl("/dashboard"),
        ...{
          headers: { Authorization: `Bearer ${active ? directToken : token}` },
          timeout: 10000,
        },
      });
      setDashboardData(data?.data);
      setIsLoading(false);
      return data;
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
          setDashboardData(null);
          break;
        case "JsonWebTokenError":
          setDashboardData(null);
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
          setDashboardData(null);
          break;
      }
      setIsLoading(false);
    }
  }
  useLayoutEffect(function () {
    fetchDashboardData();
  }, []);
  return (
    <DashboardData.Provider
      value={{
        isLoading,
        dashboardData,
        fetchDashboardData,
        setDashboardData,
      }}
    >
      {children}
    </DashboardData.Provider>
  );
}

export function useDashboardContext() {
  return useContext(DashboardData);
}
