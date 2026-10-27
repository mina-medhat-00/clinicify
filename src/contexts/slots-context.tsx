import { createContext, useContext } from "react";
import { useRemoteData } from "@/contexts/use-remote-data";
import { api } from "@/services/client";
import type { SlotsData } from "@/types";

export type SlotsQuery = { date: string; doctorId: string | number };

async function getSlots(query: SlotsQuery) {
  const { data } = await api.post("/get/slots", { data: query });
  return data?.data as SlotsData;
}

const SlotsDataContext = createContext<any>(null);
export default function SlotsContextProvider({ children }: any) {
  const {
    data: slotsData,
    isLoading,
    load: fetchSlotsData,
  } = useRemoteData(getSlots);
  return (
    <SlotsDataContext.Provider value={{ isLoading, slotsData, fetchSlotsData }}>
      {children}
    </SlotsDataContext.Provider>
  );
}

export function useSlotsContext() {
  return useContext(SlotsDataContext);
}
