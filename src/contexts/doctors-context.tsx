import { createContext, useContext } from "react";
import { useRemoteData } from "@/contexts/use-remote-data";
import { api } from "@/services/client";
import type { User } from "@/types";
import { toQuery } from "@/utils/query";

export type DoctorsQuery = {
  // Include unverified doctors (admin).
  total?: boolean;
  limit?: number;
  specialty?: string;
  dname?: string;
  location?: string;
};

async function getDoctors(query?: DoctorsQuery) {
  const { data } = await api.get(`/doctors${toQuery(query)}`);
  return data?.data as User[];
}

const DoctorsData = createContext<any>(null);
// `query` loads on mount; `noFirstRender` leaves loading to the page (the
// search filter on /doctors).
export default function DoctorsContextProvider({
  children,
  query,
  noFirstRender,
}: any) {
  const {
    data: doctorsData,
    isLoading,
    isError,
    load: fetchDoctorsData,
  } = useRemoteData(getDoctors, { autoLoad: !noFirstRender && { query } });
  return (
    <DoctorsData.Provider
      value={{ isLoading, isError, doctorsData, fetchDoctorsData }}
    >
      {children}
    </DoctorsData.Provider>
  );
}

export function useDoctorsContext() {
  return useContext(DoctorsData);
}
