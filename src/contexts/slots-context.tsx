import type { ReactNode } from "react";
import { createStrictContext } from "@/utils/create-strict-context";
import { useRemoteData } from "@/hooks/use-remote-data";
import { apiPost } from "@/services/client";
import "@/types/user";
import type { SlotsData } from "@/types/appointment";
import type { SlotsQuery } from "@/types/queries";

function getSlots(query: SlotsQuery) {
  return apiPost<SlotsData>("/get/slots", { data: query });
}

function useSlotsValue() {
  const {
    data: slotsData,
    isLoading,
    load: fetchSlotsData,
  } = useRemoteData(getSlots, {});
  return { isLoading, slotsData, fetchSlotsData };
}

const [SlotsData, useSlotsContext] =
  createStrictContext<ReturnType<typeof useSlotsValue>>("SlotsContext");
export { useSlotsContext };

export default function SlotsContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const value = useSlotsValue();
  return <SlotsData.Provider value={value}>{children}</SlotsData.Provider>;
}
