import { createContext, useCallback, useContext } from "react";
import { useRemoteData } from "@/contexts/use-remote-data";
import { api } from "@/services/client";
import type { Report } from "@/types";
import { toQuery } from "@/utils/query";

const ReportData = createContext<any>(null);
// Without `reportFrom`: every report (admin list). With it: one user's reports.
export default function ReportContextProvider({ children, reportFrom }: any) {
  const getReports = useCallback(
    async function () {
      const { data } = await api.get(
        reportFrom
          ? `/get/details/report${toQuery({ reportFrom })}`
          : "/get/reports",
      );
      return data?.data as Report[];
    },
    [reportFrom],
  );
  const {
    data: reportData,
    isLoading,
    isError,
    load: fetchReportData,
  } = useRemoteData(getReports, { requiresAuth: true, autoLoad: {} });
  return (
    <ReportData.Provider
      value={{ isLoading, reportData, isError, fetchReportData }}
    >
      {children}
    </ReportData.Provider>
  );
}

export function useReportContext() {
  return useContext(ReportData);
}
