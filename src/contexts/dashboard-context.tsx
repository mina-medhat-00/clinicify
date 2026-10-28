import type { ReactNode } from "react";
import { createStrictContext } from "@/utils/create-strict-context";
import { useRemoteData } from "@/hooks/use-remote-data";
import { apiGet } from "@/services/client";
import type { Dashboard } from "@/types/content";

function getDashboard() {
  return apiGet<Dashboard>("/dashboard");
}

function useDashboardValue() {
  const {
    data: dashboardData,
    setData: setDashboardData,
    isLoading,
    load: fetchDashboardData,
  } = useRemoteData(getDashboard, { requiresAuth: true, autoLoad: {} });
  return { isLoading, dashboardData, fetchDashboardData, setDashboardData };
}

const [DashboardData, useDashboardContext] =
  createStrictContext<ReturnType<typeof useDashboardValue>>("DashboardContext");
export { useDashboardContext };

export default function DashboardContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const value = useDashboardValue();
  return (
    <DashboardData.Provider value={value}>{children}</DashboardData.Provider>
  );
}
