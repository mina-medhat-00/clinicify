import type { ReactNode } from "react";
import { createStrictContext } from "@/utils/create-strict-context";
import { useRemoteData } from "@/hooks/use-remote-data";
import { apiGet } from "@/services/client";
import type { Doctor } from "@/types/user";
import { toQuery } from "@/utils/query";

export interface DoctorsQuery {
  // Include unverified doctors (admin).
  total?: boolean;
  limit?: number;
  specialty?: string;
  dname?: string;
  location?: string;
}

function getDoctors(query?: DoctorsQuery) {
  return apiGet<Doctor[]>(`/doctors${toQuery(query ? { ...query } : null)}`);
}

function useDoctorsValue(query?: DoctorsQuery, noFirstRender?: boolean) {
  const {
    data: doctorsData,
    isLoading,
    isError,
    load: fetchDoctorsData,
  } = useRemoteData(getDoctors, { autoLoad: !noFirstRender && { query } });
  return { isLoading, isError, doctorsData, fetchDoctorsData };
}

const [DoctorsData, useDoctorsContext] =
  createStrictContext<ReturnType<typeof useDoctorsValue>>("DoctorsContext");
export { useDoctorsContext };

// `query` loads on mount; `noFirstRender` leaves loading to the page (the
// search filter on /doctors).
export default function DoctorsContextProvider({
  children,
  query,
  noFirstRender,
}: {
  children: ReactNode;
  query?: DoctorsQuery;
  noFirstRender?: boolean;
}) {
  const value = useDoctorsValue(query, noFirstRender);
  return <DoctorsData.Provider value={value}>{children}</DoctorsData.Provider>;
}
