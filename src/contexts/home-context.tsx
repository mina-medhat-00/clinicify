import { createContext, useContext } from "react";
import { useRemoteData } from "@/contexts/use-remote-data";
import { api } from "@/services/client";

async function getStatistics() {
  const { data } = await api.get("/general/statistics");
  return data?.data;
}

const HomeData = createContext<any>(null);
export default function HomeContextProvider({ children }: any) {
  const { data: homeData, isLoading } = useRemoteData(getStatistics, {
    autoLoad: {},
  });
  return (
    <HomeData.Provider value={{ isLoading, homeData }}>
      {children}
    </HomeData.Provider>
  );
}

export function useHomeContext() {
  return useContext(HomeData);
}
