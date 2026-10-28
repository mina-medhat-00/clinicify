import type { ReactNode } from "react";
import { createStrictContext } from "@/utils/create-strict-context";
import { useRemoteData } from "@/hooks/use-remote-data";
import { apiGet } from "@/services/client";
import type { HomeStatistics } from "@/types/content";

function getStatistics() {
  return apiGet<HomeStatistics>("/general/statistics");
}

function useHomeValue() {
  const { data: homeData, isLoading } = useRemoteData(getStatistics, {
    autoLoad: {},
  });
  return { isLoading, homeData };
}

const [HomeData, useHomeContext] =
  createStrictContext<ReturnType<typeof useHomeValue>>("HomeContext");
export { useHomeContext };

export default function HomeContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const value = useHomeValue();
  return <HomeData.Provider value={value}>{children}</HomeData.Provider>;
}
