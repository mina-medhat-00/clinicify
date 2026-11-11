import type { ReactNode } from "react";
import { createStrictContext } from "@/utils/create-strict-context";
import { useRemoteData } from "@/hooks/use-remote-data";
import { apiGet } from "@/services/client";
import type { Doctor } from "@/types/user";
import { toQuery } from "@/utils/query";
import type { DoctorsQuery } from "@/types/queries";

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

// query loads on mount unless noFirstRender leaves loading to the page
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
