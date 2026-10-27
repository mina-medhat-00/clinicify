import { createContext, useContext } from "react";
import { useRemoteData } from "@/contexts/use-remote-data";
import { api } from "@/services/client";

async function getDashboard() {
  const { data } = await api.get("/dashboard");
  return data?.data;
}

const DashboardData = createContext<any>(null);
export default function DashboardContextProvider({ children }: any) {
  const {
    data: dashboardData,
    setData: setDashboardData,
    isLoading,
    load: fetchDashboardData,
  } = useRemoteData(getDashboard, { requiresAuth: true, autoLoad: {} });
  return (
    <DashboardData.Provider
      value={{ isLoading, dashboardData, fetchDashboardData, setDashboardData }}
    >
      {children}
    </DashboardData.Provider>
  );
}

export function useDashboardContext() {
  return useContext(DashboardData);
}
