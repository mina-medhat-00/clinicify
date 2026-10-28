import { Empty } from "@/components/ui/display";
import { useState } from "react";
import ProfileTable from "@/components/profile/profile-table";
import { useReportContext } from "@/contexts/report-context";

const DAY = 1000 * 60 * 60 * 24;

export default function ReportDetails() {
  const { reports: reportDetailsData, isLoading } = useReportContext();
  // Ages are measured from when the list was opened.
  const [now] = useState(Date.now);
  return (
    <div>
      {isLoading || reportDetailsData?.length ? (
        <ProfileTable
          loadingProps={{
            active: isLoading,
          }}
          headers={["Report Cause", "Issue"]}
          data={reportDetailsData?.map(function ({
            report_type,
            issue,
            issued_time,
          }) {
            return {
              name: report_type,
              value: (
                <div className="w-full flex justify-between gap-2">
                  <div>{issue}</div>
                  <div className="font-bold text-blue-500">
                    {Math.floor((now - new Date(issued_time).getTime()) / DAY)}{" "}
                    days ago
                  </div>
                </div>
              ),
            };
          })}
        />
      ) : (
        <Empty
          description={
            <span className="flex flex-col items-center font-medium">
              There's no Reports Provided
            </span>
          }
        />
      )}
    </div>
  );
}
