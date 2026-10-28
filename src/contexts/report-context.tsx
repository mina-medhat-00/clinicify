import { useCallback, type ReactNode } from "react";
import { createStrictContext } from "@/utils/create-strict-context";
import { useRemoteData } from "@/hooks/use-remote-data";
import { apiGet } from "@/services/client";
import type { Id } from "@/types/user";
import type { Report, ReportSummary } from "@/types/content";
import { toQuery } from "@/utils/query";

// Without `reportFrom`: one summary row per reporting user (admin list).
// With it: that user's reports.
type ReportsResult =
  | { kind: "summaries"; rows: ReportSummary[] }
  | { kind: "reports"; rows: Report[] };

function useReportValue(reportFrom?: Id) {
  const getReports = useCallback(
    async function (): Promise<ReportsResult> {
      if (reportFrom === undefined)
        return {
          kind: "summaries",
          rows: await apiGet<ReportSummary[]>("/get/reports"),
        };
      return {
        kind: "reports",
        rows: await apiGet<Report[]>(
          `/get/details/report${toQuery({ reportFrom })}`,
        ),
      };
    },
    [reportFrom],
  );
  const {
    data,
    isLoading,
    isError,
    load: fetchReportData,
  } = useRemoteData(getReports, { requiresAuth: true, autoLoad: {} });
  return {
    isLoading,
    isError,
    fetchReportData,
    summaries: data?.kind === "summaries" ? data.rows : null,
    reports: data?.kind === "reports" ? data.rows : null,
  };
}

const [ReportData, useReportContext] =
  createStrictContext<ReturnType<typeof useReportValue>>("ReportContext");
export { useReportContext };

export default function ReportContextProvider({
  children,
  reportFrom,
}: {
  children: ReactNode;
  reportFrom?: Id;
}) {
  const value = useReportValue(reportFrom);
  return <ReportData.Provider value={value}>{children}</ReportData.Provider>;
}
